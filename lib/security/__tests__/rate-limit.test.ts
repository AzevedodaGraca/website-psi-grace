import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

import {
  BOOKING_MAX_ATTEMPTS_PER_CONTACT,
  BOOKING_MAX_ATTEMPTS_PER_IP,
  BOOKING_RATE_LIMIT_ERROR_MESSAGE,
  BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE,
  BOOKING_RATE_LIMIT_WINDOW_MS,
  BOOKING_RATE_LIMIT_WINDOW_SECONDS,
  SlidingWindowRateLimiter,
  deriveRateLimitHmacKey,
  enforceDistributedBookingRateLimit,
  extractClientIpFromHeaders,
  hashRateLimitIdentifier,
  normalizeEmailForRateLimit,
  normalizeIpForRateLimit,
  normalizePhoneForRateLimit,
  type BookingRateLimitRpcArgs,
  type BookingRateLimitRpcResponse,
} from "../rate-limit";
import {
  bookAppointment,
  type CreateAppointmentInput,
} from "../../../app/booking/actions";
import type { AppointmentNotificationPayload } from "../../notifications/types";

const TEST_HMAC_SECRET = "test-only-server-secret-material-psi-grace-32bytes";

function createValidBookingInput(
  overrides?: Partial<CreateAppointmentInput>
): CreateAppointmentInput {
  return {
    appointment_type: "presencial",
    appointment_date: "2026-11-23", // Monday
    time_slot: "10:00",
    patient_name: "Ana Martins",
    patient_email: "ana.martins@example.com",
    patient_phone: "+351 912 345 678",
    patient_notes: "Primeira consulta.",
    consent_given: true,
    ...overrides,
  };
}

/**
 * Isolated PostgreSQL Transactional RPC Engine Simulator.
 * Faithfully executes the exact semantics of `public.check_and_record_booking_rate_limit`:
 * 1. Parameter validation.
 * 2. Deterministic lexicographical 64-bit advisory transaction locks (serialized queue).
 * 3. Wall-clock timestamp (`clock_timestamp()`) evaluated strictly AFTER lock acquisition.
 * 4. Sliding-window `TIMESTAMPTZ[]` array pruning and threshold enforcement.
 * 5. Atomic `ON CONFLICT (key_hash) DO UPDATE` recording.
 */
class IsolatedPgRateLimitEngine {
  private readonly table = new Map<
    string,
    { attempt_timestamps: number[]; updated_at: number }
  >();
  private lockQueue: Promise<void> = Promise.resolve();
  private simulatedClockMs: number;
  private lockWaitDelayMs: number;

  constructor(options?: { initialClockMs?: number; lockWaitDelayMs?: number }) {
    this.simulatedClockMs = options?.initialClockMs ?? 1_700_000_000_000;
    this.lockWaitDelayMs = options?.lockWaitDelayMs ?? 1;
  }

  setClockMs(ms: number): void {
    this.simulatedClockMs = ms;
  }

  advanceClockMs(deltaMs: number): void {
    this.simulatedClockMs += deltaMs;
  }

  getRecordedTimestamps(keyHash: string): number[] {
    return [...(this.table.get(keyHash)?.attempt_timestamps ?? [])];
  }

  async executeRpc(
    args: BookingRateLimitRpcArgs
  ): Promise<BookingRateLimitRpcResponse> {
    // Serialize execution through transactional advisory lock queue
    let releaseLock!: () => void;
    const prevLock = this.lockQueue;
    this.lockQueue = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    await prevLock;

    try {
      const ipClean = args.p_ip_hash?.trim() || null;
      const emailClean = args.p_email_hash?.trim() || null;
      const phoneClean = args.p_phone_hash?.trim() || null;

      if (!emailClean || !phoneClean) {
        return {
          data: null,
          error: {
            code: "22023",
            message: "p_email_hash and p_phone_hash are required",
          },
        };
      }

      if (
        emailClean.length > 80 ||
        phoneClean.length > 80 ||
        (ipClean && ipClean.length > 80)
      ) {
        return {
          data: null,
          error: {
            code: "22023",
            message: "Identifier hash exceeds maximum length of 80 characters",
          },
        };
      }

      if (
        args.p_window_seconds < 1 ||
        args.p_window_seconds > 86400 ||
        args.p_max_ip < 1 ||
        args.p_max_ip > 1000 ||
        args.p_max_contact < 1 ||
        args.p_max_contact > 1000
      ) {
        return {
          data: null,
          error: { code: "22023", message: "Invalid rate limit parameters" },
        };
      }

      // Deterministic lexicographical lock ordering (SELECT DISTINCT ... ORDER BY k ASC)
      const lockKeys = Array.from(
        new Set([ipClean, emailClean, phoneClean].filter(Boolean))
      ).sort();
      assert.ok(lockKeys.length >= 2);

      // Obtain wall-clock timestamp IMMEDIATELY AFTER lock acquisition
      this.simulatedClockMs += this.lockWaitDelayMs;
      const vNowMs = this.simulatedClockMs;
      const windowMs = args.p_window_seconds * 1000;
      const vCutoffMs = vNowMs - windowMs;

      const getActive = (key: string): number[] => {
        const row = this.table.get(key);
        if (!row) return [];
        return row.attempt_timestamps
          .filter((ts) => ts > vCutoffMs)
          .sort((a, b) => a - b);
      };

      // Evaluate IP sliding window
      const ipActive = ipClean ? getActive(ipClean) : [];
      if (ipClean && ipActive.length >= args.p_max_ip) {
        const retryAfter = Math.max(
          1,
          Math.ceil((ipActive[0] + windowMs - vNowMs) / 1000)
        );
        return {
          data: {
            allowed: false,
            reason: "ip_limit_exceeded",
            retry_after_seconds: retryAfter,
          },
          error: null,
        };
      }

      // Evaluate Email sliding window
      const emailActive = getActive(emailClean);
      if (emailActive.length >= args.p_max_contact) {
        const retryAfter = Math.max(
          1,
          Math.ceil((emailActive[0] + windowMs - vNowMs) / 1000)
        );
        return {
          data: {
            allowed: false,
            reason: "email_limit_exceeded",
            retry_after_seconds: retryAfter,
          },
          error: null,
        };
      }

      // Evaluate Phone sliding window
      const phoneActive = getActive(phoneClean);
      if (phoneActive.length >= args.p_max_contact) {
        const retryAfter = Math.max(
          1,
          Math.ceil((phoneActive[0] + windowMs - vNowMs) / 1000)
        );
        return {
          data: {
            allowed: false,
            reason: "phone_limit_exceeded",
            retry_after_seconds: retryAfter,
          },
          error: null,
        };
      }

      // Atomic upsert across all active keys
      if (ipClean) {
        this.table.set(ipClean, {
          attempt_timestamps: [...ipActive, vNowMs],
          updated_at: vNowMs,
        });
      }
      this.table.set(emailClean, {
        attempt_timestamps: [...emailActive, vNowMs],
        updated_at: vNowMs,
      });
      this.table.set(phoneClean, {
        attempt_timestamps: [...phoneActive, vNowMs],
        updated_at: vNowMs,
      });

      return {
        data: { allowed: true },
        error: null,
      };
    } finally {
      releaseLock();
    }
  }
}

