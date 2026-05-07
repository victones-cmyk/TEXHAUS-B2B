-- =============================================
-- TEXHAUS B2B - Variações e Galeria de Produtos
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Novas colunas na tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Tabela de Variações
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT DEFAULT '',
  price_modifier DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- 3. RLS
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read variations" ON product_variations;
CREATE POLICY "Public read variations"
  ON product_variations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage variations" ON product_variations;
CREATE POLICY "Admin manage variations"
  ON product_variations FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update variations" ON product_variations;
CREATE POLICY "Admin update variations"
  ON product_variations FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete variations" ON product_variations;
CREATE POLICY "Admin delete variations"
  ON product_variations FOR DELETE USING (public.is_admin());
