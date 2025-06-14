import { getOpenAI } from '@/lib/openai.js';

const openai =await getOpenAI();

export async function embed(text) {
  const { data } = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return data[0].embedding;
}
