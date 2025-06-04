// src/app/api/agente/agenda/plan-week/route.js

import { NextResponse } from 'next/server';
import { planWeek as backendPlanWeek } from '../tasks.js';

export const runtime = 'nodejs';

export async function POST(req) {
  const { weekStart, userId, accessToken, refreshToken } = await req.json();

  console.log('PLAN-WEEK ROUTE: Datos recibidos para plan_week:');
  console.log(`  weekStart: ${weekStart}`);
  console.log(`  userId: "${userId}" (Tipo: ${typeof userId}, Es nulo/indefinido: ${userId == null}, Es cadena vacía: ${userId === ''})`);
  console.log(`  accessToken: ${accessToken ? 'presente' : 'ausente'}`);
  console.log(`  refreshToken: ${refreshToken ? 'presente' : 'ausente'}`);


  if (!weekStart) {
    console.error('PLAN-WEEK ROUTE: Falta weekStart (400)');
    return NextResponse.json({ error: 'Falta weekStart (YYYY-MM-DD)' }, { status: 400 });
  }
  
  // ¡¡¡CAMBIO CRÍTICO AQUÍ!!! Cambia la condición de verificación de userId
  // Si userId es null, undefined, o una cadena vacía, debe fallar.
  if (userId == null || userId === '') { 
    console.error(`PLAN-WEEK ROUTE: userId es inválido ("${userId}"). Devolviendo 401.`);
    return NextResponse.json({ error: 'Falta userId o es inválido para esta operación interna.' }, { status: 401 });
  }

  try {
    const result = await backendPlanWeek(weekStart, userId, accessToken, refreshToken);
    console.log('PLAN-WEEK ROUTE: Planificación backend exitosa.');
    return NextResponse.json(result);
  } catch (error) {
    console.error('PLAN-WEEK ROUTE: Error en la planificación backend:', error);
    // Asegúrate de que siempre se devuelva un JSON válido
    return NextResponse.json({ error: error.message || 'Error desconocido al planificar la semana.' }, { status: 500 });
  }
}