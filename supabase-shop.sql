-- =============================================
-- TEXHAUS B2B - Categorias, Pagamentos e Fretes
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. CATEGORIAS HIERÁRQUICAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert categories" ON categories;
CREATE POLICY "Admin insert categories"
  ON categories FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update categories" ON categories;
CREATE POLICY "Admin update categories"
  ON categories FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete categories" ON categories;
CREATE POLICY "Admin delete categories"
  ON categories FOR DELETE USING (public.is_admin());

-- Inserir categorias padrão
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Tecidos', 'tecidos', 1),
  ('Acessórios', 'acessorios', 2),
  ('Cortinas', 'cortinas', 3),
  ('Persianas', 'persianas', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. FORMAS DE PAGAMENTO
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  discount_text TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read payments" ON payment_methods;
CREATE POLICY "Public read payments"
  ON payment_methods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage payments" ON payment_methods;
CREATE POLICY "Admin manage payments"
  ON payment_methods FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update payments" ON payment_methods FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete payments" ON payment_methods FOR DELETE USING (public.is_admin());

INSERT INTO payment_methods (name, description, icon, discount_text, sort_order) VALUES
  ('Pix', 'Pagamento instantâneo, liquidação imediata.', 'pix', '5% de desconto', 1),
  ('Cartão de Crédito', 'Parcelamento em até 12x.', 'credit-card', 'Sem juros', 2),
  ('Boleto Bancário', 'Vencimento em 3 dias úteis.', 'boleto', NULL, 3)
ON CONFLICT DO NOTHING;

-- 3. FRETE / FORMAS DE ENTREGA
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  regions TEXT[] DEFAULT '{}',
  estimated_days TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read shipping" ON shipping_methods;
CREATE POLICY "Public read shipping"
  ON shipping_methods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage shipping" ON shipping_methods;
CREATE POLICY "Admin manage shipping"
  ON shipping_methods FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update shipping" ON shipping_methods FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete shipping" ON shipping_methods FOR DELETE USING (public.is_admin());

INSERT INTO shipping_methods (name, description, price, regions, estimated_days, sort_order) VALUES
  ('Retirada na Empresa', 'Retire em nosso endereço em São Paulo, SP.', 0, ARRAY['São Paulo - SP'], 'Agendado', 1),
  ('Frete Fixo - Capital SP', 'Entrega na cidade de São Paulo.', 19.90, ARRAY['São Paulo - Capital'], '1 a 3 dias úteis', 2),
  ('Frete Fixo - Grande SP', 'Região metropolitana de São Paulo.', 29.90, ARRAY['Grande São Paulo'], '2 a 5 dias úteis', 3),
  ('Frete Fixo - Sudeste', 'Estados de SP (interior), RJ, MG, ES.', 39.90, ARRAY['São Paulo (interior)', 'Rio de Janeiro', 'Minas Gerais', 'Espírito Santo'], '3 a 7 dias úteis', 4),
  ('Frete Fixo - Demais Regiões', 'Sul, Centro-Oeste, Nordeste, Norte.', 59.90, ARRAY['Sul', 'Centro-Oeste', 'Nordeste', 'Norte'], '5 a 15 dias úteis', 5)
ON CONFLICT DO NOTHING;
