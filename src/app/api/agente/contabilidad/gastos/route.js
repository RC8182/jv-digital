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
import { PDFDocument } from 'pdf-lib';

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

    // 2 · Leer archivo desde form-data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'Se requiere un archivo PDF o imagen.' }, { status: 400 });
    }

    let pdfBuffer;
    let originalFileName = file.name;
    let isImage = false;

    if (file.type === 'application/pdf') {
      // PDF directo
      const arrayBuffer = await file.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else if (file.type === 'image/jpeg' || file.type === 'image/png') {
      // Imagen: convertir a PDF
      isImage = true;
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      // Crear PDF con la imagen
      const pdfDoc = await PDFDocument.create();
      let image;
      if (file.type === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageBuffer);
      } else {
        image = await pdfDoc.embedPng(imageBuffer);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      pdfBuffer = Buffer.from(await pdfDoc.save());
      // Cambiar el nombre para que termine en .pdf
      originalFileName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.pdf');
    } else {
      return NextResponse.json({ error: 'Solo se aceptan archivos PDF o imágenes (JPG, PNG).' }, { status: 400 });
    }

    // 3 · Calcular hash SHA-256
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
    const filenameOnDisk = `${docId}_${originalFileName}`;
    const filePathRelative = `/expenses_docs/${filenameOnDisk}`;
    const absoluteFilePath = path.join(UPLOAD_DIR, filenameOnDisk);
    await fs.writeFile(absoluteFilePath, pdfBuffer);

    // 6 · Crear registro inicial en BD con status "en_proceso"
    const createdExpense = await prisma.expense.create({
      data: {
        userId,
        filename: originalFileName,
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
      if (!fullText.trim() || fullText.trim().length < 20) {
        await prisma.expense.update({
          where: { id: createdExpense.id },
          data: {
            processingStatus: 'error',
            processingError: 'No se pudo extraer texto útil del documento. Asegúrate de que la foto sea clara y legible.'
          }
        });
        return NextResponse.json({
          error: 'processing_error',
          message: 'No se pudo extraer texto útil del documento. Asegúrate de que la foto sea clara y legible.'
        }, { status: 400 });
      }
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

      // Validar que la respuesta sea JSON
      let content = llmResponse.choices[0].message.content;
      if (!content.trim().startsWith('{') || !content.trim().endsWith('}')) {
        throw new Error('La respuesta del modelo no es un JSON válido.');
      }
      const parsed = JSON.parse(content);

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
        message: 'No se pudieron extraer metadatos con el LLM. Asegúrate de que la foto sea clara, legible y que la factura esté bien encuadrada.',
        details: llmErr.message
      }, { status: 400 });
    }

    // 9 · Indexar en Qdrant (incluyendo epígrafes en payload)
    try {
      const success = await uploadExpensePdfToQdrant(pdfBuffer, originalFileName, docId, extractedData);
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
