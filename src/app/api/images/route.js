import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET() {
  const directory = path.join('public/uploads');
  const files = await fs.promises.readdir(directory);

  // Filtrar solo imágenes
  const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

  // Redimensionar imágenes y guardarlas en una variable
  const resizedImages = await Promise.all(images.map(async (image) => {
    const inputPath = path.join(directory, image);

    // Convertir a base64 después de redimensionar
    const resizedImageBuffer = await sharp(inputPath)
      .resize(800) // Cambia el tamaño según sea necesario
      .toBuffer();

    // Verificar que la imagen no esté bloqueada antes de continuar
    const base64String = resizedImageBuffer.toString('base64');
    
    return {
      name: image,
      data: base64String // Convertir a base64 para enviar como JSON
    };
  }));

  const response = NextResponse.json(resizedImages);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return response;
}
