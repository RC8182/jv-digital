// src/app/api/agente/gastos/[id]/route.js
import { NextResponse }    from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }     from '@/app/api/auth/[...nextauth]/route';
import prisma              from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(req, { params }) {
  try {
    // 1 · Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2 · Parámetros y body
    const id = parseInt(params.id, 10);
    const body = await req.json();
    // body puede contener: supplier, date, baseAmount, taxAmount, totalAmount

    // 3 · Comprobar que ese gasto existe y pertenece al usuario
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 4 · Actualizar únicamente los campos válidos
    const fieldsToUpdate = {};
    for (const key of ['supplier', 'date', 'baseAmount', 'taxAmount', 'totalAmount']) {
      if (body[key] !== undefined) fieldsToUpdate[key] = body[key];
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: fieldsToUpdate,
    });

    return NextResponse.json({ status: 'ok', expense: updated });
  } catch (err) {
    console.error('PATCH /api/agente/gastos/:id', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
