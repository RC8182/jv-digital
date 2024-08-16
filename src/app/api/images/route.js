import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const directory = path.join( 'public/uploads');
  const files = await fs.promises.readdir(directory);

  // Filtrar solo imágenes
  const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

  const response = NextResponse.json(images);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return response;
}
