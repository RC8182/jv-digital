import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/* ───────────── GET /api/clients ───────────── */
export async function GET() {
  const list = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      nif: true,
      city: true,
      epigrafesIAE: true          // ← nombre correcto
    }
  })
  return NextResponse.json(list)
}

/* ───────────── POST /api/clients ─────────────
   Body: { name, address?, phone?, email?, nif?, city?, epigrafesIAE? }
------------------------------------------------*/
export async function POST(request) {
  const {
    name,
    address       = '',
    phone         = '',
    email         = '',
    nif           = '',
    city          = '',
    epigrafesIAE  = ''          // string con el código seleccionado (opcional)
  } = await request.json()

  if (!name) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const created = await prisma.client.create({
    data: { name, address, phone, email, nif, city, epigrafesIAE }
  })

  return NextResponse.json(created)
}
