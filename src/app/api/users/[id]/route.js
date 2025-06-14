import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET /api/users/:id
export async function GET(request, { params }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      epigrafesIAE: true
    }
  })
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }
  return NextResponse.json(user)
}

// PUT /api/users/:id
export async function PUT(request, { params }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const data = await request.json()
  const updateData = {}

  if (data.name !== undefined)        updateData.name = data.name
  if (data.email !== undefined)       updateData.email = data.email

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  if (data.epigrafesIAE !== undefined) {
    updateData.epigrafesIAE = Array.isArray(data.epigrafesIAE)
      ? data.epigrafesIAE
      : []
  }

  const updated = await prisma.user.update({
    where: { id },
    data:  updateData
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    epigrafesIAE: updated.epigrafesIAE
  })
}

// DELETE /api/users/:id
export async function DELETE(request, { params }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
