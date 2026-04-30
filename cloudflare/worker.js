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
      if (path === '/api/user/avatar' && request.method === 'POST') {
        return handleUserAvatar(request, env);
      }
      if (path === '/api/user/update' && request.method === 'POST') {
        return handleUserUpdate(request, env);
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

      // ── AI Proxy ──────────────────────────────────────────
      if (path === '/api/ai/chat' && request.method === 'POST') {
        return handleAIChat(request, env);
      }
      if (path === '/api/ai/describe-selfie' && request.method === 'POST') {
        return handleDescribeSelfie(request, env);
      }

      // ── Reactions ─────────────────────────────────────────
      if (path === '/api/react' && request.method === 'POST') {
        return handleReact(request, env);
      }
      if (path === '/api/reactions' && request.method === 'GET') {
        return handleGetReactions(url, env);
      }
      if (path === '/api/reactions/bulk' && request.method === 'POST') {
        return handleGetReactionsBulk(request, env);
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

async function handleUserAvatar(request, env) {
  const { user_id, avatar_url } = await request.json();
  if (!user_id || !avatar_url) return json({ error: 'Missing fields' }, 400);
  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'Not found' }, 404);
  await env.DB.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').bind(avatar_url, user_id).run();
  return json({ ok: true });
}

// Update username and/or avatar — called when user changes their name in settings
async function handleUserUpdate(request, env) {
  const { user_id, username, avatar_url } = await request.json();
  if (!user_id) return json({ error: 'Missing user_id' }, 400);
  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'Not found' }, 404);
  const parts = [], vals = [];
  if (username?.trim()) { parts.push('username = ?'); vals.push(username.trim()); }
  if (avatar_url)       { parts.push('avatar_url = ?'); vals.push(avatar_url); }
  if (!parts.length) return json({ ok: true });
  vals.push(user_id);
  await env.DB.prepare(`UPDATE users SET ${parts.join(', ')} WHERE id = ?`).bind(...vals).run();
  return json({ ok: true });
}

async function handleUserGet(path, env) {
  const id = path.split('/').pop();
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  if (!user) return json({ error: 'Not found' }, 404);

  // Get total volume and sessions
  const stats = await env.DB.prepare(`
    SELECT COALESCE(SUM(volume), 0) as totalVolume, COUNT(id) as sessions
    FROM workouts WHERE user_id = ?
  `).bind(id).first();

  // Get all workout dates for heatmap
  const dates = await env.DB.prepare(`
    SELECT logged_at FROM workouts WHERE user_id = ? ORDER BY logged_at DESC
  `).bind(id).all();

  return json({
    ...user,
    totalVolume: stats.totalVolume,
    sessions: stats.sessions,
    history: dates.results.map(d => d.logged_at)
  });
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
    users: rows.results.map((r, i) => ({ ...r, volume: r.week_volume, rank: i + 1 })),
  });
}

// ── Feed ─────────────────────────────────────────────────────────
async function handleFeed(env) {
  // JOIN users so avatar_url / username always reflect the current profile
  const rows = await env.DB.prepare(`
    SELECT f.id, f.user_id, f.type, f.text, f.created_at,
           COALESCE(u.username,   f.username)   AS username,
           COALESCE(u.avatar_url, f.avatar_url) AS avatar_url
    FROM feed f LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC LIMIT 50
  `).all();
  return json({ items: rows.results });
}

