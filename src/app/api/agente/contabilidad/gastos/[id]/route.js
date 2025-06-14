// src/app/api/agente/contabilidad/gastos/[id]/route.js

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/app/api/auth/[...nextauth]/route';
import prisma               from '@/lib/prisma';

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
    // body puede contener: supplier, date, baseAmount, taxAmount, totalAmount, epigrafeIAE (array)

    // 3 · Comprobar que existe y pertenece al usuario
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 4 · Construir objeto con los campos a actualizar
    const fieldsToUpdate = {};
    if (body.supplier !== undefined)    fieldsToUpdate.supplier = body.supplier;
    if (body.date !== undefined) {
      fieldsToUpdate.date = body.date ? new Date(body.date) : null;
    }
    if (body.baseAmount !== undefined)   fieldsToUpdate.baseAmount = body.baseAmount;
    if (body.taxAmount !== undefined)    fieldsToUpdate.taxAmount = body.taxAmount;
    if (body.totalAmount !== undefined)  fieldsToUpdate.totalAmount = body.totalAmount;
    if (body.epigrafeIAE !== undefined) {
      if (Array.isArray(body.epigrafeIAE)) {
        fieldsToUpdate.epigrafeIAE = body.epigrafeIAE;
      } else {
        // Si recibimos string o nulo, lo convertimos a arreglo
        fieldsToUpdate.epigrafeIAE = body.epigrafeIAE
          ? [body.epigrafeIAE]
          : [];
      }
    }

    const updated = await prisma.expense.update({
      where: { id },
      data:  fieldsToUpdate
    });

    return NextResponse.json({ status: 'ok', expense: updated });
  } catch (err) {
    console.error('PATCH /api/agente/contabilidad/gastos/:id error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
