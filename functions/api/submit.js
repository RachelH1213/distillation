// EdgeOne Pages Edge Function: 写入 Supabase（REST API 直接调用）

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return cors(null, 204);

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return json({ error: 'Supabase env vars missing' }, 500);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  // PATCH: mark send_to_print
  if (request.method === 'PATCH') {
    const { id } = body;
    if (!id) return json({ error: 'Missing id' }, 400);

    const res = await sbFetch(SUPABASE_URL, SUPABASE_KEY,
      `submissions?id=eq.${id}`, 'PATCH', { send_to_print: true });
    if (!res.ok) return json({ error: await res.text() }, 500);
    return json({ ok: true });
  }

  // POST: insert new submission
  if (request.method === 'POST') {
    const {
      q1_job, q2_years, q3_location, q4_repetition,
      q5_tasks, q6_repetitive_thing, q7_quit_thought,
      q8_ai_usage, q9_ai_replace, q10_ai_feeling,
      q11_unique, q12_only_yours, q13_afternoon,
      q14_slacking, q15_redo_career, q16_keep,
      color_distribution, tags, replaceability_percent, evaluation_note,
      ai_relationship, afternoon_state, cognitive_blindspot, easter_egg,
    } = body;

    const insertRes = await sbFetch(SUPABASE_URL, SUPABASE_KEY, 'submissions', 'POST', {
      // New 16-question fields
      q1_job, q2_years, q3_location, q4_repetition,
      q5_tasks:           Array.isArray(q5_tasks) ? q5_tasks : [],
      q6_repetitive_thing, q7_quit_thought,
      q8_ai_usage, q9_ai_replace, q10_ai_feeling,
      q11_unique,
      q12_only_yours:     Array.isArray(q12_only_yours) ? q12_only_yours : [],
      q13_afternoon, q14_slacking, q15_redo_career, q16_keep,
      // AI analysis fields
      color_distribution,
      tags:               Array.isArray(tags) ? tags : [],
      replaceability:     replaceability_percent,
      evaluation_note,
      ai_relationship,
      afternoon_state,
      cognitive_blindspot: cognitive_blindspot || null,
      easter_egg,
      // Backward-compat fields
      job:          q1_job,
      repetitive:   q6_repetitive_thing,
      unique_value: q11_unique,
      want_to_keep: q16_keep,
      // Print flags
      printed:       false,
      send_to_print: false,
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error('Supabase insert error:', err);
      return json({ error: err }, 500);
    }

    const inserted = await insertRes.json();
    const id = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id;

    // Today's count
    const today = new Date().toISOString().split('T')[0];
    const countRes = await sbFetch(SUPABASE_URL, SUPABASE_KEY,
      `submissions?created_at=gte.${today}T00:00:00.000Z&select=id`,
      'GET', null, { Prefer: 'count=exact' });

    const rangeHeader = countRes.headers.get('content-range') ?? '';
    const count = parseInt(rangeHeader.split('/')[1] ?? '1', 10);

    return json({ id, count: isNaN(count) ? 1 : count });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function sbFetch(url, key, path, method, body, extraHeaders = {}) {
  return fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation',
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function cors(body, status = 204) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
