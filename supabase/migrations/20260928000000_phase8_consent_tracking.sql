-- ==============================================================================
-- PHASE 8.1: Consent Tracking Migration (RGPD / GDPR Compliance)
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD CONSENT TRACKING COLUMNS TO APPOINTMENTS TABLE
-- In accordance with Article 7(1) of the General Data Protection Regulation
-- (Regulation (EU) 2016/679), the data controller must be able to demonstrate
-- that the data subject has consented to processing of their personal data.
--
-- Strict Historical Integrity Rule:
-- We do NOT set 'DEFAULT true'. Historical appointments must remain NULL to
-- accurately reflect that digital consent tracking was not active at the time
-- of their creation.
--
-- For all new appointment requests, the application layer explicitly stores:
--   consent_given = true
--   consent_timestamp = [current UTC ISO timestamp]
--   consent_version = 'v1.0'
-- ------------------------------------------------------------------------------

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NULL,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS consent_version VARCHAR(20) NULL;

COMMENT ON COLUMN public.appointments.consent_given IS 'RGPD: Registo de consentimento explícito do utente para tratamento dos dados.';
COMMENT ON COLUMN public.appointments.consent_timestamp IS 'RGPD: Timestamp UTC no momento exato em que o consentimento foi prestado.';
COMMENT ON COLUMN public.appointments.consent_version IS 'RGPD: Versão da Política de Privacidade aceite no momento da submissão (ex: v1.0).';
