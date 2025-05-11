import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

const HOST = `http://${process.env.CAMERA_IP}:${process.env.CAMERA_PORT}`;
const USER = process.env.USERNAMECAM;
const PASS = process.env.PASSWORD;

/* ── helper digest ── */
async function dahua(url) {
  const r1 = await axios({ url, validateStatus: () => true });
  if (r1.status === 200) return r1;                             // ok sin reto

  const hdr   = r1.headers['www-authenticate'];
  const nonce = /nonce="([^"]+)"/.exec(hdr)[1];
  const realm = /realm="([^"]+)"/.exec(hdr)[1];
  const uri   = new URL(url).pathname + new URL(url).search;

  const ha1 = crypto.createHash('md5').update(`${USER}:${realm}:${PASS}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`GET:${uri}`).digest('hex');
  const resp = crypto.createHash('md5')
                     .update(`${ha1}:${nonce}:00000001:abcdef:auth:${ha2}`).digest('hex');

  const auth =
    `Digest username="${USER}", realm="${realm}", nonce="${nonce}", uri="${uri}", ` +
    `algorithm=MD5, qop=auth, nc=00000001, cnonce="abcdef", response="${resp}"`;

  return axios({ url, headers: { Authorization: auth } });
}

/* ── GET /api/azul-cam/zoom?level=&current= ── */
export async function GET(req) {
  const prm     = new URL(req.url).searchParams;
  const target  = Number(prm.get('level')   ?? 1);
  const current = Number(prm.get('current') ?? 1);

  const steps   = Math.round((target - current) * 5);        // ≃0 .2 × por paso
  if (steps === 0) return NextResponse.json({ success: true });

  const code = steps > 0 ? 'ZoomTele' : 'ZoomWide';

  for (let i = 0; i < Math.abs(steps); i++) {
    const url = `${HOST}/cgi-bin/ptz.cgi?action=start&channel=1&code=${code}` +
                `&arg1=0&arg2=0&arg3=0&arg4=1`;             // arg4=1 ⇒ 1 s máx
    await dahua(url);
    await new Promise(r => setTimeout(r, 180));              // dejar que se mueva
  }

  return NextResponse.json({ success: true });
}
