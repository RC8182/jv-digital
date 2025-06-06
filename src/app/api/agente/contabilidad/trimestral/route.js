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
    const startMonth = (trimestre - 1) * 3 + 1;
    const endMonth   = startMonth + 2;

    const startDate = new Date(`${year}-${String(startMonth).padStart(2, '0')}-01`);
    const endDate   = new Date(year, endMonth, 1);

    // Sumar ingresos (Invoice: subtotal, igic, irpf) en ese rango
    const incomeSum = await prisma.invoice.aggregate({
      _sum: { subtotal: true, igic: true, irpf: true, total: true },
      _count: { id: true },
      where: {
        date: { gte: startDate, lt: endDate },
      },
    });

    // Sumar ingresos de facturas PAGADAS en ese rango
    const paidIncomeSum = await prisma.invoice.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        date: { gte: startDate, lt: endDate },
        status: 'PAID',
      },
    });

    // Sumar ingresos de facturas PENDIENTES en ese rango (PENDING u OVERDUE)
    const pendingIncomeSum = await prisma.invoice.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        date: { gte: startDate, lt: endDate },
        status: { in: ['PENDING', 'OVERDUE'] }, // Incluir OVERDUE como pendiente de cobro
      },
    });

    // Sumar gastos (Expense: baseAmount, taxAmount, totalAmount) en ese rango
    const expenseSum = await prisma.expense.aggregate({
      _sum: { baseAmount: true, taxAmount: true, totalAmount: true },
      _count: { id: true },
      where: {
        date: { gte: startDate, lt: endDate },
      },
    });

    // Extraer valores (asegurar no null)
    const ingresosBase     = incomeSum._sum.subtotal || 0;
    const ingresosIGIC     = incomeSum._sum.igic     || 0;
    const ingresosIRPF     = incomeSum._sum.irpf     || 0; // IRPF retenido de las facturas emitidas
    const ingresosTotalFacturas = incomeSum._sum.total || 0;
    const totalFacturasEmitidas = incomeSum._count.id || 0;

    const ingresosPagadosTotal = paidIncomeSum._sum.total || 0;
    const totalFacturasPagadas = paidIncomeSum._count.id || 0;

    const ingresosPendientesTotal = pendingIncomeSum._sum.total || 0;
    const totalFacturasPendientes = pendingIncomeSum._count.id || 0;

    const gastosBase       = expenseSum._sum.baseAmount || 0;
    const gastosImpuesto   = expenseSum._sum.taxAmount  || 0;
    const totalGastosRegistrados = expenseSum._count.id || 0;

    // Calcular modelos
    // Modelo 130: (Ingresos Base - Gastos Base) * 0.20 - IRPF Retenido en las facturas de INGRESOS
    const modelo130 = Number(((ingresosBase - gastosBase) * 0.20 - ingresosIRPF).toFixed(2)); // <-- MODIFICADO AQUÍ
    const modelo303 = Number((ingresosIGIC - gastosImpuesto).toFixed(2));

    return NextResponse.json({
      trimestre,
      year,
      ingresosBase,
      ingresosIGIC,
      ingresosIRPF, // Devuelve también el IRPF retenido para que se vea en el frontend
      ingresosTotalFacturas,
      totalFacturasEmitidas,
      ingresosPagadosTotal,
      totalFacturasPagadas,
      ingresosPendientesTotal,
      totalFacturasPendientes,
      gastosBase,
      gastosImpuesto,
      totalGastosRegistrados,
      modelo130,
      modelo303,
    });
  } catch (err) {
    console.error('GET /api/agente/contabilidad/trimestral', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}