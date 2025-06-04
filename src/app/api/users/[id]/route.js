import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}

export async function PUT(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const data = await request.json();
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const updated = await prisma.user.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
