import { QdrantClient } from '@qdrant/js-client-rest';
import { embed } from './embeddings.js';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer'; // Para detectar Buffer de Node

import * as pdfjs from 'pdfjs-dist/build/pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `node_modules/pdfjs-dist/build/pdf.worker.js`;

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

/* --------------------------------------------------------------
   Buscar documentos relevantes
----------------------------------------------------------------*/
export async function searchDocs(question, k = 4) {
  const vector = await embed(question);
  const res = await qdrant.search('pdfs', {
    vector,
    limit: k,
    with_payload: ['page_content', 'filename'],
    score_threshold: 0.0,
  });
  return res.map(r => ({ filename: r.payload.filename, content: r.payload.page_content }));
}

/* --------------------------------------------------------------
   Cargar PDF a Qdrant
----------------------------------------------------------------*/
/**
 * Sube un PDF (Buffer/Uint8Array) a Qdrant dividiéndolo en chunks embebidos.
 * @param {Buffer|Uint8Array} pdfBuffer
 * @param {string} filename
 */
export async function uploadPdfToQdrant(pdfBuffer, filename) {
  try {
    // Asegurar Uint8Array (pdfjs falla con Buffer)
    const pdfData = Buffer.isBuffer(pdfBuffer) ? new Uint8Array(pdfBuffer) : pdfBuffer;

    // 1. Extraer texto con pdfjs
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    if (!fullText.trim()) {
      console.warn(`No text extracted from PDF: ${filename}`);
      return false;
    }

    // 2. Dividir en líneas/párrafos suficientemente largas
    const chunks = fullText.split('\n').filter(line => line.trim().length > 50);
    if (!chunks.length) {
      console.warn(`No substantial chunks in PDF: ${filename}`);
      return false;
    }

    // 3. Crear embeddings -> puntos
    const points = [];
    for (const chunk of chunks) {
      const vector = await embed(chunk);
      points.push({
        id: uuidv4(),
        vector,
        payload: {
          filename,
          page_content: chunk,
          source: 'email_attachment',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 4. Upsert en colección
    const collection = 'pdfs';
    try {
      await qdrant.getCollection(collection);
    } catch {
      console.log(`Collection '${collection}' missing. Creating...`);
      await qdrant.createCollection(collection, {
        vectors: { size: points[0].vector.length, distance: 'Cosine' },
      });
    }

    await qdrant.upsert(collection, {
      wait: true,
      batch: {
        ids: points.map(p => p.id),
        vectors: points.map(p => p.vector),
        payloads: points.map(p => p.payload),
      },
    });

    console.log(`Successfully uploaded ${points.length} chunks from ${filename} to Qdrant.`);
    return true;
  } catch (err) {
    console.error(`Error uploading PDF ${filename} to Qdrant:`, err.message);
    return false;
  }
}
