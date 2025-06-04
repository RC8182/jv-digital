// src/app/api/agente/audio/stt/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio'); // 'audio' es el nombre del campo en FormData

    if (!audioBlob) {
      return NextResponse.json({ error: 'Falta el archivo de audio para STT.' }, { status: 400 });
    }

    // Convertir Blob a un objeto File para la API de OpenAI Whisper
    const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type });

    console.log('STT Route: Iniciando transcripción con OpenAI Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });
    const transcribedText = transcription.text;
    console.log('STT Route: Transcripción completa:', transcribedText);

    return NextResponse.json({ text: transcribedText }, { status: 200 });

  } catch (error) {
    console.error('Error en la ruta STT:', error.message, error.stack);
    return NextResponse.json({ error: 'Error interno del servidor en la ruta STT.', details: error.message }, { status: 500 });
  }
}