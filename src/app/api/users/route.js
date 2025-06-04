// src/app/api/dashboard/users/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// GET /api/dashboard/users
export async function GET() {
  const list = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  })
  return NextResponse.json(list)
}

// POST /api/dashboard/users
export async function POST(request) {
  const data = await request.json()
  const hashed = await bcrypt.hash(data.password, 10)
  const created = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed }
  })
  // sólo devolvemos id, name y email
  return NextResponse.json({
    id: created.id, name: created.name, email: created.email
  })
}
