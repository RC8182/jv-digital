/*  app/api/agente/pdf/route.js
    Gestión de PDFs en Qdrant (listar, subir, borrar)           */

import { NextResponse }  from 'next/server';
import { QdrantClient }  from '@qdrant/js-client-rest';
import OpenAI            from 'openai';
import { randomUUID }    from 'node:crypto';
import * as pdfjs        from 'pdfjs-dist/legacy/build/pdf.js';
import 'pdfjs-dist/legacy/build/pdf.worker.js';

export const runtime = 'nodejs';

/* ── clientes ─────────────────────────────────────────────── */
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── helpers ──────────────────────────────────────────────── */
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

function splitText(text, maxLen = 1_000, overlap = 200) {
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

/* ── GET /api/agente/pdf ──────────────────────────────────── */
export async function GET() {
  try {
    const { points = [] } = await qdrant.scroll('pdfs', {
      limit: 10_000,
      with_payload: ['filename', 'doc_id'],
    });

    const seen = new Set();
    const pdfs = [];
    for (const p of points) {
      const { doc_id, filename } = p.payload;
      if (seen.has(doc_id)) continue;
      seen.add(doc_id);
      pdfs.push({ id: doc_id, filename });
    }
    return NextResponse.json({ pdfs });
  } catch (err) {
    if (err.status === 404) return NextResponse.json({ pdfs: [] });
    console.error('GET /api/agente/pdf', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/* ── POST /api/agente/pdf ─────────────────────────────────── */
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'No es un PDF válido.' }, { status: 400 });
    }

    /* 0 · Duplicados por filename */
    let dup = [];
    try {
      const { points } = await qdrant.scroll('pdfs', {
        limit: 1,
        with_payload: ['filename'],
        filter: { must: [{ key: 'filename', match: { value: file.name } }] },
      });
      dup = points;
    } catch (err) {
      if (err.status !== 404) throw err;   // 404 = colección aún no existe
    }
    if (dup.length) {
      return NextResponse.json({ error: 'El PDF ya está indexado.' }, { status: 409 });
    }

    /* 1 · Parseo y troceo */
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fullText = await extractText(buffer);
    const chunks   = splitText(fullText, 1_000, 200);

    /* 2 · Embeddings y puntos */
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
          text:         chunk,        // extra compatibilidad
        },
      });
    }

    /* 3 · Upsert (crea colección si falta) */
    try {
      await qdrant.upsert('pdfs', { points });
    } catch (err) {
      if (err.status !== 404) throw err;
      await qdrant.createCollection('pdfs', {
        vectors: { size: points[0].vector.length, distance: 'Cosine' },
      });
      await qdrant.upsert('pdfs', { points });
    }

    return NextResponse.json({ status: 'ok', indexedChunks: points.length });
  } catch (err) {
    console.error('POST /api/agente/pdf', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/* ── DELETE /api/agente/pdf ───────────────────────────────── */
export async function DELETE(req) {
  try {
    const url   = new URL(req.url);
    const docId = url.searchParams.get('doc_id');
    const name  = url.searchParams.get('filename');

    if (!docId && !name) {
      return NextResponse.json({ error: 'Falta doc_id o filename.' }, { status: 400 });
    }

    const filter = docId
      ? { must: [{ key: 'doc_id',   match: { value: docId } }] }
      : { must: [{ key: 'filename', match: { value: name  } }] };

    await qdrant.delete('pdfs', { filter, wait: true });
    return NextResponse.json({ message: 'PDF eliminado.' });
  } catch (err) {
    console.error('DELETE /api/agente/pdf', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
