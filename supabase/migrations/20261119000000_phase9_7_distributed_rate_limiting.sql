-- ==============================================================================
-- PHASE 9.7: Atomic Distributed Sliding-Window Rate Limiting for Public Bookings
-- Project: Psicóloga Grace Azevedo da Graça (Website & Appointment System)
-- Target DB: PostgreSQL / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RATE LIMIT BUCKETS TABLE
-- Stores pseudonymized HMAC-SHA256 identifiers (data minimization: avoids storing
-- raw IP addresses, emails, or phone numbers in plaintext).
-- Each key stores at most p_max_ip / p_max_contact timestamps in a sliding window.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  key_hash VARCHAR(80) PRIMARY KEY,
  attempt_timestamps TIMESTAMPTZ[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_booking_rate_limits_updated_at
  ON public.booking_rate_limits (updated_at);

-- ------------------------------------------------------------------------------
-- 2. STRICT ROW LEVEL SECURITY & PRIVILEGE HARDENING (LEAST PRIVILEGE)
-- Direct table access is revoked from PUBLIC, anon, authenticated, and service_role.
-- The table is accessed exclusively through the SECURITY DEFINER RPC function owned by postgres.
-- ------------------------------------------------------------------------------
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.booking_rate_limits FROM PUBLIC, anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. ATOMIC SLIDING-WINDOW RPC FUNCTION WITH 64-BIT ADVISORY LOCKS
-- Serializes concurrent requests across all Vercel serverless instances using
-- 64-bit transactional advisory locks (pg_advisory_xact_lock + hashtextextended)
-- acquired in deterministic lexicographical order to prevent deadlocks.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_record_booking_rate_limit(
  p_ip_hash TEXT,
  p_email_hash TEXT,
  p_phone_hash TEXT,
  p_window_seconds INT DEFAULT 900,
  p_max_ip INT DEFAULT 5,
  p_max_contact INT DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_now TIMESTAMPTZ;
  v_cutoff TIMESTAMPTZ;
  v_ip_clean TEXT := NULLIF(pg_catalog.btrim(COALESCE(p_ip_hash, '')), '');
  v_email_clean TEXT := NULLIF(pg_catalog.btrim(COALESCE(p_email_hash, '')), '');
  v_phone_clean TEXT := NULLIF(pg_catalog.btrim(COALESCE(p_phone_hash, '')), '');
  v_ip_active TIMESTAMPTZ[] := '{}';
  v_email_active TIMESTAMPTZ[] := '{}';
  v_phone_active TIMESTAMPTZ[] := '{}';
  v_retry_after INT;
  v_key TEXT;
BEGIN
  -- 1. Strict parameter validation
  IF v_email_clean IS NULL OR v_phone_clean IS NULL THEN
    RAISE EXCEPTION 'p_email_hash and p_phone_hash are required and cannot be empty';
  END IF;

  IF pg_catalog.length(v_email_clean) > 80 OR pg_catalog.length(v_phone_clean) > 80 THEN
    RAISE EXCEPTION 'Identifier hash exceeds maximum length of 80 characters';
  END IF;

  IF v_ip_clean IS NOT NULL AND pg_catalog.length(v_ip_clean) > 80 THEN
    RAISE EXCEPTION 'IP identifier hash exceeds maximum length of 80 characters';
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'p_window_seconds must be between 1 and 86400 seconds';
  END IF;

  IF p_max_ip IS NULL OR p_max_ip < 1 OR p_max_ip > 1000 THEN
    RAISE EXCEPTION 'p_max_ip must be between 1 and 1000';
  END IF;

  IF p_max_contact IS NULL OR p_max_contact < 1 OR p_max_contact > 1000 THEN
    RAISE EXCEPTION 'p_max_contact must be between 1 and 1000';
  END IF;

  -- 2. Acquire 64-bit transactional advisory locks in deterministic lexicographical order
  -- Deduplicates keys, ignores NULLs, prevents deadlocks, and serializes concurrent serverless requests
  FOR v_key IN
    SELECT DISTINCT k
    FROM pg_catalog.unnest(ARRAY[v_ip_clean, v_email_clean, v_phone_clean]) AS k
    WHERE k IS NOT NULL
    ORDER BY k ASC
  LOOP
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('psi_rl:' || v_key, 25999)
    );
  END LOOP;

  -- 3. Obtain wall-clock timestamp IMMEDIATELY AFTER all locks are acquired
  -- Captures the current post-lock execution instant (avoiding stale pre-lock timestamps
  -- from transactions that waited in the advisory lock queue, without assuming strict OS clock monotonicity)
  v_now := pg_catalog.clock_timestamp();
  v_cutoff := v_now - pg_catalog.make_interval(secs => p_window_seconds);

  -- 4. Evaluate IP sliding window (if IP hash is present)
  IF v_ip_clean IS NOT NULL THEN
    SELECT COALESCE(
      ARRAY(
        SELECT ts
        FROM pg_catalog.unnest(rl.attempt_timestamps) AS ts
        WHERE ts > v_cutoff
        ORDER BY ts ASC
      ),
      '{}'
    )
    INTO v_ip_active
    FROM public.booking_rate_limits AS rl
    WHERE rl.key_hash = v_ip_clean;

    v_ip_active := COALESCE(v_ip_active, '{}');

    IF pg_catalog.cardinality(v_ip_active) >= p_max_ip THEN
      v_retry_after := GREATEST(
        1,
        pg_catalog.ceil(
          EXTRACT(EPOCH FROM (v_ip_active[1] + pg_catalog.make_interval(secs => p_window_seconds) - v_now))
        )::INT
      );
      RETURN pg_catalog.jsonb_build_object(
        'allowed', false,
        'reason', 'ip_limit_exceeded',
        'retry_after_seconds', v_retry_after
      );
    END IF;
  END IF;

  -- 5. Evaluate Email sliding window
  SELECT COALESCE(
    ARRAY(
      SELECT ts
      FROM pg_catalog.unnest(rl.attempt_timestamps) AS ts
      WHERE ts > v_cutoff
      ORDER BY ts ASC
    ),
    '{}'
  )
  INTO v_email_active
  FROM public.booking_rate_limits AS rl
  WHERE rl.key_hash = v_email_clean;

  v_email_active := COALESCE(v_email_active, '{}');

  IF pg_catalog.cardinality(v_email_active) >= p_max_contact THEN
    v_retry_after := GREATEST(
      1,
      pg_catalog.ceil(
        EXTRACT(EPOCH FROM (v_email_active[1] + pg_catalog.make_interval(secs => p_window_seconds) - v_now))
      )::INT
    );
    RETURN pg_catalog.jsonb_build_object(
      'allowed', false,
      'reason', 'email_limit_exceeded',
      'retry_after_seconds', v_retry_after
    );
  END IF;

  -- 6. Evaluate Phone sliding window
  SELECT COALESCE(
    ARRAY(
      SELECT ts
      FROM pg_catalog.unnest(rl.attempt_timestamps) AS ts
      WHERE ts > v_cutoff
      ORDER BY ts ASC
    ),
    '{}'
  )
  INTO v_phone_active
  FROM public.booking_rate_limits AS rl
  WHERE rl.key_hash = v_phone_clean;

  v_phone_active := COALESCE(v_phone_active, '{}');

  IF pg_catalog.cardinality(v_phone_active) >= p_max_contact THEN
    v_retry_after := GREATEST(
      1,
      pg_catalog.ceil(
        EXTRACT(EPOCH FROM (v_phone_active[1] + pg_catalog.make_interval(secs => p_window_seconds) - v_now))
      )::INT
    );
    RETURN pg_catalog.jsonb_build_object(
      'allowed', false,
      'reason', 'phone_limit_exceeded',
      'retry_after_seconds', v_retry_after
    );
  END IF;

  -- 7. Record current timestamp atomically across all active keys
  IF v_ip_clean IS NOT NULL THEN
    INSERT INTO public.booking_rate_limits (key_hash, attempt_timestamps, updated_at)
    VALUES (v_ip_clean, pg_catalog.array_append(v_ip_active, v_now), v_now)
    ON CONFLICT (key_hash) DO UPDATE
      SET attempt_timestamps = EXCLUDED.attempt_timestamps,
          updated_at = EXCLUDED.updated_at;
  END IF;

  INSERT INTO public.booking_rate_limits (key_hash, attempt_timestamps, updated_at)
  VALUES (v_email_clean, pg_catalog.array_append(v_email_active, v_now), v_now)
  ON CONFLICT (key_hash) DO UPDATE
    SET attempt_timestamps = EXCLUDED.attempt_timestamps,
        updated_at = EXCLUDED.updated_at;

  INSERT INTO public.booking_rate_limits (key_hash, attempt_timestamps, updated_at)
  VALUES (v_phone_clean, pg_catalog.array_append(v_phone_active, v_now), v_now)
  ON CONFLICT (key_hash) DO UPDATE
    SET attempt_timestamps = EXCLUDED.attempt_timestamps,
        updated_at = EXCLUDED.updated_at;

  -- 8. Non-blocking sampled garbage collection (~5% of invocations, max 50 expired rows, SKIP LOCKED)
  IF pg_catalog.random() < 0.05 THEN
    DELETE FROM public.booking_rate_limits
    WHERE key_hash IN (
      SELECT rl_exp.key_hash
      FROM public.booking_rate_limits AS rl_exp
      WHERE rl_exp.updated_at <= v_cutoff
      ORDER BY rl_exp.updated_at ASC
      LIMIT 50
      FOR UPDATE SKIP LOCKED
    );
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'allowed', true
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. FUNCTION OWNERSHIP & EXECUTION PRIVILEGES
-- Explicit owner and strict service_role-only execution permission.
-- ------------------------------------------------------------------------------
ALTER FUNCTION public.check_and_record_booking_rate_limit(TEXT, TEXT, TEXT, INT, INT, INT)
  OWNER TO postgres;

REVOKE ALL ON FUNCTION public.check_and_record_booking_rate_limit(TEXT, TEXT, TEXT, INT, INT, INT)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_and_record_booking_rate_limit(TEXT, TEXT, TEXT, INT, INT, INT)
  TO service_role;
