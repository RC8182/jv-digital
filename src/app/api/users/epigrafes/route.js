// File: src/app/api/users/epigrafes/route.js

import { NextResponse }         from "next/server"
import { getServerSession }     from "next-auth"
import { authOptions }          from "@/app/api/auth/[...nextauth]/route"
import prisma                   from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(req) {
  // 1. Verificar sesión
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  // 2. Obtener los epígrafesIAE del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { epigrafesIAE: true }
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // 3. Devolver array de epígrafes
  return NextResponse.json({ epigrafes: user.epigrafesIAE })
}
