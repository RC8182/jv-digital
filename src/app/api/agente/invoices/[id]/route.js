// src/app/api/agente/invoices/[id]/route.js
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'; // <-- Importar la instancia singleton

// EXPORTAR explícitamente la función GET (para obtener detalles de una factura por ID)
export async function GET(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try { // Añadido try-catch para manejar errores de DB
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { id: "asc" } },
        client: true // Incluir el cliente para el nombre, etc.
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    // Formatear las fechas a 'YYYY-MM-DD' para que el input type="date" del frontend las maneje correctamente
    return NextResponse.json({
      ...invoice,
      date: invoice.date.toISOString().slice(0, 10),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : '',
      paidDate: invoice.paidDate ? invoice.paidDate.toISOString().slice(0, 10) : '',
    });
  } catch (error) {
    console.error("Error al obtener factura por ID:", error);
    return NextResponse.json({ error: "Error interno al cargar factura." }, { status: 500 });
  }
}

// EXPORTAR explícitamente la función PUT (para actualizar una factura existente)
export async function PUT(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // AÑADIDOS 'status' y 'paidDate' a la desestructuración del cuerpo de la petición
  const { clientId, number, date, dueDate, status, paidDate, includeIGIC, includeIRPF, items } = await request.json();

  // Recalcular totales (es importante que el backend haga esto si el frontend envía los ítems)
  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice * (1 - it.discount / 100),
    0
  );
  const igic = includeIGIC ? subtotal * 0.07 : 0;
  const irpf = includeIRPF ? subtotal * 0.07 : 0;
  const total = subtotal + igic - irpf;

  try {
    // Actualiza factura y líneas
    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        clientId, // Se puede actualizar el cliente si el frontend lo permite
        number,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null, // Actualiza dueDate
        status: status, // <-- AHORA SÍ: Actualiza el estado
        paidDate: paidDate ? new Date(paidDate) : null, // <-- AHORA SÍ: Actualiza la fecha de pago
        includeIGIC,
        includeIRPF,
        subtotal,
        igic,
        irpf,
        total,
        lines: {
          deleteMany: { invoiceId: id }, // Borra las líneas existentes
          create: items.map(it => ({    // Y luego crea las nuevas líneas
            code: it.code,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount, // <-- ¡CORREGIDO EL ERROR DE COPY-PASTE AQUÍ!
          })),
        },
      },
      include: { lines: true, client: true }, // Incluir client para el nombre en la respuesta
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar factura:", error);
    return NextResponse.json({ error: "Error interno al actualizar factura." }, { status: 500 });
  }
}

// EXPORTAR explícitamente la función DELETE
export async function DELETE(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // 1) borrar todas las líneas asociadas
    await prisma.invoiceLine.deleteMany({
      where: { invoiceId: id }
    });
    // 2) borrar la factura
    await prisma.invoice.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al borrar factura:", err);
    return NextResponse.json(
      { error: "No se pudo eliminar la factura" },
      { status: 500 }
    );
  }
}