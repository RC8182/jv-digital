import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// PUT: actualizar usuario
export async function PUT(request, { params }) {
  const { id } = params
  const { name, email, password } = await request.json()

  const data = { name, email }

  if (password) {
    const hashed = await bcrypt.hash(password, 10)
    data.password = hashed
  }

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data
  })

  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email })
}

// DELETE: eliminar usuario
export async function DELETE(request, { params }) {
  const { id } = params

  await prisma.user.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
