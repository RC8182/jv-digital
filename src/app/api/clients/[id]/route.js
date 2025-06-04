// File: src/app/api/dashboard/clients/[id]/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/dashboard/clients/:id
 * Obtiene un cliente por su ID
 */
export async function GET(request, { params }) {
  const id = Number(params.id)
  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, name: true, address: true, phone: true, email: true, vat: true, city: true }
  })
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  return NextResponse.json(client)
}

/**
 * PUT /api/dashboard/clients/:id
 * Actualiza un cliente
 * Body: { name?, address?, phone?, email?, vat?, city? }
 */
export async function PUT(request, { params }) {
  const id = Number(params.id)
  const data = await request.json()
  const updated = await prisma.client.update({
    where: { id },
    data
  })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/dashboard/clients/:id
 * Elimina un cliente
 */
export async function DELETE(request, { params }) {
  const id = Number(params.id)
  await prisma.client.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
