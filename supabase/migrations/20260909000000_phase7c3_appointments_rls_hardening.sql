-- ==============================================================================
-- PHASE 7C.3: Appointments RLS Admin Policy Hardening
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN RLS POLICIES ON APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
-- Replace the overly permissive Phase 7A check (auth.role() = 'authenticated')
-- with the public.is_admin() authorization function.
--
-- Security context:
-- In Phase 7A, the admin policies on public.appointments checked:
--   auth.role() = 'authenticated'
-- which inadvertently authorized ANY authenticated user to view and perform
-- CRUD operations on patient appointments.
--
-- This migration updates the existing policies in place using ALTER POLICY:
-- - "Allow admin select appointments": requires public.is_admin() in USING
-- - "Allow admin full access appointments": requires public.is_admin() in both
--   USING and WITH CHECK
-- - Both policies apply strictly to the 'authenticated' role
--
-- The public INSERT policy ("Allow public insert appointments") is preserved
-- untouched to continue permitting anonymous and authenticated booking requests.
-- ------------------------------------------------------------------------------

-- A. Admin SELECT: Restrict SELECT access on patient appointments strictly to verified admins
ALTER POLICY "Allow admin select appointments" ON public.appointments
  TO authenticated
  USING (public.is_admin());

-- B. Admin FULL ACCESS: Restrict full CRUD operations strictly to verified admins
ALTER POLICY "Allow admin full access appointments" ON public.appointments
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
