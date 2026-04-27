-- Create api_keys table for integration support
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  key_value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own API keys
CREATE POLICY "Users can view their own api keys"
  ON public.api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own API keys
CREATE POLICY "Users can insert their own api keys"
  ON public.api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own API keys
CREATE POLICY "Users can delete their own api keys"
  ON public.api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX api_keys_key_value_idx ON public.api_keys(key_value);

-- Create trigger for auto-update updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.api_keys IS 'API keys for third-party integrations';
COMMENT ON COLUMN public.api_keys.key_value IS 'The actual API key string';
