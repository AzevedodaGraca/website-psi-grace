-- ==============================================================================
-- PHASE 7A: Initial Database Schema Migration
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('presencial', 'online')),
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL CHECK (
    time_slot IN (
      '09:00', '10:00', '11:00', '12:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    )
  ),
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(150) NOT NULL,
  patient_phone VARCHAR(30) NOT NULL,
  patient_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- DOUBLE-BOOKING PREVENTION UNIQUE INDEX
-- Partial unique index ensuring that no active (pending or confirmed) appointment
-- can occupy the same date and time slot. Cancelled appointments release the slot.
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment_slot
ON public.appointments (appointment_date, time_slot)
WHERE status IN ('pending', 'confirmed');

-- Additional query performance indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);

-- ------------------------------------------------------------------------------
-- 2. AVAILABILITY SCHEDULES TABLE (For Admin Management)
-- Supports default day-of-week slots as well as date-specific overrides.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_date DATE NULL, -- Set for date-specific overrides; NULL for weekly recurring default
  day_of_week INT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
  appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('presencial', 'online')),
  time_slot VARCHAR(10) NOT NULL CHECK (
    time_slot IN (
      '09:00', '10:00', '11:00', '12:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    )
  ),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_schedule_mode CHECK (
    (schedule_date IS NOT NULL AND day_of_week IS NULL) OR
    (schedule_date IS NULL AND day_of_week IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability_schedules (schedule_date);
CREATE INDEX IF NOT EXISTS idx_availability_dow ON public.availability_schedules (day_of_week);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_schedules ENABLE ROW LEVEL SECURITY;

-- Allow public users (anonymous) to insert new appointment requests
CREATE POLICY "Allow public insert appointments" ON public.appointments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Restrict SELECT access on patient appointments to authenticated admin users only
CREATE POLICY "Allow admin select appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

-- Allow authenticated admin users full CRUD operations on appointments
CREATE POLICY "Allow admin full access appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow public users to view unblocked availability schedules (for booking UI)
CREATE POLICY "Allow public select availability" ON public.availability_schedules
  FOR SELECT TO anon, authenticated
  USING (is_blocked = false);

-- Allow authenticated admin users full access to availability schedules
CREATE POLICY "Allow admin full access availability" ON public.availability_schedules
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 4. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_availability_updated_at
  BEFORE UPDATE ON public.availability_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
