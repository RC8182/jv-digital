import { NextResponse } from 'next/server';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

// Validar las variables de entorno
if (!WORDPRESS_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error("Faltan variables de entorno necesarias: WORDPRESS_API_URL, CONSUMER_KEY o CONSUMER_SECRET.");
}

const authHeaders = new Headers();
authHeaders.set('Authorization', 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64'));

export async function GET() {
  try {
    let products = [];
    let page = 1;
    let per_page = 100;

    while (true) {
      const response = await fetch(`${WORDPRESS_API_URL}/products?per_page=${per_page}&page=${page}`, {
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        break;
      }

      products = products.concat(data);
      page++;
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error al obtener productos." }, { status: 500 });
  }
}
