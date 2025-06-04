// src/app/api/dashboard/products/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa la instancia singleton de Prisma

// GET: Obtener un producto por ID
export async function GET(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('API Products (GET by ID): Error al obtener producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar un producto por ID
export async function PUT(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

  const { code, name, price } = await request.json();

  if (!name || price == null) {
    return NextResponse.json(
      { error: 'Faltan campos obligatorios: nombre o precio' },
      { status: 400 }
    );
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        code: code || '', // Puede ser opcional, asegúrate que Prisma lo maneje
        name,
        price: parseFloat(price), // Asegúrate de que el precio sea un número
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('API Products (PUT): Error al actualizar producto:', error);
    // Errores comunes: P2025 (no encontrado), P2002 (código duplicado)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado para actualizar' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Si 'code' es único y se intenta duplicar
      return NextResponse.json({ error: `El código '${code}' ya existe.` }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al actualizar el producto', details: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un producto por ID
export async function DELETE(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Producto eliminado correctamente' }, { status: 200 });
  } catch (error) {
    console.error('API Products (DELETE): Error al eliminar producto:', error);
    if (error.code === 'P2025') { // Si el producto no existe
      return NextResponse.json({ error: 'Producto no encontrado para eliminar' }, { status: 404 });
    }
    // Si hay una restricción de clave foránea en otra tabla (ej. InvoiceLine), se manejaría aquí también
    return NextResponse.json({ error: 'Error al eliminar el producto', details: error.message }, { status: 500 });
  }
}