/**
 * Builds an isolated mock Supabase Admin client connected to the transactional PostgreSQL RPC engine.
 */
function createIsolatedSupabaseMock(options?: {
  pgEngine?: IsolatedPgRateLimitEngine;
  customRpc?: (
    args: BookingRateLimitRpcArgs
  ) => Promise<BookingRateLimitRpcResponse>;
}) {
  const pgEngine = options?.pgEngine ?? new IsolatedPgRateLimitEngine();
  const insertedAppointments: Record<string, unknown>[] = [];
  let availabilityQueriesCount = 0;

  // Allow all 12 full-hour slots on Monday (day_of_week = 1) and Tuesday (day_of_week = 2)
  const allSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];
  const weeklySlots = [1, 2].flatMap((dow) =>
    allSlots.map((slot) => ({
      day_of_week: dow,
      appointment_type: "presencial",
      time_slot: slot,
      is_blocked: false,
    }))
  );

  const client = {
    rpc(fnName: string, args: BookingRateLimitRpcArgs) {
      assert.equal(fnName, "check_and_record_booking_rate_limit");
      if (options?.customRpc) {
        return options.customRpc(args);
      }
      return pgEngine.executeRpc(args);
    },
    from(table: string) {
      if (table === "availability_schedules") {
        availabilityQueriesCount++;
        return {
          select() {
            return {
              eq() {
                return Promise.resolve({ data: [], error: null });
              },
              is() {
                return {
                  eq(_col: string, dow: number) {
                    return Promise.resolve({
                      data: weeklySlots.filter((s) => s.day_of_week === dow),
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }

      if (table === "appointments") {
        return {
          select() {
            return {
              eq(_col1: string, dateVal: string) {
                return {
                  eq(_col2: string, slotVal: string) {
                    return {
                      in() {
                        return {
                          limit() {
                            const conflict = insertedAppointments.filter(
                              (a) =>
                                a.appointment_date === dateVal &&
                                a.time_slot === slotVal
                            );
                            return Promise.resolve({
                              data: conflict,
                              error: null,
                            });
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          insert(row: Record<string, unknown>) {
            const newId = `mock-apt-${insertedAppointments.length + 1}`;
            insertedAppointments.push({ id: newId, ...row });
            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: { id: newId },
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table in mock: ${table}`);
    },
  };

  return {
    client,
    pgEngine,
    insertedAppointments,
    getAvailabilityQueriesCount: () => availabilityQueriesCount,
  };
}

describe("Phase 9.7 — Rate Limiting Distribuído e Atómico (PostgreSQL RPC + HMAC-SHA256)", () => {
  describe("1. Normalização Canónica de IPv4, IPv6, Email e Telefone + HMAC-SHA256", () => {
    it("normaliza representações equivalentes de IPv4 e IPv6-mapped IPv4 para o mesmo identificador canónico", () => {
      const variants = [
        "203.0.113.42",
        " 203.000.113.042 ",
        "::ffff:203.0.113.42",
        "0:0:0:0:0:ffff:203.0.113.42",
        "0000:0000:0000:0000:0000:FFFF:cb00:712a",
        "[::ffff:203.0.113.42]",
      ];

      for (const v of variants) {
        assert.equal(normalizeIpForRateLimit(v), "203.0.113.42");
      }

      const referenceHash = hashRateLimitIdentifier(
        "ip",
        "203.0.113.42",
        TEST_HMAC_SECRET
      );
      for (const v of variants) {
        assert.equal(
          hashRateLimitIdentifier("ip", v, TEST_HMAC_SECRET),
          referenceHash
        );
      }
    });

    it("normaliza representações equivalentes de IPv6 (comprimidas, maiúsculas, zone index) para o mesmo identificador canónico", () => {
      const ipv6Variants = [
        "2001:db8::1",
        "2001:DB8:0:0:0:0:0:1",
        "2001:0db8:0000:0000:0000:0000:0000:0001",
        "[2001:db8:0::0:1]%en0",
      ];

      const expectedCanonical = "2001:0db8:0000:0000:0000:0000:0000:0001";
      for (const v of ipv6Variants) {
        assert.equal(normalizeIpForRateLimit(v), expectedCanonical);
      }

      const refHash = hashRateLimitIdentifier(
        "ip",
        ipv6Variants[0],
        TEST_HMAC_SECRET
      );
      for (const v of ipv6Variants) {
        assert.equal(
          hashRateLimitIdentifier("ip", v, TEST_HMAC_SECRET),
          refHash
        );
      }
    });

    it("mantém separação estrita de domínio e normalização independente para IP, Email e Telefone", () => {
      assert.equal(
        normalizePhoneForRateLimit("(+351) 912-345 678"),
        "+351912345678"
      );
      assert.equal(
        normalizeEmailForRateLimit("  Ana.Martins@Example.COM "),
        "ana.martins@example.com"
      );

      const ipHash = hashRateLimitIdentifier(
        "ip",
        "203.0.113.1",
        TEST_HMAC_SECRET
      );
      const emailHash = hashRateLimitIdentifier(
        "email",
        "ana@example.com",
        TEST_HMAC_SECRET
      );
      const phoneHash = hashRateLimitIdentifier(
        "phone",
        "(+351) 912 345 678",
        TEST_HMAC_SECRET
      );

      assert.ok(ipHash.startsWith("ip:"));
      assert.ok(emailHash.startsWith("email:"));
      assert.ok(phoneHash.startsWith("phone:"));
      assert.notEqual(ipHash, emailHash);
      assert.notEqual(emailHash, phoneHash);

      // Different secrets must produce completely different HMAC hashes
      const otherSecretHash = hashRateLimitIdentifier(
        "email",
        "ana@example.com",
        "another-independent-server-secret-key-999999"
      );
      assert.notEqual(emailHash, otherSecretHash);
    });

    it("recusa derivação de chave HMAC se não existir segredo válido configurado (sem fallback estático)", () => {
      const savedServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const savedRateLimitSecret = process.env.RATE_LIMIT_SECRET;
      try {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        delete process.env.RATE_LIMIT_SECRET;
        assert.throws(() => deriveRateLimitHmacKey(), /ausente ou inválida/);
        assert.throws(
          () => deriveRateLimitHmacKey("placeholder-key-1234567890"),
          /ausente ou inválida/
        );
      } finally {
        if (savedServiceKey !== undefined) {
          process.env.SUPABASE_SERVICE_ROLE_KEY = savedServiceKey;
        }
        if (savedRateLimitSecret !== undefined) {
          process.env.RATE_LIMIT_SECRET = savedRateLimitSecret;
        }
      }
    });

    it("prioriza x-vercel-forwarded-for sobre x-forwarded-for e normaliza o IP extraído", () => {
      const headersMap: Record<string, string> = {
        "x-forwarded-for": "1.2.3.4",
        "x-real-ip": "9.9.9.9",
        "x-vercel-forwarded-for": "::ffff:203.0.113.42",
      };
      const ip = extractClientIpFromHeaders((name) => headersMap[name]);
      assert.equal(ip, "203.0.113.42");
    });
  });

  describe("2. Validação da Migration SQL PostgreSQL (Segurança, Locks 64-bit e Permissões)", () => {
    it("verifica que a migration SQL cumpre todos os requisitos de segurança e atomicidade", () => {
      const migrationPath = join(
        process.cwd(),
        "supabase/migrations/20261119000000_phase9_7_distributed_rate_limiting.sql"
      );
      const sql = readFileSync(migrationPath, "utf8");

      // 1. SECURITY DEFINER, explicit owner, and safe search_path (pg_catalog FIRST, then public)
      assert.ok(sql.includes("SECURITY DEFINER"));
      assert.ok(sql.includes("SET search_path = pg_catalog, public"));
      assert.ok(
        sql.includes(
          "ALTER FUNCTION public.check_and_record_booking_rate_limit(TEXT, TEXT, TEXT, INT, INT, INT)\n  OWNER TO postgres;"
        )
      );

      // 2. 64-bit advisory locks (hashtextextended) with deterministic ordering
      assert.ok(sql.includes("pg_catalog.pg_advisory_xact_lock"));
      assert.ok(sql.includes("pg_catalog.hashtextextended('psi_rl:' || v_key, 25999)"));
      assert.ok(sql.includes("SELECT DISTINCT k"));
      assert.ok(sql.includes("ORDER BY k ASC"));

      // 3. Timestamp obtained strictly AFTER advisory lock loop
      const lockLoopEndIdx = sql.indexOf("PERFORM pg_catalog.pg_advisory_xact_lock");
      const clockTimestampIdx = sql.indexOf(
        "v_now := pg_catalog.clock_timestamp();"
      );
      assert.ok(lockLoopEndIdx !== -1 && clockTimestampIdx !== -1);
      assert.ok(
        clockTimestampIdx > lockLoopEndIdx,
        "v_now := clock_timestamp() must be evaluated after acquiring advisory locks"
      );

      // 4. Non-blocking sampled garbage collection with SKIP LOCKED
      assert.ok(sql.includes("FOR UPDATE SKIP LOCKED"));
      assert.ok(sql.includes("LIMIT 50"));

      // 5. Strict privilege hardening (REVOKE table access from PUBLIC, anon, authenticated, AND service_role; GRANT RPC execution only to service_role)
      assert.ok(
        sql.includes(
          "ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;"
        )
      );
      assert.ok(
        sql.includes(
          "REVOKE ALL ON TABLE public.booking_rate_limits FROM PUBLIC, anon, authenticated, service_role;"
        )
      );
      assert.ok(
        !sql.includes("GRANT ALL ON TABLE public.booking_rate_limits"),
        "service_role should not have direct table privileges when RPC is SECURITY DEFINER owned by postgres"
      );
      assert.ok(
        sql.includes(
          "REVOKE ALL ON FUNCTION public.check_and_record_booking_rate_limit(TEXT, TEXT, TEXT, INT, INT, INT)\n  FROM PUBLIC, anon, authenticated;"
        )
      );
      assert.ok(
        sql.includes(
          "GRANT EXECUTE ON FUNCTION public.check_and_record_booking_rate_limit(TEXT, TEXT, TEXT, INT, INT, INT)\n  TO service_role;"
        )
      );
    });
  });

  describe("3. Testes Simulados da Aplicação TypeScript (Server Action + Simulador Transacional em Memória)", () => {
    it("simulação em memória: 15 pedidos simultâneos com o mesmo IP e contactos diferentes: exatamente 5 autorizados e 10 bloqueados", async () => {
      const sharedPgEngine = new IsolatedPgRateLimitEngine();
      const sharedSupabase = createIsolatedSupabaseMock({
        pgEngine: sharedPgEngine,
      });
      const dispatchedEmails: AppointmentNotificationPayload[] = [];

      const slots = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ];

      // 15 concurrent requests, each running on its own cold-started serverless instance (separate localPreFilter)
      const concurrentRequests = Array.from({ length: 15 }, (_, idx) => {
        const instanceLocalPreFilter = new SlidingWindowRateLimiter();
        const dateStr = idx < 12 ? "2026-11-23" : "2026-11-24"; // Monday & Tuesday
        const slot = slots[idx % 12];

        return bookAppointment(
          createValidBookingInput({
            appointment_date: dateStr,
            time_slot: slot,
            patient_email: `concurrent.user.${idx}@example.com`,
            patient_phone: `+3519100000${String(idx).padStart(2, "0")}`,
          }),
          {
            // Mix equivalent IPv4 and IPv6-mapped representations of 203.0.113.55
            getClientIp: () =>
              idx % 2 === 0 ? "203.0.113.55" : "::ffff:203.0.113.55",
            localPreFilter: instanceLocalPreFilter,
            rateLimitSecretOverride: TEST_HMAC_SECRET,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createSupabaseAdmin: () => sharedSupabase.client as any,
            dispatchNotifications: async (payload) => {
              dispatchedEmails.push(payload);
            },
            getNow: async () => ({
              dateStr: "2026-11-20",
              hour: 10,
              minute: 0,
            }),
          }
        );
      });

      const results = await Promise.all(concurrentRequests);
      const allowed = results.filter((r) => r.success);
      const blocked = results.filter((r) => !r.success);

      assert.equal(allowed.length, BOOKING_MAX_ATTEMPTS_PER_IP); // Exactly 5 authorized
      assert.equal(blocked.length, 15 - BOOKING_MAX_ATTEMPTS_PER_IP); // Exactly 10 blocked
      assert.ok(
        blocked.every((r) => r.error === BOOKING_RATE_LIMIT_ERROR_MESSAGE)
      );

      // Blocked requests must NOT create appointment rows or send Resend emails
      assert.equal(sharedSupabase.insertedAppointments.length, 5);
      assert.equal(dispatchedEmails.length, 5);

      // Verify post-lock timestamps recorded in order of lock acquisition in the simulator
      const ipHash = hashRateLimitIdentifier(
        "ip",
        "203.0.113.55",
        TEST_HMAC_SECRET
      );
      const recordedTs = sharedPgEngine.getRecordedTimestamps(ipHash);
      assert.equal(recordedTs.length, 5);
    });

    it("simulação em memória: 15 pedidos simultâneos com o mesmo contacto e IPs diferentes: exatamente 3 autorizados e 12 bloqueados", async () => {
      const sharedPgEngine = new IsolatedPgRateLimitEngine();
      const sharedSupabase = createIsolatedSupabaseMock({
        pgEngine: sharedPgEngine,
      });
      const dispatchedEmails: AppointmentNotificationPayload[] = [];

      const slots = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ];

      const phoneVariations = [
        "+351 912 345 678",
        "+351 (912) 345-678",
        "+351912345678",
      ];

      const concurrentRequests = Array.from({ length: 15 }, (_, idx) => {
        const instanceLocalPreFilter = new SlidingWindowRateLimiter();
        const dateStr = idx < 12 ? "2026-11-23" : "2026-11-24";
        const slot = slots[idx % 12];

        return bookAppointment(
          createValidBookingInput({
            appointment_date: dateStr,
            time_slot: slot,
            patient_email: "vitima@example.com",
            patient_phone: phoneVariations[idx % phoneVariations.length],
          }),
          {
            getClientIp: () => `198.51.100.${idx + 1}`,
            localPreFilter: instanceLocalPreFilter,
            rateLimitSecretOverride: TEST_HMAC_SECRET,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createSupabaseAdmin: () => sharedSupabase.client as any,
            dispatchNotifications: async (payload) => {
              dispatchedEmails.push(payload);
            },
            getNow: async () => ({
              dateStr: "2026-11-20",
              hour: 10,
              minute: 0,
            }),
          }
        );
      });

      const results = await Promise.all(concurrentRequests);
      const allowed = results.filter((r) => r.success);
      const blocked = results.filter((r) => !r.success);

      assert.equal(allowed.length, BOOKING_MAX_ATTEMPTS_PER_CONTACT); // Exactly 3 authorized
      assert.equal(blocked.length, 15 - BOOKING_MAX_ATTEMPTS_PER_CONTACT); // Exactly 12 blocked
      assert.ok(
        blocked.every((r) => r.error === BOOKING_RATE_LIMIT_ERROR_MESSAGE)
      );
      assert.equal(sharedSupabase.insertedAppointments.length, 3);
      assert.equal(dispatchedEmails.length, 3);
    });
  });

  describe("4. Expiração Individual aos 900 Segundos e Ausência de Boundary Bursts", () => {
    it("impede boundary bursts na fronteira de 15 minutos e expira cada timestamp individualmente aos 900s", async () => {
      const t0 = 1_700_000_000_000;
      const pgEngine = new IsolatedPgRateLimitEngine({
        initialClockMs: t0,
        lockWaitDelayMs: 0,
      });

      // Attempt 1 at t = 0s
      pgEngine.setClockMs(t0);
      const r1 = await enforceDistributedBookingRateLimit(
        {
          ip: "203.0.113.90",
          email: "sliding@example.com",
          phone: "+351919999999",
          nowMs: t0,
          secretOverride: TEST_HMAC_SECRET,
        },
        {
          localPreFilter: new SlidingWindowRateLimiter(),
          rpcInvoker: (args) => pgEngine.executeRpc(args),
        }
      );
      assert.equal(r1.allowed, true);

      // Attempt 2 and 3 near the end of the 15-minute window: at t = 890s (14m50s) and t = 895s (14m55s)
      const t2 = t0 + 890_000;
      pgEngine.setClockMs(t2);
      const r2 = await enforceDistributedBookingRateLimit(
        {
          ip: "203.0.113.90",
          email: "sliding@example.com",
          phone: "+351919999999",
          nowMs: t2,
          secretOverride: TEST_HMAC_SECRET,
        },
        {
          localPreFilter: new SlidingWindowRateLimiter(),
          rpcInvoker: (args) => pgEngine.executeRpc(args),
        }
      );
      assert.equal(r2.allowed, true);

      const t3 = t0 + 895_000;
      pgEngine.setClockMs(t3);
      const r3 = await enforceDistributedBookingRateLimit(
        {
          ip: "203.0.113.90",
          email: "sliding@example.com",
          phone: "+351919999999",
          nowMs: t3,
          secretOverride: TEST_HMAC_SECRET,
        },
        {
          localPreFilter: new SlidingWindowRateLimiter(),
          rpcInvoker: (args) => pgEngine.executeRpc(args),
        }
      );
      assert.equal(r3.allowed, true);

      // At t = 899s (still within 900s of Attempt 1) -> Blocked
      const t899 = t0 + 899_000;
      pgEngine.setClockMs(t899);
      const blockedAt899 = await enforceDistributedBookingRateLimit(
        {
          ip: "203.0.113.90",
          email: "sliding@example.com",
          phone: "+351919999999",
          nowMs: t899,
          secretOverride: TEST_HMAC_SECRET,
        },
        {
          localPreFilter: new SlidingWindowRateLimiter(),
          rpcInvoker: (args) => pgEngine.executeRpc(args),
        }
      );
      assert.equal(blockedAt899.allowed, false);

      // At t = 905s (Attempt 1 at t=0s has expired, but Attempts 2 & 3 at 890s/895s are still active!):
      // Only ONE new attempt is allowed (preventing a boundary burst of 3 new attempts!)
      const t905 = t0 + 905_000;
      pgEngine.setClockMs(t905);
      const allowedOneAt905 = await enforceDistributedBookingRateLimit(
        {
          ip: "203.0.113.90",
          email: "sliding@example.com",
          phone: "+351919999999",
          nowMs: t905,
          secretOverride: TEST_HMAC_SECRET,
        },
        {
          localPreFilter: new SlidingWindowRateLimiter(),
          rpcInvoker: (args) => pgEngine.executeRpc(args),
        }
      );
      assert.equal(allowedOneAt905.allowed, true);

      // Immediately after at t = 906s -> Blocked again because [890s, 895s, 905s] are all active!
      const t906 = t0 + 906_000;
      pgEngine.setClockMs(t906);
      const blockedBoundaryBurst = await enforceDistributedBookingRateLimit(
        {
          ip: "203.0.113.90",
          email: "sliding@example.com",
          phone: "+351919999999",
          nowMs: t906,
          secretOverride: TEST_HMAC_SECRET,
        },
        {
          localPreFilter: new SlidingWindowRateLimiter(),
          rpcInvoker: (args) => pgEngine.executeRpc(args),
        }
      );
      assert.equal(blockedBoundaryBurst.allowed, false);
      assert.equal(blockedBoundaryBurst.reason, "email_limit_exceeded");
      assert.equal(
        BOOKING_RATE_LIMIT_WINDOW_MS,
        BOOKING_RATE_LIMIT_WINDOW_SECONDS * 1000
      );
    });
  });

  describe("5. Política Fail-Closed para Falhas da RPC e Ausência de Segredos/PII nos Logs", () => {
    it("bloqueia em modo Fail-Closed (0 registos na BD, 0 emails Resend, 0 PII nos logs) para todos os tipos de falha da RPC", async () => {
      const failureModes: {
        name: string;
        customRpc: () => Promise<BookingRateLimitRpcResponse>;
      }[] = [
        {
          name: "Função RPC inexistente (PGRST202)",
          customRpc: async () => ({
            data: null,
            error: {
              code: "PGRST202",
              message:
                "Could not find the function public.check_and_record_booking_rate_limit",
            },
          }),
        },
        {
          name: "Erro de permissões (42501)",
          customRpc: async () => ({
            data: null,
            error: {
              code: "42501",
              message:
                "permission denied for function check_and_record_booking_rate_limit",
            },
          }),
        },
        {
          name: "Timeout / erro de ligação ao Supabase",
          customRpc: async () => {
            throw new Error("ETIMEDOUT: connection timed out to supabase");
          },
        },
        {
          name: "Resposta inválida ou inesperada (data: null)",
          customRpc: async () => ({
            data: null,
            error: null,
          }),
        },
        {
          name: "Resposta malformada (allowed não booleano)",
          customRpc: async () => ({
            data: { allowed: "yes" },
            error: null,
          }),
        },
      ];

      const capturedLogs: string[] = [];
      const originalConsoleError = console.error;
      console.error = (...args: unknown[]) => {
        capturedLogs.push(JSON.stringify(args));
      };

      try {
        for (const mode of failureModes) {
          const mockSupabase = createIsolatedSupabaseMock({
            customRpc: mode.customRpc,
          });
          const dispatchedEmails: AppointmentNotificationPayload[] = [];

          const res = await bookAppointment(
            createValidBookingInput({
              patient_email: "privado.utente@example.com",
              patient_phone: "+351961234567",
            }),
            {
              getClientIp: () => "203.0.113.199",
              localPreFilter: new SlidingWindowRateLimiter(),
              rateLimitSecretOverride: TEST_HMAC_SECRET,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              createSupabaseAdmin: () => mockSupabase.client as any,
              dispatchNotifications: async (payload) => {
                dispatchedEmails.push(payload);
              },
              getNow: async () => ({
                dateStr: "2026-11-20",
                hour: 10,
                minute: 0,
              }),
            }
          );

          assert.equal(
            res.success,
            false,
            `Mode "${mode.name}" must fail closed`
          );
          assert.equal(res.error, BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE);
          assert.equal(mockSupabase.getAvailabilityQueriesCount(), 0);
          assert.equal(mockSupabase.insertedAppointments.length, 0);
          assert.equal(dispatchedEmails.length, 0);
        }

        // Verify zero secrets and zero PII in error logs
        const combinedLogs = capturedLogs.join("\n");
        assert.ok(!combinedLogs.includes(TEST_HMAC_SECRET));
        assert.ok(!combinedLogs.includes("privado.utente@example.com"));
        assert.ok(!combinedLogs.includes("961234567"));
        assert.ok(!combinedLogs.includes("203.0.113.199"));
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe("6. Testes de Integração Reais contra Instância PostgreSQL Isolada (Docker postgres:16-alpine)", () => {
    const CONTAINER_NAME = "psi-grace-pg-rate-limit-test-ephemeral";
    let dockerAvailable = false;

    async function runPsql(sqlQuery: string): Promise<string> {
      const { stdout } = await execFileAsync("docker", [
        "exec",
        "-i",
        CONTAINER_NAME,
        "psql",
        "-h",
        "127.0.0.1",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-t",
        "-A",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sqlQuery,
      ]);
      return stdout.trim();
    }

    before(async () => {
      try {
        execFileSync("docker", ["info"], { stdio: "ignore" });
        dockerAvailable = true;
      } catch {
        dockerAvailable = false;
        return;
      }

      // Clean up any leftover container with the same name
      try {
        execFileSync("docker", ["rm", "-f", CONTAINER_NAME], {
          stdio: "ignore",
        });
      } catch {
        // Ignore if not running
      }

      // Start isolated ephemeral PostgreSQL 16 instance in tmpfs (RAM)
      execFileSync(
        "docker",
        [
          "run",
          "--rm",
          "-d",
          "--name",
          CONTAINER_NAME,
          "-e",
          "POSTGRES_PASSWORD=test_ephemeral_pw",
          "--tmpfs",
          "/var/lib/postgresql/data:rw",
          "postgres:16-alpine",
        ],
        { stdio: "ignore" }
      );

      // Wait for PostgreSQL to finish initdb and accept TCP connections on 127.0.0.1:5432
      for (let i = 0; i < 40; i++) {
        try {
          execFileSync(
            "docker",
            [
              "exec",
              CONTAINER_NAME,
              "psql",
              "-h",
              "127.0.0.1",
              "-U",
              "postgres",
              "-d",
              "postgres",
              "-c",
              "SELECT 1;",
            ],
            { stdio: "ignore" }
          );
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 250));
        }
      }

      // Create standard Supabase roles (anon, authenticated, service_role) in isolated test DB
      await runPsql(`
        CREATE ROLE anon NOLOGIN;
        CREATE ROLE authenticated NOLOGIN;
        CREATE ROLE service_role NOLOGIN BYPASSRLS;
        GRANT anon, authenticated, service_role TO postgres;
        GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      `);

      // Apply the actual Phase 9.7 SQL migration file
      const migrationPath = join(
        process.cwd(),
        "supabase/migrations/20261119000000_phase9_7_distributed_rate_limiting.sql"
      );
      const migrationSql = readFileSync(migrationPath, "utf8");
      await runPsql(migrationSql);
    });

    after(() => {
      if (dockerAvailable) {
        try {
          execFileSync("docker", ["rm", "-f", CONTAINER_NAME], {
            stdio: "ignore",
          });
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it("PostgreSQL Real: valida metadados de catálogo (prosecdef, owner=postgres, search_path=pg_catalog, public)", async (t) => {
      if (!dockerAvailable) {
        t.skip("Docker daemon não disponível para teste PostgreSQL real");
        return;
      }

      const meta = await runPsql(`
        SELECT p.prosecdef::text || '|' || pg_get_userbyid(p.proowner) || '|' || array_to_string(p.proconfig, ';')
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'check_and_record_booking_rate_limit';
      `);
      assert.equal(meta, "true|postgres|search_path=pg_catalog, public");
    });

    it("PostgreSQL Real: 15 transações concorrentes reais para o mesmo IP autorizam exatamente 5 e bloqueiam 10", async (t) => {
      if (!dockerAvailable) {
        t.skip("Docker daemon não disponível para teste PostgreSQL real");
        return;
      }

      await runPsql("TRUNCATE TABLE public.booking_rate_limits;");

      const ipHash = hashRateLimitIdentifier(
        "ip",
        "203.0.113.77",
        TEST_HMAC_SECRET
      );

      // Spawn 15 separate concurrent PostgreSQL processes/transactions executing the RPC simultaneously
      const tasks = Array.from({ length: 15 }, (_, idx) => {
        const emailHash = hashRateLimitIdentifier(
          "email",
          `pg.real.ip.${idx}@example.com`,
          TEST_HMAC_SECRET
        );
        const phoneHash = hashRateLimitIdentifier(
          "phone",
          `+3519177777${String(idx).padStart(2, "0")}`,
          TEST_HMAC_SECRET
        );

        return runPsql(`
          SET ROLE service_role;
          SELECT public.check_and_record_booking_rate_limit(
            '${ipHash}',
            '${emailHash}',
            '${phoneHash}',
            900,
            5,
            3
          )::text;
        `).then((out) => {
          const jsonLine = out
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("{"));
          assert.ok(jsonLine, `Expected JSON response, got: ${out}`);
          return JSON.parse(jsonLine) as {
            allowed: boolean;
            reason?: string;
            retry_after_seconds?: number;
          };
        });
      });

      const results = await Promise.all(tasks);
      const allowed = results.filter((r) => r.allowed === true);
      const blocked = results.filter((r) => r.allowed === false);

      assert.equal(allowed.length, 5);
      assert.equal(blocked.length, 10);
      assert.ok(blocked.every((r) => r.reason === "ip_limit_exceeded"));

      const storedCardinality = await runPsql(`
        SELECT cardinality(attempt_timestamps)::text
        FROM public.booking_rate_limits
        WHERE key_hash = '${ipHash}';
      `);
      assert.equal(storedCardinality, "5");
    });

    it("PostgreSQL Real: 15 transações concorrentes reais para o mesmo email/telefone autorizam exatamente 3 e bloqueiam 12", async (t) => {
      if (!dockerAvailable) {
        t.skip("Docker daemon não disponível para teste PostgreSQL real");
        return;
      }

      await runPsql("TRUNCATE TABLE public.booking_rate_limits;");

      const emailHash = hashRateLimitIdentifier(
        "email",
        "pg.same.contact@example.com",
        TEST_HMAC_SECRET
      );
      const phoneHash = hashRateLimitIdentifier(
        "phone",
        "+351918888888",
        TEST_HMAC_SECRET
      );

      const tasks = Array.from({ length: 15 }, (_, idx) => {
        const ipHash = hashRateLimitIdentifier(
          "ip",
          `198.51.100.${idx + 1}`,
          TEST_HMAC_SECRET
        );

        return runPsql(`
          SET ROLE service_role;
          SELECT public.check_and_record_booking_rate_limit(
            '${ipHash}',
            '${emailHash}',
            '${phoneHash}',
            900,
            5,
            3
          )::text;
        `).then((out) => {
          const jsonLine = out
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("{"));
          assert.ok(jsonLine);
          return JSON.parse(jsonLine) as {
            allowed: boolean;
            reason?: string;
          };
        });
      });

      const results = await Promise.all(tasks);
      const allowed = results.filter((r) => r.allowed === true);
      const blocked = results.filter((r) => r.allowed === false);

      assert.equal(allowed.length, 3);
      assert.equal(blocked.length, 12);
      assert.ok(blocked.every((r) => r.reason === "email_limit_exceeded"));

      const storedCardinality = await runPsql(`
        SELECT cardinality(attempt_timestamps)::text
        FROM public.booking_rate_limits
        WHERE key_hash = '${emailHash}';
      `);
      assert.equal(storedCardinality, "3");
    });

    it("PostgreSQL Real: 15 transações concorrentes reais com 15 IPs diferentes, 15 emails diferentes e o mesmo telefone autorizam exatamente 3 e bloqueiam 12 (phone_limit_exceeded)", async (t) => {
      if (!dockerAvailable) {
        t.skip("Docker daemon não disponível para teste PostgreSQL real");
        return;
      }

      await runPsql("TRUNCATE TABLE public.booking_rate_limits;");

      const phoneVariations = [
        "+351 931 234 567",
        "+351 (931) 234-567",
        "+351931234567",
      ];
      const canonicalPhoneHash = hashRateLimitIdentifier(
        "phone",
        "+351931234567",
        TEST_HMAC_SECRET
      );

      // Verify all formatting variations resolve to the exact same HMAC identifier
      for (const variant of phoneVariations) {
        assert.equal(
          hashRateLimitIdentifier("phone", variant, TEST_HMAC_SECRET),
          canonicalPhoneHash
        );
      }

      // 15 concurrent transactions: 15 distinct IPs, 15 distinct emails, 1 shared normalized phone hash
      const tasks = Array.from({ length: 15 }, (_, idx) => {
        const ipHash = hashRateLimitIdentifier(
          "ip",
          `198.51.100.${100 + idx}`,
          TEST_HMAC_SECRET
        );
        const emailHash = hashRateLimitIdentifier(
          "email",
          `pg.distinct.email.${idx}@example.com`,
          TEST_HMAC_SECRET
        );
        const phoneHash = hashRateLimitIdentifier(
          "phone",
          phoneVariations[idx % phoneVariations.length],
          TEST_HMAC_SECRET
        );

        return runPsql(`
          SET ROLE service_role;
          SELECT public.check_and_record_booking_rate_limit(
            '${ipHash}',
            '${emailHash}',
            '${phoneHash}',
            900,
            5,
            3
          )::text;
        `).then((out) => {
          const jsonLine = out
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("{"));
          assert.ok(jsonLine);
          return JSON.parse(jsonLine) as {
            allowed: boolean;
            reason?: string;
            retry_after_seconds?: number;
          };
        });
      });

      const results = await Promise.all(tasks);
      const allowed = results.filter((r) => r.allowed === true);
      const blocked = results.filter((r) => r.allowed === false);

      assert.equal(allowed.length, 3);
      assert.equal(blocked.length, 12);
      assert.ok(
        blocked.every((r) => r.reason === "phone_limit_exceeded"),
        "All 12 blocked requests must be rejected specifically with reason = phone_limit_exceeded"
      );

      const storedPhoneCardinality = await runPsql(`
        SELECT cardinality(attempt_timestamps)::text
        FROM public.booking_rate_limits
        WHERE key_hash = '${canonicalPhoneHash}';
      `);
      assert.equal(storedPhoneCardinality, "3");
    });

    it("PostgreSQL Real: execução explícita com SET ROLE service_role consulta e atualiza via SECURITY DEFINER sem acesso direto à tabela", async (t) => {
      if (!dockerAvailable) {
        t.skip("Docker daemon não disponível para teste PostgreSQL real");
        return;
      }

      await runPsql("TRUNCATE TABLE public.booking_rate_limits;");

      const ipHash = hashRateLimitIdentifier(
        "ip",
        "203.0.113.111",
        TEST_HMAC_SECRET
      );
      const emailHash = hashRateLimitIdentifier(
        "email",
        "secdef.role.test@example.com",
        TEST_HMAC_SECRET
      );
      const phoneHash = hashRateLimitIdentifier(
        "phone",
        "+351960000111",
        TEST_HMAC_SECRET
      );

      // 1. Execute RPC twice as service_role (1st call inserts row, 2nd call queries & updates attempt_timestamps)
      for (let attempt = 1; attempt <= 2; attempt++) {
        const out = await runPsql(`
          SET ROLE service_role;
          SELECT current_user || '|' || (public.check_and_record_booking_rate_limit(
            '${ipHash}',
            '${emailHash}',
            '${phoneHash}',
            900,
            5,
            3
          )->>'allowed');
        `);
        assert.ok(
          out.endsWith("service_role|true"),
          `Expected service_role|true on attempt ${attempt}, got: ${out}`
        );
      }

      // Confirm via postgres owner that the table row was created and updated to 2 timestamps
      const countAfterTwo = await runPsql(`
        SELECT cardinality(attempt_timestamps)::text
        FROM public.booking_rate_limits
        WHERE key_hash = '${phoneHash}';
      `);
      assert.equal(countAfterTwo, "2");

      // 2. Confirm service_role CANNOT SELECT, INSERT, UPDATE, or DELETE directly on public.booking_rate_limits
      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE service_role;
            SELECT * FROM public.booking_rate_limits;
          `),
        /permission denied for table booking_rate_limits/
      );

      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE service_role;
            DELETE FROM public.booking_rate_limits;
          `),
        /permission denied for table booking_rate_limits/
      );

      // 3. Confirm anon and authenticated CANNOT access table or execute RPC
      for (const role of ["anon", "authenticated"] as const) {
        await assert.rejects(
          () =>
            runPsql(`
              SET ROLE ${role};
              SELECT * FROM public.booking_rate_limits;
            `),
          /permission denied for table booking_rate_limits/
        );

        await assert.rejects(
          () =>
            runPsql(`
              SET ROLE ${role};
              SELECT public.check_and_record_booking_rate_limit('${ipHash}', '${emailHash}', '${phoneHash}', 900, 5, 3);
            `),
          /permission denied for function check_and_record_booking_rate_limit/
        );
      }
    });

    it("PostgreSQL Real: expiração real dos timestamps na janela deslizante e bloqueio de permissões para anon e authenticated", async (t) => {
      if (!dockerAvailable) {
        t.skip("Docker daemon não disponível para teste PostgreSQL real");
        return;
      }

      await runPsql("TRUNCATE TABLE public.booking_rate_limits;");

      const ipHash = hashRateLimitIdentifier(
        "ip",
        "203.0.113.250",
        TEST_HMAC_SECRET
      );
      const emailHash = hashRateLimitIdentifier(
        "email",
        "expiry.real@example.com",
        TEST_HMAC_SECRET
      );
      const phoneHash = hashRateLimitIdentifier(
        "phone",
        "+351912223344",
        TEST_HMAC_SECRET
      );

      // 1. Test with 2-second sliding window: exhaust 2 attempts (p_max_contact = 2)
      for (let i = 0; i < 2; i++) {
        const out = await runPsql(`
          SET ROLE service_role;
          SELECT (public.check_and_record_booking_rate_limit('${ipHash}', '${emailHash}', '${phoneHash}', 2, 5, 2)->>'allowed');
        `);
        assert.ok(out.endsWith("true"));
      }

      // Immediate 3rd call within 2s window -> blocked
      const blockedOut = await runPsql(`
        SET ROLE service_role;
        SELECT (public.check_and_record_booking_rate_limit('${ipHash}', '${emailHash}', '${phoneHash}', 2, 5, 2)->>'allowed');
      `);
      assert.ok(blockedOut.endsWith("false"));

      // Wait 2.2 seconds for the 2-second window to expire in real PostgreSQL clock_timestamp()
      await new Promise((r) => setTimeout(r, 2200));

      // Now call again -> allowed!
      const afterExpiryOut = await runPsql(`
        SET ROLE service_role;
        SELECT (public.check_and_record_booking_rate_limit('${ipHash}', '${emailHash}', '${phoneHash}', 2, 5, 2)->>'allowed');
      `);
      assert.ok(afterExpiryOut.endsWith("true"));

      // 2. Verify anon and authenticated are strictly denied from calling the RPC or querying the table
      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE anon;
            SELECT public.check_and_record_booking_rate_limit('${ipHash}', '${emailHash}', '${phoneHash}', 900, 5, 3);
          `),
        /permission denied for function check_and_record_booking_rate_limit/
      );

      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE authenticated;
            SELECT public.check_and_record_booking_rate_limit('${ipHash}', '${emailHash}', '${phoneHash}', 900, 5, 3);
          `),
        /permission denied for function check_and_record_booking_rate_limit/
      );

      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE anon;
            SELECT * FROM public.booking_rate_limits;
          `),
        /permission denied for table booking_rate_limits/
      );

      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE service_role;
            SELECT * FROM public.booking_rate_limits;
          `),
        /permission denied for table booking_rate_limits/
      );

      // 3. Verify parameter validation inside PostgreSQL function
      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE service_role;
            SELECT public.check_and_record_booking_rate_limit(NULL, '', '', 900, 5, 3);
          `),
        /p_email_hash and p_phone_hash are required/
      );

      await assert.rejects(
        () =>
          runPsql(`
            SET ROLE service_role;
            SELECT public.check_and_record_booking_rate_limit(NULL, '${emailHash}', '${phoneHash}', 0, 5, 3);
          `),
        /p_window_seconds must be between 1 and 86400/
      );
    });
  });
});
