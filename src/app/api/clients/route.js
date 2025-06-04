// File: src/app/api/dashboard/clients/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/dashboard/clients
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
      nif: true,
      city: true
    }
  })
  return NextResponse.json(list)
}

/**
 * POST /api/dashboard/clients
 * Crea un nuevo cliente
 * Body: { name, address, phone, email, nif, city }
 */
export async function POST(request) {
  const {
    name,
    address = "",
    phone   = "",
    email   = "",
    nif     = "",
    city    = ""
  } = await request.json()

  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  const created = await prisma.client.create({
    data: { name, address, phone, email, nif, city }
  })

  return NextResponse.json(created)
}
