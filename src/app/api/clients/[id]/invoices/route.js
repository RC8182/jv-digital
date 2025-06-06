// src/app/api/clients/[id]/invoices/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // Asegúrate de importar tu instancia de Prisma singleton

export async function GET(request, { params }) {
  const clientId = Number(params.id)
  if (isNaN(clientId)) {
    return NextResponse.json({ error: "ID de cliente inválido." }, { status: 400 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: { clientId },
      // MODIFICADO: AÑADIDOS status, dueDate, paidDate a la selección
      select: {
        id: true,
        number: true,
        date: true,
        total: true,
        status: true,       // <-- AÑADIDO: para mostrar el estado
        dueDate: true,      // <-- AÑADIDO: para mostrar la fecha de vencimiento
        paidDate: true,     // <-- AÑADIDO: para mostrar la fecha de pago
        client: {           // Incluye el nombre del cliente si el listado lo necesita (aunque ya tienes el cliente seleccionado en el frontend)
            select: { name: true }
        }
      },
      orderBy: { date: "desc" } // Ordenar por fecha de emisión
    })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error al obtener facturas por cliente:", error);
    return NextResponse.json({ error: "Error interno al cargar facturas para el cliente." }, { status: 500 });
  }
}