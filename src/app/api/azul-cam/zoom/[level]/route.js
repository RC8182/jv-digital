import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';
import { setZoom } from '../state';


const HOST = `http://${process.env.CAMERA_IP}:${process.env.CAMERA_PORT}`;
const USER = process.env.USERNAMECAM;
const PASS = process.env.PASSWORD;

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

export async function GET(_req, { params }) {
  const lvl = Number(params.level);
  if (![1,2,3,4,5].includes(lvl))
    return NextResponse.json({ success:false, error:'nivel' }, { status:400 });

  const pulses = 5 * (lvl - 1);                 // 0·5·10·15·20
  const code   = pulses > 0 ? 'ZoomTele' : 'ZoomWide';
  for (let i = 0; i < Math.abs(pulses); i++) {
    const url = `${HOST}/cgi-bin/ptz.cgi?action=start&channel=1` +
                `&code=${code}&arg1=0&arg2=0&arg3=0&arg4=1`;
    await dahua(url);
    await new Promise(r => setTimeout(r, 200));
  }
  setZoom(lvl);
  return NextResponse.json({ success:true, level:lvl });
}
