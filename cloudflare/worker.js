// TropicalFit — Cloudflare Worker
// Handles: user registration, workout logging, leaderboard,
//          activity feed, global chat, push subscriptions + sending

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-ID',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url  = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');

    try {
      // ── User ──────────────────────────────────────────────
      if (path === '/api/user/register' && request.method === 'POST') {
        return handleUserRegister(request, env);
      }
      if (path.startsWith('/api/user/') && request.method === 'GET') {
        return handleUserGet(path, env);
      }

      // ── Workout ───────────────────────────────────────────
      if (path === '/api/workout/log' && request.method === 'POST') {
        return handleWorkoutLog(request, env);
      }

      // ── Leaderboard ───────────────────────────────────────
      if (path === '/api/leaderboard' && request.method === 'GET') {
        return handleLeaderboard(url, env);
      }

      // ── Feed ──────────────────────────────────────────────
      if (path === '/api/feed' && request.method === 'GET') {
        return handleFeed(env);
      }

      // ── Chat ──────────────────────────────────────────────
      if (path === '/api/chat' && request.method === 'GET') {
        return handleChatGet(url, env);
      }
      if (path === '/api/chat' && request.method === 'POST') {
        return handleChatPost(request, env);
      }

      // ── Push ──────────────────────────────────────────────
      if (path === '/api/push/subscribe' && request.method === 'POST') {
        return handlePushSubscribe(request, env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: 'Server error', detail: err.message }, 500);
    }
  },
};

// ── User Registration ────────────────────────────────────────────
async function handleUserRegister(request, env) {
  const body = await request.json();
  const { username, avatar_url, push_sub } = body;

  if (!username || username.length < 2 || username.length > 20) {
    return json({ error: 'Username must be 2-20 characters' }, 400);
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return json({ error: 'Letters, numbers and underscores only' }, 400);
  }

  // Check if username is taken
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).bind(username).first();

  if (existing) {
    // Return existing user ID so the same phone can re-register
    return json({ id: existing.id, username, existing: true });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO users (id, username, avatar_url) VALUES (?, ?, ?)'
  ).bind(id, username, avatar_url || null).run();

  // Optionally store push subscription
  if (push_sub) {
    await savePushSub(env, id, push_sub);
  }

  // Add join feed item
  await env.DB.prepare(
    'INSERT INTO feed (id, user_id, username, avatar_url, type, text) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), id, username, avatar_url || null, 'join', 'just joined TropicalFit').run();

  return json({ id, username, existing: false });
}

async function handleUserGet(path, env) {
  const id = path.split('/').pop();
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  if (!user) return json({ error: 'Not found' }, 404);

  // Get this week's volume
  const week = weekStart();
  const vol  = await env.DB.prepare(
    'SELECT COALESCE(SUM(volume), 0) as total FROM workouts WHERE user_id = ? AND week_start = ?'
  ).bind(id, week).first();

  return json({ ...user, weekVolume: vol.total });
}

// ── Workout Log ──────────────────────────────────────────────────
async function handleWorkoutLog(request, env) {
  const body = await request.json();
  const { user_id, title, volume, sets_completed, exercises, prs = [] } = body;

  if (!user_id || !volume) return json({ error: 'Missing fields' }, 400);

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'User not found' }, 404);

  // Save workout
  const workoutId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO workouts (id, user_id, title, volume, sets_completed, exercises_json, week_start)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(workoutId, user_id, title || null, volume, sets_completed || 0,
    JSON.stringify(exercises || []), weekStart()).run();

  // Save PRs
  for (const pr of prs) {
    await env.DB.prepare(
      'INSERT INTO prs (id, user_id, exercise, weight, reps, unit) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), user_id, pr.exercise, pr.weight, pr.reps, pr.unit || 'lbs').run();
  }

  // Add feed item
  const feedText = prs.length > 0
    ? `hit a new ${prs[0].exercise} PR — ${prs[0].weight} ${prs[0].unit || 'lbs'}`
    : `finished ${title || 'a workout'} · ${Math.round(volume).toLocaleString()} lbs`;
  await env.DB.prepare(
    'INSERT INTO feed (id, user_id, username, avatar_url, type, text) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), user_id, user.username, user.avatar_url,
    prs.length > 0 ? 'pr' : 'workout', feedText).run();

  // Send push to all users (if VAPID keys configured)
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    await broadcastPush(env, {
      title: 'TropicalFit',
      body: `${user.username} ${feedText}`,
      url: '/workoutlog/',
      tag: 'feed',
    }, user_id); // exclude sender
  }

  return json({ ok: true, workoutId });
}

// ── Leaderboard ──────────────────────────────────────────────────
async function handleLeaderboard(url, env) {
  const week = url.searchParams.get('week') || weekStart();

  const rows = await env.DB.prepare(`
    SELECT u.id, u.username, u.avatar_url, u.level, u.level_title,
           COALESCE(SUM(w.volume), 0) as week_volume
    FROM   users u
    LEFT JOIN workouts w ON w.user_id = u.id AND w.week_start = ?
    GROUP  BY u.id
    ORDER  BY week_volume DESC
    LIMIT  50
  `).bind(week).all();

  const weekEnds = new Date(week);
  weekEnds.setDate(weekEnds.getDate() + 7);

  return json({
    week,
    resetsAt: weekEnds.toISOString(),
    users: rows.results.map((r, i) => ({ ...r, rank: i + 1 })),
  });
}

// ── Feed ─────────────────────────────────────────────────────────
async function handleFeed(env) {
  const rows = await env.DB.prepare(
    'SELECT * FROM feed ORDER BY created_at DESC LIMIT 50'
  ).all();
  return json({ items: rows.results });
}

