// src/app/api/agente/contabilidad/gastos/route.js
/*  app/api/agente/expense/route.js
    Gestión de “gastos” en PDF: indexación en Qdrant (igual que /pdf),
    más creación de fila en tabla Expense.
*/

import { NextResponse }   from 'next/server';
import OpenAI             from 'openai';
import { randomUUID }     from 'node:crypto';
import * as pdfjs         from 'pdfjs-dist/legacy/build/pdf.js';
import 'pdfjs-dist/legacy/build/pdf.worker.js';
import { getServerSession } from 'next-auth';
import { authOptions }    from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

// Importar funciones y nombre de colección desde qdrantExpenses.js
import { uploadExpensePdfToQdrant, EXPENSES_COLLECTION_NAME } from '@/app/api/agente/utils/qdrantExpenses.js';


export const runtime = 'nodejs';

/* ── Instancias OpenAI ────────────────────────────────────────────────── */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Directorio donde se guardarán los archivos PDF de gastos
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'expenses_docs');


/* ── Helpers de PDF (mantenidos aquí ya que los usa solo este archivo para extracción inicial) ── */
async function extractText(buffer) {
  const pdf = await pdfjs
    .getDocument({ data: new Uint8Array(buffer), disableWorker: true })
    .promise;

  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(' ') + '\n';
  }
  return text;
}

function splitText(text, maxLen = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLen;
    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }
    const slice     = text.slice(start, end);
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > maxLen * 0.6) end = start + lastSpace;
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }
  return chunks;
}

/* ── Función para extraer datos del gasto con LLM ───────────────────────── */
async function extractExpenseDataWithLLM(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extrae la siguiente información de un documento de gasto.
                    Si un campo no se encuentra, devuélvelo como 'null'.
                    La fecha debe estar en formato YYYY-MM-DD.
                    Los importes (baseAmount, taxAmount, totalAmount) deben ser números flotantes.
                    Si solo hay un total, asume que es el totalAmount y los demás pueden ser null.
                    Considera un IRPF o Retención como un impuesto negativo si está presente.
                    
                    Formato de respuesta JSON:
                    {
                      "supplier": "string | null",
                      "date": "YYYY-MM-DD | null",
                      "baseAmount": "float | null",
                      "taxAmount": "float | null",
                      "totalAmount": "float | null"
                    }`
        },
        {
          role: "user",
          content: `Documento de gasto:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const parsedData = JSON.parse(response.choices[0].message.content);

    return {
      supplier: parsedData.supplier || null,
      date: parsedData.date && !isNaN(new Date(parsedData.date)) ? parsedData.date : null,
      baseAmount: typeof parsedData.baseAmount === 'number' ? parsedData.baseAmount : null,
      taxAmount: typeof parsedData.taxAmount === 'number' ? parsedData.taxAmount : null,
      totalAmount: typeof parsedData.totalAmount === 'number' ? parsedData.totalAmount : null,
    };

  } catch (error) {
    console.error("Error al extraer datos con LLM:", error);
    return { supplier: null, date: null, baseAmount: null, taxAmount: null, totalAmount: null };
  }
}


