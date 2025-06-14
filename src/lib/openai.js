// src/lib/openai.js
import { OpenAI } from 'openai';

export async function getOpenAI() {
  const { OpenAI } = await import('openai');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
