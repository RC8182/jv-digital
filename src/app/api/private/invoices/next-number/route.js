import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function GET() {
  // Año actual
  const year = new Date().getFullYear()
  // Contamos todas las facturas de este año (independientemente del cliente)
  const count = await prisma.invoice.count({
    where: {
      date: {
        gte: new Date(`${year}-01-01`),
        lt:  new Date(`${year + 1}-01-01`)
      }
    }
  })
  // Generamos “001-2025”, “002-2025”, etc.
  const consecutivo = String(count + 1).padStart(3, "0")
  const nextNumber = `${consecutivo}-${year}`
  return NextResponse.json({ nextNumber })
}
