-- ==============================================================================
-- PHASE 7C.2: PostgreSQL Database Privilege Hardening (Least Privilege)
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA USAGE PRIVILEGES
-- Ensure basic schema resolution remains active for standard PostgREST roles.
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. REVOKE UNNECESSARY TABLE PRIVILEGES
-- Strips TRUNCATE, REFERENCES, TRIGGER, and all surplus privileges from
-- anon and authenticated roles across all core tables.
-- ------------------------------------------------------------------------------
REVOKE ALL ON TABLE public.appointments FROM anon, authenticated;
REVOKE ALL ON TABLE public.availability_schedules FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 3. MINIMUM REQUIRED PRIVILEGES: anon
-- - appointments: INSERT only (for public appointment requests, guarded by RLS)
-- - availability_schedules: SELECT only (for viewing unblocked slots, guarded by RLS)
-- - admin_users: NO table privileges (default deny strictly preserved)
-- ------------------------------------------------------------------------------
GRANT INSERT ON TABLE public.appointments TO anon;
GRANT SELECT ON TABLE public.availability_schedules TO anon;

-- ------------------------------------------------------------------------------
-- 4. MINIMUM REQUIRED PRIVILEGES: authenticated
-- - appointments: SELECT only (for clinic review of appointments, guarded by RLS)
-- - availability_schedules: SELECT, INSERT, UPDATE, DELETE (guarded by public.is_admin() in RLS)
-- - admin_users: SELECT only (for admin self-read check, guarded by RLS)
-- ------------------------------------------------------------------------------
GRANT SELECT ON TABLE public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.availability_schedules TO authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. SERVER-SIDE PRIVILEGES: service_role
-- Retain full administrative access for trusted server-only operations
-- (such as the syncAdminUser server action).
-- ------------------------------------------------------------------------------
GRANT ALL ON TABLE public.appointments TO service_role;
GRANT ALL ON TABLE public.availability_schedules TO service_role;
GRANT ALL ON TABLE public.admin_users TO service_role;
