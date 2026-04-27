import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get API Key from query parameter 'key'
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ 
      error: 'API Key is required',
      usage: '/api/v1/data?key=pk_your_key_here'
    });
  }

  // Use environment variables (Vercel automatically picks these up)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Supabase configuration missing on server' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Call the RPC function we created earlier
    const { data, error } = await supabase.rpc('get_complete_data_by_api_key', {
      p_api_key: key
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Check if the RPC returned a logical error (e.g. invalid key)
    if (data && data.error) {
      return res.status(401).json({ error: data.error });
    }

    // Return the successful data
    return res.status(200).json(data);
  } catch (err) {
    console.error('Bridge API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
