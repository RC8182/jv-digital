// File: src/app/api/private/clients/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/private/clients
 * Devuelve la lista de clientes
 */
export async function GET() {
  const list = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      vat: true,
      city: true
    }
  })
  return NextResponse.json(list)
}

/**
 * POST /api/private/clients
 * Crea un nuevo cliente
 * Body: { name, address, phone, email, vat, city }
 */
export async function POST(request) {
  const {
    name,
    address = "",
    phone   = "",
    email   = "",
    vat     = "",
    city    = ""
  } = await request.json()

  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  const created = await prisma.client.create({
    data: { name, address, phone, email, vat, city }
  })

  return NextResponse.json(created)
}
