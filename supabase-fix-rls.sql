-- =============================================
-- CORREÇÃO: RLS recursion infinita na tabela profiles
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Criar função SECURITY DEFINER para verificar admin
-- (evita recursão infinita nas policies)
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

-- 2. Remover policies antigas com recursão
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- 3. Recriar policies usando a função is_admin()
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- 4. (Opcional) Verificar se já existem perfis
SELECT * FROM profiles;

-- 5. Definir seu usuário como admin (substitua pelo seu e-mail)
-- Execute APÓS fazer login no site (para criar o perfil automaticamente)
-- UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
