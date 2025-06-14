import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET /api/users
export async function GET() {
  // Devolvemos id (string), name, email y epigrafesIAE
  const list = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      epigrafesIAE: true
    }
  })
  return NextResponse.json(list)
}

// POST /api/users
export async function POST(request) {
  const data = await request.json()

  // Hash de la contraseña
  const hashed = await bcrypt.hash(data.password, 10)

  // Asegurarse de que epigrafesIAE sea arreglo
  const epigrafesArray = Array.isArray(data.epigrafesIAE) ? data.epigrafesIAE : []

  const created = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      epigrafesIAE: epigrafesArray
    }
  })

  // Sólo devolvemos id, name, email y epígrafesIAE
  return NextResponse.json({
    id: created.id,
    name: created.name,
    email: created.email,
    epigrafesIAE: created.epigrafesIAE
  })
}
