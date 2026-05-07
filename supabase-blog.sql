CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read posts" ON posts;
CREATE POLICY "Public can read posts"
  ON posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
CREATE POLICY "Admins can insert posts"
  ON posts FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update posts" ON posts;
CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  USING (public.is_admin());