// ── Global Chat ──────────────────────────────────────────────────
async function handleChatGet(url, env) {
  const since = url.searchParams.get('since'); // ISO timestamp
  let rows;
  if (since) {
    rows = await env.DB.prepare(
      'SELECT * FROM chat WHERE created_at > ? ORDER BY created_at ASC LIMIT 100'
    ).bind(since).all();
  } else {
    rows = await env.DB.prepare(
      'SELECT * FROM chat ORDER BY created_at DESC LIMIT 60'
    ).all();
    rows.results.reverse();
  }
  return json({ messages: rows.results });
}

async function handleChatPost(request, env) {
  const body = await request.json();
  const { user_id, text } = body;
  if (!user_id || !text?.trim()) return json({ error: 'Missing fields' }, 400);

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'User not found' }, 404);

  // Basic profanity / length check
  if (text.length > 300) return json({ error: 'Message too long' }, 400);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO chat (id, user_id, username, avatar_url, text, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, user_id, user.username, user.avatar_url, text.trim(), now).run();

  // Push notification for chat (optional — can get noisy, keep off by default)
  // if (env.VAPID_PUBLIC_KEY) await broadcastPush(env, { ... }, user_id);

  return json({ id, created_at: now });
}

// ── Push Subscriptions ───────────────────────────────────────────
async function handlePushSubscribe(request, env) {
  const body = await request.json();
  const { user_id, subscription } = body;
  if (!user_id || !subscription?.endpoint) return json({ error: 'Missing fields' }, 400);

  await savePushSub(env, user_id, subscription);
  return json({ ok: true });
}

async function savePushSub(env, userId, sub) {
  await env.DB.prepare(`
    INSERT INTO push_subs (id, user_id, endpoint, p256dh, auth)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth
  `).bind(crypto.randomUUID(), userId, sub.endpoint, sub.keys?.p256dh, sub.keys?.auth).run();
}

// ── Web Push (VAPID) ─────────────────────────────────────────────
async function broadcastPush(env, payload, excludeUserId = null) {
  let query = 'SELECT * FROM push_subs';
  const params = [];
  if (excludeUserId) {
    query += ' WHERE user_id != ?';
    params.push(excludeUserId);
  }
  const subs = await env.DB.prepare(query).bind(...params).all();

  const payloadStr = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subs.results.map(sub => sendWebPush(env, sub, payloadStr))
  );

  // Clean up expired subscriptions (410 Gone)
  const expired = subs.results.filter((_, i) =>
    results[i].status === 'rejected' && results[i].reason?.status === 410
  );
  for (const sub of expired) {
    await env.DB.prepare('DELETE FROM push_subs WHERE id = ?').bind(sub.id).run();
  }
}

async function sendWebPush(env, sub, payloadStr) {
  // Build VAPID JWT
  const vapidHeaders = await buildVapidHeaders(
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
    env.VAPID_SUBJECT,
    sub.endpoint
  );

  const response = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      ...vapidHeaders,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body: await encryptPayload(payloadStr, sub.p256dh, sub.auth),
  });

  if (!response.ok) {
    const err = new Error(`Push failed: ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return response;
}

// ── VAPID JWT builder (no dependencies, pure Web Crypto) ─────────
async function buildVapidHeaders(publicKey, privateKey, subject, endpoint) {
  const audience = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header  = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = b64url(JSON.stringify({ aud: audience, exp, sub: subject }));
  const signing = `${header}.${payload}`;

  const keyData = base64ToUint8(privateKey);
  const key = await crypto.subtle.importKey(
    'pkcs8', keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signing)
  );

  const jwt = `${signing}.${uint8ToB64url(new Uint8Array(sig))}`;
  return {
    Authorization: `vapid t=${jwt}, k=${publicKey}`,
  };
}

// ── Payload encryption (RFC 8291 / aes128gcm) ────────────────────
async function encryptPayload(plaintext, p256dhB64, authB64) {
  const userPublicKey = base64ToUint8(p256dhB64);
  const userAuth      = base64ToUint8(authB64);

  // Generate server key pair
  const serverKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );
  const serverPublicKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', serverKeys.publicKey)
  );

  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: await crypto.subtle.importKey(
        'raw', userPublicKey, { name: 'ECDH', namedCurve: 'P-256' }, true, []
      )},
    serverKeys.privateKey, 256
  ));

  // Salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF
  const prk = await hkdf(userAuth, sharedSecret,
    concat(new TextEncoder().encode('WebPush: info\x00'), userPublicKey, serverPublicKey), 32);
  const cek = await hkdf(salt, prk,
    concat(new TextEncoder().encode('Content-Encoding: aes128gcm\x00'), new Uint8Array([1])), 16);
  const nonce = await hkdf(salt, prk,
    concat(new TextEncoder().encode('Content-Encoding: nonce\x00'), new Uint8Array([1])), 12);

  // Encrypt
  const data = new TextEncoder().encode(plaintext);
  const padded = concat(data, new Uint8Array([2])); // delimiter
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded)
  );

  // Build RFC 8291 body: salt(16) + rs(4) + keyid_len(1) + keyid + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, ciphertext.length + 16 + 1, false);
  return concat(salt, rs, new Uint8Array([serverPublicKey.length]), serverPublicKey, ciphertext);
}

// ── Crypto helpers ───────────────────────────────────────────────
async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8
  ));
}

function concat(...arrays) {
  const len = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function uint8ToB64url(buf) {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64ToUint8(b64) {
  const s = b64.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

// ── Helpers ──────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function weekStart() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // back to Sunday
  return d.toISOString().split('T')[0];
}
