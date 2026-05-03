// Vercel Serverless Function: submit data to Supabase

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req, res) {
  // PATCH: mark send_to_print = true
  if (req.method === 'PATCH') {
    const { id, send_to_print } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const supabase = getSupabase();
    const { error } = await supabase
      .from('submissions')
      .update({ send_to_print: true })
      .eq('id', id);

    if (error) {
      console.error('Supabase PATCH error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  // POST: insert new submission
  if (req.method === 'POST') {
    const {
      job, repetitive, unique_value, keep,
      color_distribution, tags, replaceability_percent, evaluation_note,
    } = req.body;

    // Accept both field names from frontend
    const uniqueVal = req.body.unique_value ?? req.body.unique;
    const keepVal   = req.body.keep ?? req.body.want_to_keep;

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('submissions')
      .insert({
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
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Get today's total count
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`);

    return res.status(200).json({ id: data.id, count: count ?? 1 });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
