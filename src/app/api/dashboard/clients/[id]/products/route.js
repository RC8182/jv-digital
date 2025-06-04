// src/app/api/dashboard/clients/[id]/products/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/dashboard/clients/:id/products
 * Devuelve todos los productos de un cliente
 */
export async function GET(request, { params }) {
  const clientId = Number(params.id)
  const prods = await prisma.product.findMany({
    where: { clientId },
    select: {
      id: true,
      code: true,
      name: true,
      price: true
    }
  })
  return NextResponse.json(prods)
}
