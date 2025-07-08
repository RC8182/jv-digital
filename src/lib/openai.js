// src/lib/openai.js
import OpenAI from 'openai';

let openai;

if (!global._openai) {
  global._openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

openai = global._openai;

export function getOpenAI() {
  return openai;
}
