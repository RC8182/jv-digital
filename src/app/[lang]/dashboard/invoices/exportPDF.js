// src/app/[lang]/dashboard/invoices/exportPDF.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPDF({
  invoiceMeta,
  issuer,
  client,
  items,
  includeIGIC,
  includeIRPF,
  subtotal,
  igic,
  irpf,
  total
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  /* ───────────  CONSTANTES ESTILO  ─────────── */
  const primaryColor = [30, 144, 255];      // azul cabecera tabla
  const cardBgColor  = [247, 247, 247];     // gris claro tarjetas
  const cardBorder   = [200, 200, 200];     // gris borde tarjetas
  const headerText   = [255, 255, 255];     // blanco cabecera tabla
  const padding      = 8;
  const lineHeight   = 14;
  const margin       = 40;                  // margen exterior
  const gapCards     = 20;                  // separación vertical entre tarjetas

  /* ───────────  CABECERA AZUL DE DOCUMENTO  ─────────── */
  doc.setFillColor(...primaryColor).rect(0, 0, 595, 60, "F");
  doc.setTextColor(...headerText).setFontSize(28).text("FACTURA", 40, 40);
  doc.setFontSize(16).text(`Nº: ${invoiceMeta.number}`, 520, 30, { align: "right" });
  doc.setFontSize(12).text(`Fecha: ${invoiceMeta.date}`, 520, 48, { align: "right" });

  /* A partir de aquí, texto negro para TODAS las tarjetas */
  doc.setTextColor(0, 0, 0).setFontSize(10);

  /* ───────────  TARJETA EMISOR  ─────────── */
  const issuerLines = [
    issuer.name,
    issuer.address,
    `Tel: ${issuer.phone}`,
    `Email: ${issuer.email}`,
    `NIF: ${issuer.nif}`,
  ];
  const issuerX = margin, issuerY = 80, issuerW = 250;
  const wrappedIssuer = issuerLines.flatMap(l => doc.splitTextToSize(l, issuerW - padding*2));
  const issuerH = wrappedIssuer.length * lineHeight + padding*2;

  doc.setFillColor(...cardBgColor).setDrawColor(...cardBorder);
  doc.roundedRect(issuerX, issuerY, issuerW, issuerH, 6, 6, "FD");
  let y = issuerY + padding + lineHeight;
  wrappedIssuer.forEach(l => { doc.text(l, issuerX + padding, y); y += lineHeight; });

  /* ───────────  TARJETA CLIENTE  ─────────── */
  const clientLines = [
    `Cliente: ${client.name}`,
    `NIF: ${client.nif}`,
    `Tel: ${client.phone}`,
    `Email: ${client.email}`,    
    `Dirección: ${client.address}`,
    `Ciudad: ${client.city}`,
  ];
  const clientX = 325, clientY = 80, clientW = 230;
  const wrappedClient = clientLines.flatMap(l => doc.splitTextToSize(l, clientW - padding*2));
  const clientH = wrappedClient.length * lineHeight + padding*2;

  doc.setFillColor(...cardBgColor).setDrawColor(...cardBorder);
  doc.roundedRect(clientX, clientY, clientW, clientH, 6, 6, "FD");
  y = clientY + padding + lineHeight;
  wrappedClient.forEach(l => { doc.text(l, clientX + padding, y); y += lineHeight; });

  /* ───────────  MEDIDAS DE PÁGINA  ─────────── */
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  /* ───────────  TARJETA TOTALES (se calcula primero su alto)  ─────────── */
  const totalLines = [
    `Subtotal: ${subtotal.toFixed(2)} €`,
    includeIGIC ? `IGIC (7%): ${igic.toFixed(2)} €`   : null,
    includeIRPF ? `IRPF (7%): -${irpf.toFixed(2)} €` : null,
    `Total: ${total.toFixed(2)} €`
  ].filter(Boolean);
  const totalsW = 200;
  const wrappedTotals = totalLines.flatMap(l => doc.splitTextToSize(l, totalsW - padding*2));
  const totalsH = wrappedTotals.length * lineHeight + padding*2;
  const totalsX = pageW - margin - totalsW;
  const totalsY = pageH - margin - totalsH;      // parte superior de tarjeta Totales

  /* ───────────  TARJETA-TABLA (contenedor gris)  ─────────── */
  const tableStartY = Math.max(issuerY + issuerH, clientY + clientH) + gapCards;
  const tableEndY   = totalsY - gapCards;        // mismo gap arriba y abajo (20 pt)
  const tableX      = margin;
  const tableW      = pageW - margin*2;
  const tableH      = tableEndY - tableStartY;

  // 1) rellenar solo el fondo de la tarjeta-tabla
  doc.setFillColor(...cardBgColor);
  doc.roundedRect(tableX, tableStartY, tableW, tableH, 6, 6, "F");

  /* ───────────  TABLA DE LÍNEAS  ─────────── */
  let headerPainted = false;
  autoTable(doc, {
    startY : tableStartY,
    margin : { left: tableX, right: margin },
    head   : [["Código","Descripción","Cant.","Precio","Dto","Importe"]],
    body   : items.map(it => [
      it.code, it.description, it.quantity,
      it.unitPrice.toFixed(2), it.discount.toFixed(2),
      (it.quantity * it.unitPrice * (1 - it.discount/100)).toFixed(2)
    ]),
    styles     : { fontSize: 9, cellPadding: 4,  textColor: [0, 0, 0] },
    headStyles : { fillColor: false, textColor: headerText, halign: "center" },

    didParseCell: data => {
      if (data.section === 'head') {
        data.cell.styles.fillColor = false;
      }
    },

    willDrawCell: data => {
      if (data.section === 'head' && !headerPainted) {
        const h = data.row.height;

        doc.setFillColor(...primaryColor);
        doc.roundedRect(tableX, data.cell.y, tableW, h, 6, 6, 'F');
        doc.rect(tableX, data.cell.y + h - 6, 6, 6, 'F');
        doc.rect(tableX + tableW - 6, data.cell.y + h - 6, 6, 6, 'F');

        headerPainted = true;
      }
    }
  });

  // 2) trazar solo el borde del contenedor GRIS por encima de la tabla
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(tableX, tableStartY, tableW, tableH, 6, 6, "S");

  /* ───────────  TARJETA TOTALES  ─────────── */
  doc.setFillColor(...cardBgColor).setDrawColor(...cardBorder);
  doc.roundedRect(totalsX, totalsY, totalsW, totalsH, 6, 6, "FD");
  y = totalsY + padding + lineHeight;
  wrappedTotals.forEach(t => { doc.text(t, totalsX + padding, y); y += lineHeight; });

  /* ───────────  TARJETA BANCO  ─────────── */
  const bankLines = [
    "TRANSFERENCIA A LA NUEVA CUENTA",
    "IBAN: ES55 1465 0100 95 1768028805",
    "BIC: INGDESMMXXX  BANCO ING"
  ];
  const bankW = 300;
  const wrappedBank = bankLines.flatMap(l => doc.splitTextToSize(l, bankW - padding*2));
  const bankH = wrappedBank.length * lineHeight + padding*2;
  const bankX = margin;
  const bankY = totalsY;

  doc.setFillColor(...cardBgColor).setDrawColor(...cardBorder);
  doc.roundedRect(bankX, bankY, bankW, bankH, 6, 6, "FD");
  y = bankY + padding + lineHeight;
  wrappedBank.forEach(t => { doc.text(t, bankX + padding, y); y += lineHeight; });

  /* ───────────  EXPORTAR  ─────────── */
  doc.save(`factura_${invoiceMeta.number}.pdf`);
}
