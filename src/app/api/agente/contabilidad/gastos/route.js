/*  app/api/agente/expense/route.js
    Gestión de “gastos” en PDF: indexación en Qdrant (igual que /pdf), 
    más creación de fila en tabla Expense.
*/

import { NextResponse }   from 'next/server';
import { QdrantClient }   from '@qdrant/js-client-rest';
import OpenAI             from 'openai';
import { randomUUID }     from 'node:crypto';
import * as pdfjs         from 'pdfjs-dist/legacy/build/pdf.js';
import 'pdfjs-dist/legacy/build/pdf.worker.js';
import { getServerSession } from 'next-auth';
import { authOptions }    from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';


export const runtime = 'nodejs';

/* ── Instancias Qdrant / OpenAI ───────────────────────────────────────── */
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── Helpers de PDF (idénticos a /api/agente/pdf) ───────────────────────── */
async function extractText(buffer) {
  const pdf = await pdfjs
    .getDocument({ data: new Uint8Array(buffer), disableWorker: true })
    .promise;

  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
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
    const form = await req.formData();
    const file = form.get('file');
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Se requiere un PDF válido.' }, { status: 400 });
    }

    // 3 · Duplicados por filename (igual que en /pdf)
    let dup = [];
    try {
      const { points } = await qdrant.scroll('pdfs', {
        limit: 1,
        with_payload: ['filename'],
        filter: { must: [{ key: 'filename', match: { value: file.name } }] },
      });
      dup = points;
    } catch (err) {
      if (err.status !== 404) throw err; // 404 = colección aún no existe
    }
    if (dup.length) {
      return NextResponse.json({ error: 'El PDF ya está indexado (duplicado).' }, { status: 409 });
    }

    // 4 · Parseo y troceo del PDF
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fullText = await extractText(buffer);
    const chunks   = splitText(fullText, 1000, 200);

    // 5 · Generar embeddings + preparar puntos para Qdrant
    const docId  = randomUUID();
    const points = [];
    for (const chunk of chunks) {
      const { data } = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      });

      points.push({
        id: randomUUID(),
        vector: data[0].embedding,
        payload: {
          doc_id:       docId,
          filename:     file.name,
          page_content: chunk,
          type:         'expense', // para poder filtrar como gasto
        },
      });
    }

    // 6 · Upsert en Qdrant (crea colección si falta)
    try {
      await qdrant.upsert('pdfs', { points });
    } catch (err) {
      if (err.status !== 404) throw err;
      await qdrant.createCollection('pdfs', {
        vectors: { size: points[0].vector.length, distance: 'Cosine' },
      });
      await qdrant.upsert('pdfs', { points });
    }

    // 7 · Crear fila en tabla Expense (Prisma)
    const expense = await prisma.expense.create({
      data: {
        userId,
        filename: file.name,
        docId,
        // NO rellenamos aquí supplier, date, amounts: se podrán actualizar con PATCH
      },
    });

    return NextResponse.json({ status: 'ok', expenseId: expense.id });
  } catch (err) {
    console.error('POST /api/agente/gastos', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/* ── GET /api/agente/expense ────────────────────────────────────────────── */
export async function GET() {
  try {
    // Devolvemos lista de gastos (docId + filename + createdAt)
    // Podrías ampliar para incluir supplier, date, amounts si ya lo rellenaste
    const list = await prisma.expense.findMany({
      where: { }, // Podrías filtrar por userId si lo deseas: { userId: session.user.id }
      select: {
        id: true,
        filename: true,
        docId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ expenses: list });
  } catch (err) {
    console.error('GET /api/agente/gastos', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/* ── DELETE /api/agente/expense ─────────────────────────────────────────── */
export async function DELETE(req) {
  try {
    const url   = new URL(req.url);
    const docId = url.searchParams.get('docId');
    const id    = url.searchParams.get('id'); // id de Expense en la tabla

    if (!docId && !id) {
      return NextResponse.json({ error: 'Falta docId o id.' }, { status: 400 });
    }

    // 1 · Borrar de Qdrant
    const filter = docId
      ? { must: [{ key: 'doc_id',   match: { value: docId } }] }
      : { must: [{ key: 'filename', match: { value: url.searchParams.get('filename')  } }] };

    await qdrant.delete('pdfs', { filter, wait: true });

    // 2 · Borrar de BD
    if (id) {
      await prisma.expense.delete({ where: { id: parseInt(id, 10) } });
    } else {
      // si solo viene docId, borra todas las filas que tengan ese docId
      await prisma.expense.deleteMany({ where: { docId } });
    }

    return NextResponse.json({ message: 'Gasto eliminado.' });
  } catch (err) {
    console.error('DELETE /api/agente/gastos', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