/* ── POST /api/agente/expense ───────────────────────────────────────────── */
export async function POST(req) {
  try {
    // 1 · Verificar sesión de usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2 · Leer PDF desde form-data
    const file = (await req.formData()).get('file');
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Se requiere un PDF válido.' }, { status: 400 });
    }

    // 3 · Parseo del PDF
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fullText = await extractText(buffer);
    
    // 4 · Extraer datos del gasto con LLM (antes de guardar en DB)
    const extractedData = await extractExpenseDataWithLLM(fullText);

    // 5 · Generar docId y guardar el archivo PDF original en el sistema de archivos
    const docId  = randomUUID();
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, `${docId}_${file.name}`);
    await fs.writeFile(filePath, buffer);
    const publicFilePath = `/expenses_docs/${docId}_${file.name}`;

    // 6 · Indexar en Qdrant (usando la función del nuevo módulo)
    // Pasamos todos los datos extraídos para que se incluyan en el payload de Qdrant
    const indexedInQdrant = await uploadExpensePdfToQdrant(buffer, file.name, docId, extractedData);
    
    if (!indexedInQdrant) {
        // Si no se indexó en Qdrant (ej. no se extrajo texto), puedes decidir cómo manejarlo.
        // Por ahora, permitimos que la operación continúe si el principal es guardar en DB.
        console.warn(`PDF ${file.name} no indexado en Qdrant.`);
    }

    // 7 · Crear fila en tabla Expense (Prisma) con los datos extraídos
    const expense = await prisma.expense.create({
      data: {
        userId,
        filename: file.name,
        docId,
        filePath: publicFilePath,
        supplier: extractedData.supplier,
        date: extractedData.date ? new Date(extractedData.date) : null,
        baseAmount: extractedData.baseAmount,
        taxAmount: extractedData.taxAmount,
        totalAmount: extractedData.totalAmount,
      },
    });

    return NextResponse.json({ status: 'ok', expenseId: expense.id, filePath: publicFilePath, extractedData });
  } catch (err) {
    console.error('POST /api/agente/gastos', err);
    return NextResponse.json({ error: 'internal', details: err.message }, { status: 500 });
  }
}

/* ── GET /api/agente/expense ────────────────────────────────────────────── */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const list = await prisma.expense.findMany({
      where: userId ? { userId } : {},
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
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ expenses: list });
  } catch (err) {
    console.error('GET /api/agente/gastos', err);
    return NextResponse.json({ error: 'internal', details: err.message }, { status: 500 });
  }
}

/* ── DELETE /api/agente/expense ─────────────────────────────────────────── */
export async function DELETE(req) {
  try {
    const url   = new URL(req.url);
    const docId = url.searchParams.get('docId');
    const id    = url.searchParams.get('id');

    if (!docId && !id) {
      return NextResponse.json({ error: 'Falta docId o id.' }, { status: 400 });
    }

    let expenseToDelete;
    if (id) {
        expenseToDelete = await prisma.expense.findUnique({ where: { id: parseInt(id, 10) } });
    } else if (docId) {
        expenseToDelete = await prisma.expense.findFirst({ where: { docId } });
    }

    if (!expenseToDelete) {
        return NextResponse.json({ message: 'Gasto no encontrado en la base de datos.' });
    }

    // Importar QdrantClient para la eliminación si no se usa directamente la función del módulo
    const QdrantClient = (await import('@qdrant/js-client-rest')).QdrantClient;
    const qdrant = new QdrantClient({ url: process.env.QDRANT_URL }); // Re-instanciar aquí si no es global

    const filter = docId
      ? { must: [{ key: 'doc_id',   match: { value: docId } }] }
      : { must: [{ key: 'filename', match: { value: expenseToDelete.filename } }] };

    // Usando el nombre de colección de gastos
    await qdrant.delete(EXPENSES_COLLECTION_NAME, { filter, wait: true });

    if (expenseToDelete.filePath) {
        const absoluteFilePath = path.join(process.cwd(), 'public', expenseToDelete.filePath);
        try {
            await fs.unlink(absoluteFilePath);
            console.log(`Archivo ${absoluteFilePath} eliminado del disco.`);
        } catch (fileErr) {
            console.warn(`No se pudo eliminar el archivo físico ${absoluteFilePath}: ${fileErr.message}`);
        }
    }

    if (id) {
      await prisma.expense.delete({ where: { id: parseInt(id, 10) } });
    } else {
      await prisma.expense.deleteMany({ where: { docId } });
    }

    return NextResponse.json({ message: 'Gasto eliminado correctamente.' });
  } catch (err) {
    console.error('DELETE /api/agente/gastos', err);
    return NextResponse.json({ error: 'internal', details: err.message }, { status: 500 });
  }
}