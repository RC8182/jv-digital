// src/app/api/agente/utils/qdrantExpenses.js
import { QdrantClient } from '@qdrant/js-client-rest';
import { embed } from './embeddings.js'; // Asumo que embed está en un archivo separado
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

import * as pdfjs from 'pdfjs-dist/build/pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `node_modules/pdfjs-dist/build/pdf.worker.js`;

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

// NOMBRE DE LA COLECCIÓN QDRANT PARA GASTOS
export const EXPENSES_COLLECTION_NAME = 'expenses-pdfs'; // Exportar para uso en otros archivos

/* --------------------------------------------------------------
   Buscar documentos de gastos relevantes
----------------------------------------------------------------*/
/**
 * Busca documentos de gastos relevantes en Qdrant con filtros estructurados.
 * @param {string} query La consulta de texto del usuario (opcional).
 * @param {number} limit El número máximo de resultados a devolver.
 * @param {object} filters Objeto con filtros estructurados (ej. { date: { gte: "...", lte: "..." }, supplier: "..." })
 * @returns {Array<object>} Lista de resultados, incluyendo payload completo.
 */
export async function searchExpensesDocs(query, limit = 3, filters = {}) {
  try {
    let vector;
    // Generar embedding solo si hay una query de texto
    if (query && query.trim() !== '') {
      const embedResponse = await embed(query);
      // CORRECCIÓN: Asegurar que embedResponse y embedResponse.data existen
      if (embedResponse && embedResponse.data && embedResponse.data[0]) {
        vector = embedResponse.data[0].embedding;
      } else {
        console.warn("Embeddings API returned no data for query:", query);
        // Si no se puede generar embedding, y no hay filtros, no hay nada que buscar semánticamente.
        if (Object.keys(filters).length === 0) return [];
      }
    }

    let qdrantFilter = {};
    if (Object.keys(filters).length > 0) {
        qdrantFilter.must = [];

        if (filters.date) {
            const dateFilter = { key: 'date', range: {} };
            if (filters.date.gte) dateFilter.range.gte = new Date(filters.date.gte).toISOString(); // Asegurar formato ISO
            if (filters.date.lte) dateFilter.range.lte = new Date(filters.date.lte).toISOString(); // Asegurar formato ISO
            if (Object.keys(dateFilter.range).length > 0) {
                qdrantFilter.must.push(dateFilter);
            }
        }

        if (filters.supplier) {
            qdrantFilter.must.push({
                key: 'supplier',
                match: { value: filters.supplier.toLowerCase() } // Normalizar a minúsculas para coincidencia
            });
        }
    }

    let hits = [];
    if (vector) { // Si hay vector, hacemos búsqueda semántica
      const res = await qdrant.search(EXPENSES_COLLECTION_NAME, {
        vector: vector,
        limit: limit,
        with_payload: true,
        score_threshold: 0.0,
        filter: qdrantFilter.must && qdrantFilter.must.length > 0 ? qdrantFilter : undefined, // Aplicar filtro si existe
      });
      hits = res || []; // Asegurar que hits sea un array
    } else if (qdrantFilter.must && qdrantFilter.must.length > 0) { // Si no hay vector pero hay filtros
      // Realizar un scroll para buscar solo por filtro, más adecuado para "listar por filtro"
      const scrollResult = await qdrant.scroll(EXPENSES_COLLECTION_NAME, {
          limit: limit,
          with_payload: true,
          filter: qdrantFilter,
      });
      hits = scrollResult.points || [];
    } else {
      // Ni query de texto ni filtros estructurados
      return [];
    }
    
    return (hits || []).map(hit => ({
      ...hit.payload,
      score: hit.score || 0, // score solo existirá si hubo búsqueda vectorial
      id: hit.id,
    }));
  } catch (error) {
    console.error(`Error searching expense docs in Qdrant:`, error);
    return [];
  }
}

/* --------------------------------------------------------------
   Cargar PDF de Gasto a Qdrant
----------------------------------------------------------------*/
/**
 * Sube un PDF de gasto a Qdrant, dividiéndolo en chunks e incrustando metadatos.
 * @param {Buffer|Uint8Array} pdfBuffer El buffer del archivo PDF.
 * @param {string} filename El nombre del archivo original.
 * @param {string} docId El ID único del documento (de la tabla Expense).
 * @param {object} extractedData Los datos estructurados extraídos por el LLM (supplier, date, amounts).
 * @returns {boolean} True si la subida fue exitosa, false en caso contrario.
 */
export async function uploadExpensePdfToQdrant(pdfBuffer, filename, docId, extractedData = {}) {
  try {
    const pdfData = Buffer.isBuffer(pdfBuffer) ? new Uint8Array(pdfBuffer) : pdfBuffer;

    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    if (!fullText.trim()) {
      console.warn(`No text extracted from PDF: ${filename}. Not indexing in Qdrant.`);
      return false;
    }

    const chunks = fullText.split('\n').filter(line => line.trim().length > 50);
    if (!chunks.length) {
      console.warn(`No substantial chunks in PDF: ${filename}. Not indexing in Qdrant.`);
      return false;
    }

    const points = [];
    for (const chunk of chunks) {
      const vector = await embed(chunk);
      points.push({
        id: uuidv4(),
        vector,
        payload: {
          doc_id:       docId,
          filename:     filename,
          page_content: chunk,
          source:       'expense_pdf_upload',
          timestamp:    new Date().toISOString(),
          // Incluir los datos estructurados extraídos por el LLM en el payload de Qdrant
          supplier:    extractedData.supplier,
          date:        extractedData.date, // La fecha se guarda como string ISO
          baseAmount:  extractedData.baseAmount,
          taxAmount:   extractedData.taxAmount,
          totalAmount: extractedData.totalAmount,
          type:        'expense' // Mantiene el tipo
        },
      });
    }

    try {
      await qdrant.getCollection(EXPENSES_COLLECTION_NAME);
    } catch {
      console.log(`Collection '${EXPENSES_COLLECTION_NAME}' missing. Creating...`);
      await qdrant.createCollection(EXPENSES_COLLECTION_NAME, {
        vectors: { size: points[0].vector.length, distance: 'Cosine' },
      });
    }

    await qdrant.upsert(EXPENSES_COLLECTION_NAME, {
      wait: true,
      batch: {
        ids: points.map(p => p.id),
        vectors: points.map(p => p.vector),
        payloads: points.map(p => p.payload),
      },
    });

    console.log(`Successfully uploaded ${points.length} chunks from ${filename} to Qdrant collection ${EXPENSES_COLLECTION_NAME}.`);
    return true;
  } catch (err) {
    console.error(`Error uploading PDF ${filename} to Qdrant collection ${EXPENSES_COLLECTION_NAME}:`, err.message);
    return false;
  }
}