-- ==============================================================================
-- PHASE 7C: Admin Authorization & Database-Level RLS Hardening
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEDICATED ADMIN USERS TABLE
-- Stores authorized administrator identities (tied to immutable auth.users UUIDs)
-- without storing passwords, secret keys, or sensitive credentials.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(150) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_users_identity_check CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY ON ADMIN USERS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Anonymous users have zero access to admin_users table (default deny).
-- Authenticated users can only read their own admin record if authorized.
CREATE POLICY "Allow admin read own admin_users record" ON public.admin_users
  FOR SELECT TO authenticated
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  );

-- ------------------------------------------------------------------------------
-- 3. IS_ADMIN() SECURITY DEFINER HELPER FUNCTION
-- Securely evaluates whether the calling request belongs to an authorized admin.
-- Operates in SECURITY DEFINER context with fixed search_path to prevent injection.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE (user_id IS NOT NULL AND user_id = auth.uid())
       OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 4. HARDEN RLS ON AVAILABILITY SCHEDULES
-- ------------------------------------------------------------------------------
-- Drop the previous overly permissive policy from Phase 7A that allowed ANY
-- authenticated user full access.
DROP POLICY IF EXISTS "Allow admin full access availability" ON public.availability_schedules;

-- Note: The Phase 7A policy "Allow public select availability"
-- (FOR SELECT TO anon, authenticated USING (is_blocked = false)) remains active,
-- permitting public users and booking clients to read unblocked slots.

-- A. Admin SELECT: Authorized admin can read all records (including blocked ones)
CREATE POLICY "Allow admin select all availability" ON public.availability_schedules
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- B. Admin INSERT: ONLY authorized admin can insert availability records
CREATE POLICY "Allow admin insert availability" ON public.availability_schedules
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- C. Admin UPDATE: ONLY authorized admin can update availability records
CREATE POLICY "Allow admin update availability" ON public.availability_schedules
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- D. Admin DELETE: ONLY authorized admin can delete availability records
CREATE POLICY "Allow admin delete availability" ON public.availability_schedules
  FOR DELETE TO authenticated
  USING (public.is_admin());
