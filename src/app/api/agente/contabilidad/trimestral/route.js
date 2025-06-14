import { NextResponse } from 'next/server';
import prisma           from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const url       = new URL(req.url);
    const triStr    = url.searchParams.get('trimestre'); // '1','2','3','4'
    const year      = parseInt(url.searchParams.get('year'), 10);
    const epigrafe  = url.searchParams.get('epigrafe') || 'all';                // ▶

    if (![ '1','2','3','4' ].includes(triStr) || isNaN(year)) {
      return NextResponse.json({ error: 'Parámetros inválidos. Usa trimestre=1..4 y year=YYYY.' }, { status: 400 });
    }

    const trimestre  = parseInt(triStr, 10);
    const startMonth = (trimestre - 1) * 3 + 1;
    const endMonth   = startMonth + 2;

    const startDate = new Date(`${year}-${String(startMonth).padStart(2, '0')}-01`);
    const endDate   = new Date(year, endMonth, 1);

    // Construyo el filtro base para facturas
    const invoiceBaseWhere = {
      date: { gte: startDate, lt: endDate },
      // ▶ Si no es "all", filtro por epígrafe en el cliente
      ...(epigrafe !== 'all' && {
        client: { epigrafesIAE: epigrafe }
      })
    };

    // Sumar ingresos (Invoice: subtotal, igic, irpf, total)
    const incomeSum = await prisma.invoice.aggregate({
      _sum: { subtotal: true, igic: true, irpf: true, total: true },
      _count: { id: true },
      where: invoiceBaseWhere,
    });

    // Sumar ingresos de facturas PAGADAS
    const paidIncomeSum = await prisma.invoice.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        ...invoiceBaseWhere,
        status: 'PAID',
      },
    });

    // Sumar ingresos de facturas PENDIENTES u OVERDUE
    const pendingIncomeSum = await prisma.invoice.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        ...invoiceBaseWhere,
        status: { in: ['PENDING', 'OVERDUE'] },
      },
    });

    // Construyo el filtro base para gastos
    const expenseBaseWhere = {
      date: { gte: startDate, lt: endDate },
      // ▶ Si no es "all", filtro por epígrafe en el array epigrafeIAE
      ...(epigrafe !== 'all' && {
        epigrafeIAE: { has: epigrafe }
      })
    };

    // Sumar gastos (Expense: baseAmount, taxAmount, totalAmount)
    const expenseSum = await prisma.expense.aggregate({
      _sum: { baseAmount: true, taxAmount: true, totalAmount: true },
      _count: { id: true },
      where: expenseBaseWhere,
    });

    // Extraer valores (asegurar no null)
    const ingresosBase           = incomeSum._sum.subtotal || 0;
    const ingresosIGIC           = incomeSum._sum.igic     || 0;
    const ingresosIRPF           = incomeSum._sum.irpf     || 0;
    const ingresosTotalFacturas  = incomeSum._sum.total    || 0;
    const totalFacturasEmitidas  = incomeSum._count.id     || 0;

    const ingresosPagadosTotal     = paidIncomeSum._sum.total || 0;
    const totalFacturasPagadas     = paidIncomeSum._count.id || 0;

    const ingresosPendientesTotal  = pendingIncomeSum._sum.total || 0;
    const totalFacturasPendientes  = pendingIncomeSum._count.id || 0;

    const gastosBase              = expenseSum._sum.baseAmount || 0;
    const gastosImpuesto          = expenseSum._sum.taxAmount   || 0;
    const totalGastosRegistrados  = expenseSum._count.id        || 0;

    // Calcular modelos
    const modelo130 = Number(((ingresosBase - gastosBase) * 0.20 - ingresosIRPF).toFixed(2));
    const modelo303 = Number((ingresosIGIC - gastosImpuesto).toFixed(2));

    return NextResponse.json({
      trimestre,
      year,
      epigrafe,                             // ▶ devolvemos también el filtro usado
      ingresosBase,
      ingresosIGIC,
      ingresosIRPF,
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
