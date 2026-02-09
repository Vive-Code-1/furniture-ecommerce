
-- Create a key-value settings table for admin-configurable settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings
CREATE POLICY "Admins can manage settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default values from current secrets (empty placeholders)
INSERT INTO public.site_settings (key, value) VALUES
  ('uddoktapay_api_key', ''),
  ('uddoktapay_base_url', '')
ON CONFLICT (key) DO NOTHING;
