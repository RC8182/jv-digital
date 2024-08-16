import { NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Configurar multer para manejar la subida de archivos
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

export const POST = async (req) => {
  const data = await req.formData();
  const file = data.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(process.cwd(), 'public/uploads', `${Date.now()}-${file.name}`);
  
  await fs.writeFile(filePath, buffer);

  const fileUrl = `/uploads/${path.basename(filePath)}`;
  const response = NextResponse.json({ url: fileUrl });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return response;
};

// Actualización aquí:
export const segmentConfig = {
  api: {
    bodyParser: false,
  },
};
