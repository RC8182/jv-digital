import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(req) {
  const { name } = await req.json();
  
  if (!name) {
    return NextResponse.json({ error: 'No se proporcionó el nombre de la imagen' }, { status: 400 });
  }

  // Asegúrate de que la ruta es correcta y corresponde al sistema de archivos del contenedor Docker
  const filePath = path.join(process.cwd(), 'public/uploads', name);

  try {
    await fs.promises.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 });
  }
}
