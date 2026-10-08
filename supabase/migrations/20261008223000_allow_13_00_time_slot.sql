-- ==============================================================================
-- MIGRATION: Allow 13:00 Time Slot in Appointments and Availability Schedules
-- ==============================================================================

-- 1. Update appointments table check constraint
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_time_slot_check;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_time_slot_check
  CHECK (
    time_slot IN (
      '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    )
  );

-- 2. Update availability_schedules table check constraint
ALTER TABLE public.availability_schedules
  DROP CONSTRAINT IF EXISTS availability_schedules_time_slot_check;

ALTER TABLE public.availability_schedules
  ADD CONSTRAINT availability_schedules_time_slot_check
  CHECK (
    time_slot IN (
      '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    )
  );
