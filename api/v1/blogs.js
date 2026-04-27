import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { key, search = '', page = 1, size = 10 } = req.query;

  if (!key) return res.status(400).json({ error: 'API Key is required' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

  try {
    const { data, error } = await supabase.rpc('get_blogs_by_api_key', {
      p_api_key: key,
      p_search: search,
      p_page: parseInt(page),
      p_size: parseInt(size)
    });

    if (error) return res.status(400).json({ error: error.message });
    if (data && data.error) return res.status(401).json({ error: data.error });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
