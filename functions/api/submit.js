// EdgeOne Pages Edge Function: 写入 Supabase（直接用 REST API，不依赖 npm）

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return cors(null, 204);
  }

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json({ error: 'Supabase env vars missing' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // PATCH: 标记 send_to_print
  if (request.method === 'PATCH') {
    const { id } = body;
    if (!id) return json({ error: 'Missing id' }, 400);

    const res = await supabaseFetch(SUPABASE_URL, SUPABASE_KEY,
      `submissions?id=eq.${id}`, 'PATCH',
      { send_to_print: true }
    );
    if (!res.ok) return json({ error: await res.text() }, 500);
    return json({ ok: true });
  }

  // POST: 新增记录
  if (request.method === 'POST') {
    const {
      job, repetitive, unique, keep,
      color_distribution, tags, replaceability_percent, evaluation_note,
    } = body;

    const uniqueVal = body.unique_value ?? unique;
    const keepVal   = body.want_to_keep ?? keep;

    const insertRes = await supabaseFetch(SUPABASE_URL, SUPABASE_KEY,
      'submissions', 'POST',
      {
        job,
        repetitive,
        unique_value: uniqueVal,
        want_to_keep: keepVal,
        color_distribution,
        tags,
        replaceability: replaceability_percent,
        evaluation_note,
        printed: false,
        send_to_print: false,
      }
    );

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return json({ error: err }, 500);
    }

    const inserted = await insertRes.json();
    const id = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id;

    // 查今日总数
    const today = new Date().toISOString().split('T')[0];
    const countRes = await supabaseFetch(SUPABASE_URL, SUPABASE_KEY,
      `submissions?created_at=gte.${today}T00:00:00.000Z&select=id`,
      'GET', null,
      { Prefer: 'count=exact' }
    );
    const countHeader = countRes.headers.get('content-range') ?? '';
    const count = parseInt(countHeader.split('/')[1] ?? '1', 10);

    return json({ id, count: isNaN(count) ? 1 : count });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function supabaseFetch(url, key, path, method, body, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=representation',
    ...extraHeaders,
  };
  return fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function cors(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
