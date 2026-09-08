-- ==============================================================================
-- PHASE 7C.1: PostgreSQL Table Privileges & Permissions Hardening
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA USAGE PRIVILEGES
-- Grant schema usage to the standard Supabase/PostgREST connection roles.
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. APPOINTMENTS TABLE PRIVILEGES
-- - anon: INSERT only (for public booking submission, guarded by RLS)
-- - authenticated: SELECT only (for clinic review, guarded by RLS)
-- - service_role: ALL (for backend/admin tasks)
-- ------------------------------------------------------------------------------
GRANT INSERT ON TABLE public.appointments TO anon;
GRANT SELECT ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO service_role;

-- ------------------------------------------------------------------------------
-- 3. AVAILABILITY SCHEDULES TABLE PRIVILEGES
-- - anon: SELECT (for viewing unblocked slots, guarded by RLS is_blocked = false)
-- - authenticated: SELECT, INSERT, UPDATE, DELETE (for admin schedule management, guarded by public.is_admin() in RLS)
-- - service_role: ALL (for server-side management)
-- ------------------------------------------------------------------------------
GRANT SELECT ON TABLE public.availability_schedules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.availability_schedules TO authenticated;
GRANT ALL ON TABLE public.availability_schedules TO service_role;

-- ------------------------------------------------------------------------------
-- 4. ADMIN USERS TABLE PRIVILEGES
-- - authenticated: SELECT only (guarded by RLS self-read policy)
-- - service_role: ALL (used by syncAdminUser server action to register authorized admins)
-- - anon: NO PRIVILEGES (default deny strictly preserved)
-- ------------------------------------------------------------------------------
GRANT SELECT ON TABLE public.admin_users TO authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;
