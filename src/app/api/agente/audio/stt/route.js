// src/app/api/dashboard/agente/audio/stt/route.js
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

    // Convertir el Blob a un ArrayBuffer primero, y luego a un Buffer de Node.js
    // Esto asegura que el archivo se maneje como datos binarios planos en el entorno de Node.js
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer); // <-- CAMBIO CLAVE AQUI

    // Crear un objeto File compatible para OpenAI Whisper desde el Buffer
    // El 'name' y 'type' son importantes para que OpenAI lo reconozca
    const audioFile = new File([audioBuffer], 'audio.webm', { type: audioBlob.type }); // <-- Usamos audioBuffer aquí

    console.log('STT Route: Iniciando transcripción con OpenAI Whisper...');
    console.log(`STT Route: Archivo de audio recibido. Tamaño: ${audioBuffer.length} bytes, Tipo: ${audioBlob.type}`); // Log para depurar
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });
    const transcribedText = transcription.text;
    console.log('STT Route: Transcripción completa:', transcribedText);

    return NextResponse.json({ text: transcribedText }, { status: 200 });

  } catch (error) {
    console.error('Error en la ruta STT:', error.message, error.stack);
    // Incluir más detalles en el error para el frontend si es posible
    return NextResponse.json({ error: 'Error interno del servidor en la ruta STT.', details: error.message }, { status: 500 });
  }
}