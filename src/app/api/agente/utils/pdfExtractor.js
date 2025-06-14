// src/app/api/agente/utils/pdfExtractor.js

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
pdfjs.GlobalWorkerOptions.workerSrc = `node_modules/pdfjs-dist/legacy/build/pdf.worker.js`;

/**
 * Extrae todo el texto de un PDF (pasado como ArrayBuffer o Buffer).
 * @param {Buffer|Uint8Array} buffer 
 * @returns {Promise<string>} Texto completo del PDF.
 */
export async function extractText(buffer) {
  // Aseguramos Uint8Array
  const data = Buffer.isBuffer(buffer) ? new Uint8Array(buffer) : buffer;
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdfDocument = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Parte un texto en “chunks” de longitud máxima maxLen, con solape de overlap caracteres.
 * @param {string} text 
 * @param {number} maxLen 
 * @param {number} overlap 
 * @returns {string[]} Array de fragmentos sin cortar por medio palabra importante.
 */
export function splitText(text, maxLen = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLen;
    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }
    // Intentamos no cortar en medio de una palabra: buscamos último espacio
    const slice = text.slice(start, end);
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > maxLen * 0.6) {
      end = start + lastSpace;
    }
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  // Filtramos fragmentos muy cortos
  return chunks.filter(chunk => chunk.length > 50);
}
