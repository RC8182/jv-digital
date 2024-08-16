import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(req) {
  const { name } = await req.json();
  
  if (!name) {
    return NextResponse.json({ error: 'No se proporcionó el nombre de la imagen' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public/uploads', name);

  try {
    // Verificar si el archivo existe
    await fs.promises.access(filePath, fs.constants.F_OK);

    // Establecer permisos del archivo
    await fs.promises.chmod(filePath, 0o666);

    // Intentar eliminar el archivo
    await fs.promises.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 });
  }
}
