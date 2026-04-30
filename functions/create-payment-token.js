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

function withCors(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname || '/';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Simple GET info endpoint at root or /api
    if (request.method === 'GET') {
      return withCors({ message: 'EPOS Payment Link Worker', usage: 'POST JSON { payload, secretKey } to this endpoint' });
    }

    if (request.method !== 'POST') {
      return withCors({ error: 'Method Not Allowed' }, 405);
    }

    try {
      const { payload, secretKey } = await request.json();
      if (!payload || !secretKey) {
        return withCors({ error: 'Missing payload or secretKey' }, 400);
      }

      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = base64Url(JSON.stringify(header));
      const encodedPayload = base64Url(JSON.stringify(payload));
      const signingInput = `${encodedHeader}.${encodedPayload}`;
      const signature = await signHS256(signingInput, secretKey);
      const token = `${signingInput}.${signature}`;

      return withCors({ token }, 200);
    } catch (err) {
      return withCors({ error: err.message || 'Internal Server Error' }, 500);
    }
  },
};
