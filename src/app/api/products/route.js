// src/app/api/dashboard/products/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // <-- CAMBIO: Importa la instancia singleton

/**
 * POST /api/dashboard/products
 * Body: { clientId, code?, name, price }
 */
export async function POST(request) {
  const { clientId, code = '', name, price } = await request.json();
  if (!clientId || !name || price == null) {
    return NextResponse.json(
      { error: 'Falta clientId, name o price' },
      { status: 400 }
    );
  }
  try {
    const prod = await prisma.product.create({
      data: { clientId, code, name, price: parseFloat(price) } // Asegúrate de que el precio se guarda como float
    });
    return NextResponse.json(prod);
  } catch (error) {
    console.error('API Products (POST): Error al crear producto:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ error: `El código '${code}' ya existe para un producto.` }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al crear el producto', details: error.message }, { status: 500 });
  }
}
// Si necesitas listar todos los productos, añadirías una función GET aquí:
// export async function GET(request) {
//   try {
//     const products = await prisma.product.findMany();
//     return NextResponse.json(products);
//   } catch (error) {
//     console.error('API Products (GET all): Error al obtener productos:', error);
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
//   }
// }