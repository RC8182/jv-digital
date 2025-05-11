import { NextResponse } from 'next/server';
import { getZoom } from '../state';

export async function GET() {
  // Devuelve el zoom actual
  return NextResponse.json({ zoom: getZoom() });
}
