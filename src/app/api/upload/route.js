import { NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp'; // Importa sharp

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { nombreDeLaPagina } = req.query; // Extraer nombreDeLaPagina de los parámetros de la query
      const uploadPath = path.join(process.cwd(), `public/vp/${nombreDeLaPagina}`);

      // Crear la carpeta si no existe
      fs.mkdir(uploadPath, { recursive: true })
        .then(() => cb(null, uploadPath))
        .catch(err => cb(err));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// Cambia la forma de manejar el POST
export const POST = async (req) => {
  const data = await req.formData();
  const file = data.get('file');
  const nombreDeLaPagina = data.get('nombreDeLaPagina');

  if (!file || !nombreDeLaPagina) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(process.cwd(), `public/vp/${nombreDeLaPagina}`, `${Date.now()}-${file.name}`);

  // Procesar la imagen usando Sharp
  try {
    await sharp(buffer)
      .rotate() // Corrige la orientación
      .toFile(filePath); // Guarda directamente en el archivo

    const fileUrl = `/vp/${nombreDeLaPagina}/${path.basename(filePath)}`;
    const response = NextResponse.json({ url: fileUrl });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;

  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
  }
};

export const segmentConfig = {
  api: {
    bodyParser: false,
  },
};
