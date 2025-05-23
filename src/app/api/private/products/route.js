// src/app/api/private/products/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * POST /api/private/products
 * Body: { clientId, code?, name, price }
 */
export async function POST(request) {
  const { clientId, code = '', name, price } = await request.json()
  if (!clientId || !name || price == null) {
    return NextResponse.json(
      { error: 'Falta clientId, name o price' },
      { status: 400 }
    )
  }
  const prod = await prisma.product.create({
    data: { clientId, code, name, price }
  })
  return NextResponse.json(prod)
}
