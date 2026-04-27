import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@supabase/supabase-js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'api-bridge',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            
            if (url.pathname.startsWith('/api/v1/')) {
              const key = url.searchParams.get('key');
              const search = url.searchParams.get('search') || '';
              const page = parseInt(url.searchParams.get('page')) || 1;
              const size = parseInt(url.searchParams.get('size')) || 10;

              if (!key) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'API Key is required' }));
                return;
              }

              const supabaseUrl = env.VITE_SUPABASE_URL;
              const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
              const supabase = createClient(supabaseUrl, supabaseAnonKey);

              try {
                let rpcName = '';
                if (url.pathname === '/api/v1/projects') rpcName = 'get_projects_by_api_key';
                else if (url.pathname === '/api/v1/blogs') rpcName = 'get_blogs_by_api_key';
                else if (url.pathname === '/api/v1/data') rpcName = 'get_complete_data_by_api_key';

                if (!rpcName) {
                  next();
                  return;
                }

                const rpcParams = rpcName === 'get_complete_data_by_api_key' 
                  ? { p_api_key: key } 
                  : { p_api_key: key, p_search: search, p_page: page, p_size: size };

                const { data, error } = await supabase.rpc(rpcName, rpcParams);

                if (error) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: error.message }));
                  return;
                }

                if (data && data.error) {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: data.error }));
                  return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
  }
})
