// src/app/api/private/clients/[id]/invoices/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request, { params }) {
  const clientId = Number(params.id)
  const invoices = await prisma.invoice.findMany({
    where: { clientId },
    select: { id: true, number: true, date: true, total: true }
  })
  return NextResponse.json(invoices)
}
