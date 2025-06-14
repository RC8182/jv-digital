// src/app/api/agente/contabilidad/gastos/route.js

import { NextResponse }   from 'next/server';
import { randomUUID, createHash } from 'crypto';
import 'pdfjs-dist/legacy/build/pdf.worker.js';
import { getServerSession } from 'next-auth';
import { authOptions }    from '@/app/api/auth/[...nextauth]/route';
import prisma             from '@/lib/prisma';
import fs                 from 'node:fs/promises';
import path               from 'node:path';
import { getOpenAI } from '@/lib/openai.js';

import { extractText, splitText } from '@/app/api/agente/utils/pdfExtractor.js';
import { uploadExpensePdfToQdrant, EXPENSES_COLLECTION_NAME } from '@/app/api/agente/utils/qdrantExpenses.js';

export const runtime = 'nodejs';

/* ─── POST /api/agente/contabilidad/gastos ───────────────────────────────── */
export async function POST(req) {
  const openai = await getOpenAI();
  try {
    // 1 · Verificar sesión de usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2 · Leer PDF desde form-data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Se requiere un PDF válido.' }, { status: 400 });
    }

    // 3 · Convertir a Buffer y calcular hash SHA-256
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    const hash = createHash('sha256').update(pdfBuffer).digest('hex');

    // 4 · Detectar duplicado
    const existing = await prisma.expense.findFirst({
      where: { userId, fileHash: hash }
    });
    if (existing) {
      return NextResponse.json({
        error: 'duplicado',
        message: 'Este PDF ya fue subido anteriormente.',
        existingExpenseId: existing.id
      }, { status: 409 });
    }

    // 5 · Guardar el PDF en disco
    const docId = randomUUID();
    const UPLOAD_DIR = path.join(process.cwd(), 'public', 'expenses_docs');
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filenameOnDisk = `${docId}_${file.name}`;
    const filePathRelative = `/expenses_docs/${filenameOnDisk}`;
    const absoluteFilePath = path.join(UPLOAD_DIR, filenameOnDisk);
    await fs.writeFile(absoluteFilePath, pdfBuffer);

    // 6 · Crear registro inicial en BD con status "en_proceso"
    const createdExpense = await prisma.expense.create({
      data: {
        userId,
        filename: file.name,
        docId,
        filePath: filePathRelative,
        fileHash: hash,
        processingStatus: 'en_proceso'
        // epigrafeIAE: []  ← se llenará más tarde
      }
    });

    // 7 · Extraer texto del PDF
    let fullText = '';
    try {
      fullText = await extractText(pdfBuffer);
      if (!fullText.trim()) throw new Error('No se extrajo texto del PDF.');
    } catch (extractErr) {
      await prisma.expense.update({
        where: { id: createdExpense.id },
        data: {
          processingStatus: 'error',
          processingError: `Error al extraer texto: ${extractErr.message}`
        }
      });
      return NextResponse.json({
        error: 'processing_error',
        message: 'No se pudo extraer texto del PDF.',
        details: extractErr.message
      }, { status: 500 });
    }

    // 8 · Extraer metadatos + EPÍGRAFES con LLM
    
    let extractedData = {
      supplier:    null,
      date:        null,
      baseAmount:  null,
      taxAmount:   null,
      totalAmount: null,
      epigrafeIAE: []   // ahora es un arreglo
    };

    try {
      const llmResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extrae la siguiente información de un documento de gasto. Si un campo no se encuentra, devuélvelo como null.
- supplier: nombre del proveedor (string|null)
- date: fecha del gasto en formato YYYY-MM-DD (string|null)
- baseAmount: base imponible (float|null)
- taxAmount: monto de impuestos (float|null)
- totalAmount: total del gasto (float|null)
- epigrafeIAE: arreglo con código(s) de epígrafe IAE más apropiado(s) (string[]).  
  Opciones basadas en el perfil:
  - 763: Programadores y antalistas informática
  - 599: Otros profecionales relacionados con el comercio
  - 844: Publicidad y relaciones públicas
  - 659.6: Comercio al por menor de aparatos e informática
  - 691.2: Reparación de equipos informáticos
  - 899: Otros servicios independientes n.c.o.p.
  Si detectas más de un epígrafe válido, devuélvelos como un array. Si no lo puedes determinar, devuelve [].

Formato JSON de salida:
{
  "supplier": string | null,
  "date": "YYYY-MM-DD" | null,
  "baseAmount": number | null,
  "taxAmount": number | null,
  "totalAmount": number | null,
  "epigrafeIAE": string[]  // p. ej. ["763","599"] o []
}`
          },
          {
            role: "user",
            content: `Documento de gasto:\n\n${fullText}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      });

      const parsed = JSON.parse(llmResponse.choices[0].message.content);

      extractedData = {
        supplier:    parsed.supplier || null,
        date:        (parsed.date && !isNaN(new Date(parsed.date))) ? parsed.date : null,
        baseAmount:  typeof parsed.baseAmount === 'number' ? parsed.baseAmount : null,
        taxAmount:   typeof parsed.taxAmount === 'number' ? parsed.taxAmount : null,
        totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : null,
        epigrafeIAE: Array.isArray(parsed.epigrafeIAE) 
                       ? parsed.epigrafeIAE 
                       : (parsed.epigrafeIAE ? [parsed.epigrafeIAE] : [])
      };
    } catch (llmErr) {
      await prisma.expense.update({
        where: { id: createdExpense.id },
        data: {
          processingStatus: 'error',
          processingError: `Error al extraer datos con LLM: ${llmErr.message}`
        }
      });
      return NextResponse.json({
        error: 'processing_error',
        message: 'No se pudieron extraer metadatos con el LLM.',
        details: llmErr.message
      }, { status: 500 });
    }

    // 9 · Indexar en Qdrant (incluyendo epígrafes en payload)
    try {
      const success = await uploadExpensePdfToQdrant(pdfBuffer, file.name, docId, extractedData);
      if (!success) throw new Error('uploadExpensePdfToQdrant devolvió false.');
    } catch (qdrantErr) {
      await prisma.expense.update({
        where: { id: createdExpense.id },
        data: {
          processingStatus: 'error',
          processingError: `Error al indexar en Qdrant: ${qdrantErr.message}`
        }
      });
      return NextResponse.json({
        error: 'processing_error',
        message: 'No se pudo indexar el PDF en Qdrant.',
        details: qdrantErr.message
      }, { status: 500 });
    }

    // 10 · Guardar metadatos + EPÍGRAFES en BD
    try {
      await prisma.expense.update({
        where: { id: createdExpense.id },
        data: {
          supplier:     extractedData.supplier,
          date:         extractedData.date ? new Date(extractedData.date) : null,
          baseAmount:   extractedData.baseAmount,
          taxAmount:    extractedData.taxAmount,
          totalAmount:  extractedData.totalAmount,
          epigrafeIAE:  extractedData.epigrafeIAE,
          processingStatus: 'listo'
        }
      });
    } catch (updateErr) {
      await prisma.expense.update({
        where: { id: createdExpense.id },
        data: {
          processingStatus: 'error',
          processingError: `Error al guardar metadatos en BD: ${updateErr.message}`
        }
      });
      return NextResponse.json({
        error: 'processing_error',
        message: 'No se pudieron guardar los metadatos extraídos en la BD.',
        details: updateErr.message
      }, { status: 500 });
    }

    // 11 · Responder OK
    return NextResponse.json({
      status: 'ok',
      expenseId: createdExpense.id,
      filePath: filePathRelative,
      extractedData
    });
  } catch (err) {
    console.error('POST /api/agente/contabilidad/gastos error:', err);
    return NextResponse.json(
      { error: 'internal', details: err.message },
      { status: 500 }
    );
  }
}