// ── Global Chat ──────────────────────────────────────────────────
async function handleChatGet(url, env) {
  const since = url.searchParams.get('since'); // ISO timestamp
  // Always JOIN users so we get the current avatar/username, not the snapshot stored at send-time
  const SELECT = `
    SELECT c.id, c.user_id, c.text, c.created_at,
           COALESCE(u.username,   c.username)   AS username,
           COALESCE(u.avatar_url, c.avatar_url) AS avatar_url
    FROM chat c LEFT JOIN users u ON c.user_id = u.id`;
  let rows;
  if (since) {
    rows = await env.DB.prepare(
      SELECT + ' WHERE c.created_at > ? ORDER BY c.created_at ASC LIMIT 100'
    ).bind(since).all();
  } else {
    rows = await env.DB.prepare(
      SELECT + ' ORDER BY c.created_at DESC LIMIT 60'
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

  // Push notification to all other subscribers
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    const preview = text.trim().length > 80 ? text.trim().substring(0, 80) + '…' : text.trim();
    await broadcastPush(env, {
      title: user.username || 'Someone',
      body: preview,
      tag: 'chat',
      url: '/workoutlog/',
    }, user_id); // exclude sender
  }

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

// ── Reactions ────────────────────────────────────────────────────
async function handleReact(request, env) {
  const body = await request.json();
  const { item_id, item_type, user_id, emoji, poster_user_id } = body;
  if (!item_id || !user_id || !emoji) return json({ error: 'Missing fields' }, 400);

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'User not found' }, 404);

  // Toggle: delete if exists, insert if not
  const existing = await env.DB.prepare(
    'SELECT id FROM reactions WHERE item_id = ? AND user_id = ? AND emoji = ?'
  ).bind(item_id, user_id, emoji).first();

  let added = false;
  if (existing) {
    await env.DB.prepare('DELETE FROM reactions WHERE id = ?').bind(existing.id).run();
  } else {
    await env.DB.prepare(
      'INSERT INTO reactions (id, item_id, item_type, user_id, emoji) VALUES (?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), item_id, item_type || 'feed', user_id, emoji).run();
    added = true;

    // Notify the poster (if different user and they have a push sub)
    if (poster_user_id && poster_user_id !== user_id && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
      const subs = await env.DB.prepare(
        'SELECT * FROM push_subs WHERE user_id = ?'
      ).bind(poster_user_id).all();
      for (const sub of subs.results) {
        sendWebPush(env, sub, JSON.stringify({
          title: 'New Reaction',
          body: `${user.username} reacted ${emoji} to your post`,
          url: '/workoutlog/',
          tag: 'reaction',
        })).catch(() => {});
      }
    }
  }

  // Return updated counts for this item
  const counts = await env.DB.prepare(
    'SELECT emoji, COUNT(*) as count FROM reactions WHERE item_id = ? GROUP BY emoji'
  ).bind(item_id).all();

  return json({ ok: true, added, counts: counts.results });
}

async function handleGetReactions(url, env) {
  const itemId = url.searchParams.get('item_id');
  if (!itemId) return json({ error: 'Missing item_id' }, 400);
  const rows = await env.DB.prepare(
    'SELECT emoji, COUNT(*) as count FROM reactions WHERE item_id = ? GROUP BY emoji'
  ).bind(itemId).all();
  return json({ counts: rows.results });
}

// Bulk fetch reactions for many items at once (used when chat/feed loads)
async function handleGetReactionsBulk(request, env) {
  const { item_ids, user_id } = await request.json();
  if (!item_ids?.length) return json({ counts: {}, mine: {} });

  const placeholders = item_ids.map(() => '?').join(',');

  // Aggregate counts per item+emoji
  const rows = await env.DB.prepare(
    `SELECT item_id, emoji, COUNT(*) as count FROM reactions WHERE item_id IN (${placeholders}) GROUP BY item_id, emoji`
  ).bind(...item_ids).all();

  const counts = {};
  rows.results.forEach(r => {
    if (!counts[r.item_id]) counts[r.item_id] = {};
    counts[r.item_id][r.emoji] = r.count;
  });

  // Which reactions belong to this user
  const mine = {};
  if (user_id) {
    const myRows = await env.DB.prepare(
      `SELECT item_id, emoji FROM reactions WHERE item_id IN (${placeholders}) AND user_id = ?`
    ).bind(...item_ids, user_id).all();
    myRows.results.forEach(r => {
      if (!mine[r.item_id]) mine[r.item_id] = {};
      mine[r.item_id][r.emoji] = true;
    });
  }

  return json({ counts, mine });
}

// ── AI Selfie Description (vision, 1/day per user) ───────────────
async function handleDescribeSelfie(request, env) {
  if (!env.GEMINI_API_KEY) return json({ error: 'AI not configured on server' }, 503);

  const body = await request.json();
  const { user_id, image_base64, mime_type } = body;
  if (!user_id || !image_base64) return json({ error: 'Missing fields' }, 400);

  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'Register first' }, 403);

  // Rate limit: 1 selfie analysis per user per day
  const today = new Date().toISOString().split('T')[0];
  const key = `selfie:${user_id}`;
  const usage = await env.DB.prepare(
    'SELECT count FROM ai_usage WHERE user_id = ? AND date_str = ?'
  ).bind(key, today).first().catch(() => null);

  if ((usage?.count || 0) >= 1) {
    return json({ error: 'Selfie portrait limit: 1/day. Add your Gemini API key in Settings for unlimited.' }, 429);
  }

  await env.DB.prepare(`
    INSERT INTO ai_usage (user_id, date_str, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, date_str) DO UPDATE SET count = count + 1
  `).bind(key, today).run().catch(() => {});

  const prompt = `Describe this person's physical appearance in concise detail for AI image generation. Focus on: gender, approximate age, ethnicity, hair color and style, eye color, skin tone, facial features, facial hair if any. Return ONLY a comma-separated descriptor list — no sentences. Example: "white male, mid 20s, short dark brown hair, blue eyes, light skin, strong jaw, light stubble"`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mime_type || 'image/jpeg', data: image_base64 } },
              { text: prompt }
            ]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
        })
      }
    );
    if (!resp.ok) return json({ error: `Gemini error ${resp.status}` }, 502);
    const data = await resp.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!description) return json({ error: 'Empty description from AI' }, 502);
    return json({ description });
  } catch (e) {
    return json({ error: 'Failed: ' + e.message }, 502);
  }
}

// ── AI Proxy (Gemini, rate-limited) ─────────────────────────────
async function handleAIChat(request, env) {
  if (!env.GEMINI_API_KEY) return json({ error: 'AI not configured on server' }, 503);

  const body = await request.json();
  const { user_id, messages, context } = body;
  if (!user_id || !messages?.length) return json({ error: 'Missing fields' }, 400);

  // Verify user exists
  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(user_id).first();
  if (!user) return json({ error: 'Register first' }, 403);

  // Rate limit: 15 messages / user / day (stored in D1)
  const today = new Date().toISOString().split('T')[0];
  const usage = await env.DB.prepare(
    'SELECT count FROM ai_usage WHERE user_id = ? AND date_str = ?'
  ).bind(user_id, today).first().catch(() => null);

  const count = usage?.count || 0;
  if (count >= 15) {
    return json({ error: 'Daily AI limit reached (15/day). Add your own Gemini key in Settings for unlimited.' }, 429);
  }

  // Upsert usage counter
  await env.DB.prepare(`
    INSERT INTO ai_usage (user_id, date_str, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, date_str) DO UPDATE SET count = count + 1
  `).bind(user_id, today).run().catch(() => {});

  // Build Gemini request
  const systemPrompt = `You are a premium Florida Keys Fitness Coach. Encouraging, laid-back, expert. Concise answers. User context: ${context || 'none'}`;
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  ];

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return json({ error: err.error?.message || `Gemini error ${resp.status}` }, 502);
    }
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: 'Empty response from AI' }, 502);
    return json({ text, remaining: 15 - count - 1 });
  } catch (e) {
    return json({ error: 'Failed to reach Gemini: ' + e.message }, 502);
  }
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
