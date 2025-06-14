// src/app/api/dashboard/agente/audio/stt/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';  // se mantiene

export async function POST(req) {
  // 1) Cargamos OpenAI DINÁMICAMENTE y creamos el cliente
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // 2) Recogemos el audio
    const formData  = await req.formData();
    const audioBlob = formData.get('audio');

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'Falta el archivo de audio para STT.' },
        { status: 400 }
      );
    }

    // 3) Blob -> Buffer -> File (para Whisper)
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());
    const audioFile   = new File([audioBuffer], 'audio.webm', { type: audioBlob.type });

    // 4) Transcribimos
    const { text } = await openai.audio.transcriptions.create({
      file:  audioFile,
      model: 'whisper-1',
    });

    return NextResponse.json({ text }, { status: 200 });

  } catch (err) {
    console.error('STT error:', err);
    return NextResponse.json(
      { error: 'Error interno en STT.', details: err.message },
      { status: 500 }
    );
  }
}
