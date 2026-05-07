-- =============================================
-- TEXHAUS B2B - Migração Supabase (Fase 1)
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Tabela de Perfis (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  phone TEXT NOT NULL,
  customer_type TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'b2b_pending' CHECK (role IN ('admin', 'b2b_pending', 'b2b_approved', 'b2b_rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Função auxiliar para verificar admin (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuário pode ler o próprio perfil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário pode inserir o próprio perfil (no cadastro)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin pode ler todos os perfis
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Admin pode atualizar qualquer perfil
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- 4. Trigger: criar perfil automaticamente ao registrar (fallback)
-- (Opcional - útil se o cadastro vier de outra fonte)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name, cnpj, phone, customer_type, city, state, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'customer_type', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    'b2b_pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Criar admin inicial (substitua pelo e-mail do admin)
-- Execute APÓS criar o usuário admin pelo painel de Authentication
-- Nota: Substitua 'admin@texhaus.com.br' pelo e-mail real
-- Depois de executar, DELETE esta linha ou comente-a
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@texhaus.com.br';
