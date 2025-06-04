// src/app/api/agente/contabilidad/trimestral/route.js
import { NextResponse } from 'next/server';
import prisma           from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const url    = new URL(req.url);
    const triStr = url.searchParams.get('trimestre'); // '1','2','3','4'
    const year   = parseInt(url.searchParams.get('year'), 10);

    if (![ '1','2','3','4' ].includes(triStr) || isNaN(year)) {
      return NextResponse.json({ error: 'Parámetros inválidos. Usa trimestre=1..4 y year=YYYY.' }, { status: 400 });
    }

    const trimestre  = parseInt(triStr, 10);
    const startMonth = (trimestre - 1) * 3 + 1;      // T1→mes 1, T2→4, T3→7, T4→10
    const endMonth   = startMonth + 2;               // T1→mes 3, etc.

    // Definir fechas de inicio (inclusive) y fin (exclusive)
    const startDate = new Date(`${year}-${String(startMonth).padStart(2, '0')}-01`);
    const endDate   = new Date(`${year}-${String(endMonth + 1).padStart(2, '0')}-01`);

    // 1 · Sumar ingresos (Invoice: subtotal, igic, irpf) en ese rango
    const incomeSum = await prisma.invoice.aggregate({
      _sum: { subtotal: true, igic: true, irpf: true },
      where: {
        date: { gte: startDate, lt: endDate },
      },
    });

    // 2 · Sumar gastos (Expense: baseAmount, taxAmount, totalAmount) en ese rango
    const expenseSum = await prisma.expense.aggregate({
      _sum: { baseAmount: true, taxAmount: true, totalAmount: true },
      where: {
        date: { gte: startDate, lt: endDate },
      },
    });

    // 3 · Extraer valores (asegurar no null)
    const ingresosBase     = incomeSum._sum.subtotal || 0;
    const ingresosIGIC     = incomeSum._sum.igic     || 0;
    const ingresosIRPF     = incomeSum._sum.irpf     || 0;
    const gastosBase       = expenseSum._sum.baseAmount || 0;
    const gastosImpuesto   = expenseSum._sum.taxAmount  || 0;

    // 4 · Calcular modelos (puedes ajustar porcentajes si cambian)
    const modelo130 = Number(((ingresosBase - gastosBase) * 0.2).toFixed(2)); // 20% IRPF estimado
    const modelo303 = Number((ingresosIGIC - gastosImpuesto).toFixed(2));

    return NextResponse.json({
      trimestre,
      year,
      ingresosBase,
      ingresosIGIC,
      ingresosIRPF,
      gastosBase,
      gastosImpuesto,
      modelo130,
      modelo303,
    });
  } catch (err) {
    console.error('GET /api/agente/contabilidad/trimestral', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