/* ─── GET /api/agente/contabilidad/gastos ───────────────────────────────── */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const list = await prisma.expense.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        docId: true,
        filePath: true,
        createdAt: true,
        supplier: true,
        date: true,
        baseAmount: true,
        taxAmount: true,
        totalAmount: true,
        fileHash: true,
        processingStatus: true,
        processingError: true,
        epigrafeIAE: true   // ahora devolvemos el arreglo
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ expenses: list });
  } catch (err) {
    console.error('GET /api/agente/contabilidad/gastos error:', err);
    return NextResponse.json({ error: 'internal', details: err.message }, { status: 500 });
  }
}


/* ─── DELETE /api/agente/contabilidad/gastos ───────────────────────────────── */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const url   = new URL(req.url);
    const docId = url.searchParams.get('docId');
    const id    = url.searchParams.get('id');

    if (!docId && !id) {
      return NextResponse.json({ error: 'Falta docId o id.' }, { status: 400 });
    }

    let expenseToDelete;
    if (id) {
      expenseToDelete = await prisma.expense.findUnique({ where: { id: parseInt(id, 10) } });
    } else {
      expenseToDelete = await prisma.expense.findFirst({ where: { docId } });
    }

    if (!expenseToDelete) {
      return NextResponse.json({ message: 'Gasto no encontrado en la BD.' });
    }
    if (expenseToDelete.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { QdrantClient } = await import('@qdrant/js-client-rest');
    const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

    const filter = docId
      ? { must: [{ key: 'doc_id',   match: { value: docId } }] }
      : { must: [{ key: 'filename', match: { value: expenseToDelete.filename } }] };

    await qdrant.delete(EXPENSES_COLLECTION_NAME, { filter, wait: true });

    if (expenseToDelete.filePath) {
      const absoluteFilePath = path.join(process.cwd(), 'public', expenseToDelete.filePath);
      try {
        await fs.unlink(absoluteFilePath);
      } catch (fileErr) {
        console.warn(`No se pudo eliminar el archivo: ${fileErr.message}`);
      }
    }

    if (id) {
      await prisma.expense.delete({ where: { id: parseInt(id, 10) } });
    } else {
      await prisma.expense.deleteMany({ where: { docId } });
    }

    return NextResponse.json({ message: 'Gasto eliminado correctamente.' });
  } catch (err) {
    console.error('DELETE /api/agente/contabilidad/gastos error:', err);
    return NextResponse.json({ error: 'internal', details: err.message }, { status: 500 });
  }
}
