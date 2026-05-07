-- =============================================
-- TEXHAUS B2B - Tabela de Contato
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact" ON contact_submissions;
CREATE POLICY "Anyone can insert contact"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact" ON contact_submissions;
CREATE POLICY "Admins can read contact"
  ON contact_submissions FOR SELECT
  USING (public.is_admin());
