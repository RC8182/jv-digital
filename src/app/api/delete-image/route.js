import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(req) {
  const { name, nombreDeLaPagina } = await req.json(); // nombreDeLaPagina se extrae de la petición

  if (!name || !nombreDeLaPagina) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), `public/vp/${nombreDeLaPagina}`, name);

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.chmod(filePath, 0o666);
    await fs.promises.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 });
  }
}
