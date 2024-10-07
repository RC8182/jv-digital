import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const nombreDeLaPagina = searchParams.get('nombreDeLaPagina'); // Obtener nombreDeLaPagina de los parámetros de la URL

  if (!nombreDeLaPagina) {
    return NextResponse.json({ error: 'Falta el nombre de la página' }, { status: 400 });
  }

  const directory = path.join(process.cwd(), `public/vp/${nombreDeLaPagina}`);
  const files = await fs.promises.readdir(directory);

  const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

  const resizedImages = await Promise.all(images.map(async (image) => {
    const inputPath = path.join(directory, image);

    const resizedImageBuffer = await sharp(inputPath)
      .resize(800)
      .toBuffer();

    const base64String = resizedImageBuffer.toString('base64');

    return {
      name: image,
      data: base64String
    };
  }));

  const response = NextResponse.json(resizedImages);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return response;
}
