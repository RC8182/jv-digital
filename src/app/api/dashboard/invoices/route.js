// src/app/api/dashboard/invoices/route.js
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'; // <-- CAMBIO: Importar la instancia singleton

// EXPORTAR explícitamente la función GET
// (Opcional) listar facturas de todos los clientes o filtradas
export async function GET(request) {
  const invoices = await prisma.invoice.findMany({
    include: { lines: true, client: true },
    orderBy: { date: "desc" }
  });
  return NextResponse.json(invoices);
}

// EXPORTAR explícitamente la función POST
export async function POST(request) {
  const { clientId, date, includeIGIC, includeIRPF, items } = await request.json();

  // 1) Calcula el número correlativo global por año
  const year = new Date(date).getFullYear();
  const count = await prisma.invoice.count({
    where: {
      date: {
        gte: new Date(`${year}-01-01`),
        lt:  new Date(`${year + 1}-01-01`)
      }
    }
  });
  const number = `${String(count + 1).padStart(3, "0")}-${year}`; // Formato XXX-YYYY

  // 2) Totales
  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice * (1 - it.discount / 100),
    0
  );
  const igic  = includeIGIC ? subtotal * 0.07 : 0;
  const irpf  = includeIRPF ? subtotal * 0.07 : 0; // Tasa IRPF del 15%
  const total = subtotal + igic - irpf;

  // 3) Crea en BD
  const created = await prisma.invoice.create({
    data: {
      clientId,
      number,
      date: new Date(date),
      includeIGIC,
      includeIRPF,
      subtotal,
      igic,
      irpf,
      total,
      lines: {
        create: items.map(it => ({
          code:        it.code,
          description: it.description,
          quantity:    it.quantity,
          unitPrice:   it.unitPrice,
          discount:    it.discount
        }))
      }
    },
    include: { lines: true }
  });

  return NextResponse.json(created);
}