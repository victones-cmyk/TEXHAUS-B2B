-- =============================================
-- TEXHAUS B2B - Migração Supabase → PostgreSQL Local
-- Execute no Adminer ou psql
-- =============================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. PROFILES (com password_hash para auth local)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  cnpj TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  customer_type TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  cep TEXT DEFAULT '',
  address_street TEXT DEFAULT '',
  address_number TEXT DEFAULT '',
  address_complement TEXT DEFAULT '',
  address_neighborhood TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'b2b_pending'
    CHECK (role IN ('admin', 'b2b_pending', 'b2b_approved', 'b2b_rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0
);

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Tecidos', 'tecidos', 1),
  ('Acessórios', 'acessorios', 2),
  ('Cortinas', 'cortinas', 3),
  ('Persianas', 'persianas', 4)
ON CONFLICT (slug) DO NOTHING;

-- 4. PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT DEFAULT '',
  category TEXT DEFAULT '',
  price DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VARIAÇÕES DE PRODUTOS
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

-- 6. PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_company TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- 8. POSTS (BLOG)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONTATO
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FORMAS DE PAGAMENTO
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  discount_text TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

INSERT INTO payment_methods (name, description, icon, discount_text, sort_order) VALUES
  ('Pix', 'Pagamento instantâneo, liquidação imediata.', 'pix', '5% de desconto', 1),
  ('Cartão de Crédito', 'Parcelamento em até 12x.', 'credit-card', 'Sem juros', 2),
  ('Boleto Bancário', 'Vencimento em 3 dias úteis.', 'boleto', NULL, 3)
ON CONFLICT DO NOTHING;

-- 11. FRETE / ENTREGA
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

INSERT INTO shipping_methods (name, description, price, regions, estimated_days, sort_order) VALUES
  ('Retirada na Empresa', 'Retire em nosso endereço em São Paulo, SP.', 0, ARRAY['São Paulo - SP'], 'Agendado', 1),
  ('Frete Fixo - Capital SP', 'Entrega na cidade de São Paulo.', 19.90, ARRAY['São Paulo - Capital'], '1 a 3 dias úteis', 2),
  ('Frete Fixo - Grande SP', 'Região metropolitana de São Paulo.', 29.90, ARRAY['Grande São Paulo'], '2 a 5 dias úteis', 3),
  ('Frete Fixo - Sudeste', 'Estados de SP (interior), RJ, MG, ES.', 39.90, ARRAY['São Paulo (interior)', 'Rio de Janeiro', 'Minas Gerais', 'Espírito Santo'], '3 a 7 dias úteis', 4),
  ('Frete Fixo - Demais Regiões', 'Sul, Centro-Oeste, Nordeste, Norte.', 59.90, ARRAY['Sul', 'Centro-Oeste', 'Nordeste', 'Norte'], '5 a 15 dias úteis', 5)
ON CONFLICT DO NOTHING;

-- 12. CRIAR ADMIN INICIAL
-- Substitua pelo e-mail do admin e gere um hash de senha com:
-- node -e "console.log(require('bcryptjs').hashSync('suasenha', 10))"
-- INSERT INTO profiles (email, password_hash, full_name, role)
-- VALUES ('admin@texhaus.com.br', '$2a$10$...hash_aqui...', 'Administrador', 'admin');
