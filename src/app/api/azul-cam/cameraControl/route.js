// app/api/cameraControl/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

const CAMERA_IP = "azul-kite.ddns.net";
const CAMERA_PORT = 48182;
const USERNAME = "rc8182"; 
const PASSWORD = "28645455Javi"; 

// Función para manejar la autenticación Digest
async function digestAuthRequest(url, method = 'GET') {
  try {
    // Primera solicitud para obtener el desafío de autenticación
    await axios.get(url, { auth: { username: USERNAME, password: PASSWORD } });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const authHeader = error.response.headers['www-authenticate'];
      const nonce = /nonce="([^"]+)"/.exec(authHeader)[1];
      const realm = /realm="([^"]+)"/.exec(authHeader)[1];
      const qop = /qop="([^"]+)"/.exec(authHeader)[1];

      const ha1 = crypto.createHash('md5').update(`${USERNAME}:${realm}:${PASSWORD}`).digest('hex');
      const ha2 = crypto.createHash('md5').update(`${method}:${url}`).digest('hex');
      const nc = '00000001';
      const cnonce = crypto.randomBytes(8).toString('hex');
      const response = crypto
        .createHash('md5')
        .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
        .digest('hex');

      const authDigest = `Digest username="${USERNAME}", realm="${realm}", nonce="${nonce}", uri="${url}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;

      // Segunda solicitud con autenticación digest
      const responseAuth = await axios.get(url, {
        headers: { Authorization: authDigest },
      });
      return responseAuth;
    } else {
      throw new Error("Error de conexión con la cámara");
    }
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const preset = url.searchParams.get("preset"); // Obtener el parámetro de preset

  if (!preset) {
    return NextResponse.json({ success: false, error: "Falta el parámetro de preset" }, { status: 400 });
  }

  // URL para ir al preset (ajustar según sea necesario)
  const cameraUrl = `http://${CAMERA_IP}:${CAMERA_PORT}/cgi-bin/ptz.cgi?action=start&channel=0&code=GotoPreset&arg1=0&arg2=${preset}&arg3=0`;

  try {
    const response = await digestAuthRequest(cameraUrl);
    if (response && response.status === 200) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Error en la respuesta de la cámara" });
    }
  } catch (error) {
    console.error("Error al controlar la cámara:", error);
    return NextResponse.json({ success: false, error: "Error en la conexión con la cámara", details: error.message });
  }
}
