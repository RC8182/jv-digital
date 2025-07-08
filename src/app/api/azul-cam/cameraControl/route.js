import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const HOST = `http://${process.env.CAMERA_IP}:${process.env.CAMERA_PORT}`;
const USER = process.env.USERNAMECAM;
const PASS = process.env.PASSWORD;

// Función para leer el estado del store desde localStorage (simulado en servidor)
function getPresetState() {
  try {
    // En el servidor, verificamos si existe un archivo de estado
    const statePath = path.join(process.cwd(), '.preset-state.json');
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      return state.presetsDisabled || false;
    }
    return false; // Por defecto, presets habilitados
  } catch (error) {
    console.error('Error leyendo estado de presets:', error);
    return false;
  }
}

// Función para verificar si la solicitud viene de Ricardo (admin)
function isAdminRequest(req) {
  try {
    const referer = req.headers.get('referer') || '';
    const userAgent = req.headers.get('user-agent') || '';
    
    // Verificar si la solicitud viene de la página de Ricardo
    return referer.includes('/ricardo') || userAgent.includes('ricardo');
  } catch (error) {
    console.error('Error verificando admin:', error);
    return false;
  }
}

/* digest */
async function dahua(url) {
  const r1 = await axios({ url, validateStatus: () => true });
  if (r1.status === 200) return r1;
  const h      = r1.headers['www-authenticate'];
  const nonce  = /nonce="([^"]+)"/.exec(h)[1];
  const realm  = /realm="([^"]+)"/.exec(h)[1];
  const uri    = new URL(url).pathname + new URL(url).search;
  const ha1    = crypto.createHash('md5').update(`${USER}:${realm}:${PASS}`).digest('hex');
  const ha2    = crypto.createHash('md5').update(`GET:${uri}`).digest('hex');
  const resp   = crypto.createHash('md5')
                       .update(`${ha1}:${nonce}:00000001:abcdef:auth:${ha2}`).digest('hex');
  const auth   =
    `Digest username="${USER}", realm="${realm}", nonce="${nonce}", uri="${uri}", ` +
    `algorithm=MD5, qop=auth, nc=00000001, cnonce="abcdef", response="${resp}"`;
  return axios({ url, headers:{ Authorization: auth } });
}

/* handler */
export async function GET(req) {
  const u   = new URL(req.url);
  const qs  = u.searchParams;
  let  cam;

  if (qs.has('preset')) {
    // Verificar si los presets están deshabilitados (excepto para admin)
    const presetsDisabled = getPresetState();
    const isAdmin = isAdminRequest(req);
    
    if (presetsDisabled && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Presets deshabilitados globalmente',
        presetsDisabled: true 
      }, { status: 403 });
    }
    
    const p = qs.get('preset');
    cam = `${HOST}/cgi-bin/ptz.cgi?action=start&channel=1&code=GotoPreset` +
          `&arg1=0&arg2=${p}&arg3=0`;
  } else {
    cam = `${HOST}/cgi-bin/ptz.cgi${u.search}`;   // joystick / zoomTele / etc.
  }

  try {
    const r = await dahua(cam);
    return NextResponse.json({ success: r.status === 200 });
  } catch (e) {
    return NextResponse.json({ success:false, error:e.message }, { status:502 });
  }
}
