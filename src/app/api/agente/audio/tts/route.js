// src/app/api/agente/audio/tts/route.js
import { NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai.js';
export const runtime = 'nodejs';



export async function POST(req) {
  const openai =await getOpenAI();
  try {
    const { text } = await req.json(); // Esperamos que el texto venga en el cuerpo JSON

    if (!text) {
      return NextResponse.json({ error: 'Falta el texto para convertir a voz (TTS).' }, { status: 400 });
    }

    console.log('TTS Route: Iniciando generación de audio para:', text.substring(0, 50) + '...'); // Mostrar los primeros 50 chars
    const speech = await openai.audio.speech.create({
      model: 'tts-1', // Puedes probar 'tts-1-hd' para mayor calidad si el presupuesto lo permite
      voice: 'nova', // Opciones: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      input: text,
    });

    // OpenAI devuelve un ReadableStream; convertirlo a Buffer para NextResponse
    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    console.log('TTS Route: Audio generado y listo para enviar.');

    const response = new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg', // Asumiendo que OpenAI TTS genera MP3
        'Content-Disposition': 'inline; filename="response.mp3"',
      },
    });
    return response;

  } catch (error) {
    console.error('Error en la ruta TTS:', error.message, error.stack);
    return NextResponse.json({ error: 'Error interno del servidor en la ruta TTS.', details: error.message }, { status: 500 });
  }
}