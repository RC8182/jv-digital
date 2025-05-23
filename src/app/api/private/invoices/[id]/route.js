// src/app/api/private/invoices/[id]/route.js
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function GET(request, { params }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { id: "asc" } },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
  }
  return NextResponse.json(invoice)
}

export async function PUT(request, { params }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const { number, date, includeIGIC, includeIRPF, items } = await request.json()

  // recalcular totales
  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice * (1 - it.discount / 100),
    0
  )
  const igic = includeIGIC ? subtotal * 0.07 : 0
  const irpf = includeIRPF ? subtotal * 0.15 : 0
  const total = subtotal + igic - irpf

  // actualiza factura y líneas
  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      number,
      date: new Date(date),
      includeIGIC,
      includeIRPF,
      subtotal,
      igic,
      irpf,
      total,
      lines: {
        deleteMany: { invoiceId: id },
        create: items.map(it => ({
          code: it.code,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
        })),
      },
    },
    include: { lines: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request, { params }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    // 1) borrar todas las líneas asociadas
    await prisma.invoiceLine.deleteMany({
      where: { invoiceId: id }
    })
    // 2) borrar la factura
    await prisma.invoice.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error al borrar factura:", err)
    return NextResponse.json(
      { error: "No se pudo eliminar la factura" },
      { status: 500 }
    )
  }
}
