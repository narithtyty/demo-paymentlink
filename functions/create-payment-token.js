// Cloudflare Worker for /api/create-payment-token using native Web Crypto

function base64Url(input) {
  // input: Uint8Array or string
  let str;
  if (input instanceof Uint8Array) {
    str = Array.from(input)
      .map((b) => String.fromCharCode(b))
      .join('');
  } else {
    str = input;
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function signHS256(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return base64Url(new Uint8Array(sig));
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      const { payload, secretKey } = await request.json();
      if (!payload || !secretKey) {
        return new Response(JSON.stringify({ error: 'Missing payload or secretKey' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = base64Url(JSON.stringify(header));
      const encodedPayload = base64Url(JSON.stringify(payload));
      const signingInput = `${encodedHeader}.${encodedPayload}`;
      const signature = await signHS256(signingInput, secretKey);
      const token = `${signingInput}.${signature}`;

      return new Response(JSON.stringify({ token }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },
};
