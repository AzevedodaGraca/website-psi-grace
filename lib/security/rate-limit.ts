// Server-only Distributed & Atomic Rate Limiting for Public Appointment Bookings (Phase 9.7)
// Uses canonical IPv4/IPv6/email/phone normalization, server-only HMAC-SHA256,
// Layer 1 in-memory pre-filter, and Layer 2 authoritative PostgreSQL RPC with Fail-Closed policy.

import { createHmac } from "node:crypto";

export const BOOKING_RATE_LIMIT_WINDOW_SECONDS = 900; // 15 minutes
export const BOOKING_RATE_LIMIT_WINDOW_MS = BOOKING_RATE_LIMIT_WINDOW_SECONDS * 1000;
export const BOOKING_MAX_ATTEMPTS_PER_IP = 5; // Max 5 attempts per 15 min per IP
export const BOOKING_MAX_ATTEMPTS_PER_CONTACT = 3; // Max 3 attempts per 15 min per email or phone
export const BOOKING_RATE_LIMIT_MAX_BUCKETS = 5000;

export const BOOKING_RATE_LIMIT_ERROR_MESSAGE =
  "Demasiadas tentativas de marcação num curto período. Por favor, aguarde alguns minutos antes de tentar novamente ou entre em contacto via WhatsApp.";

export const BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE =
  "Não foi possível processar o seu pedido de marcação neste momento. Por favor, tente novamente dentro de alguns instantes ou entre em contacto via WhatsApp.";

export type RateLimitBlockReason =
  | "ip_limit_exceeded"
  | "email_limit_exceeded"
  | "phone_limit_exceeded"
  | "rpc_unavailable";

export interface RateLimitCheckInput {
  ip?: string | null;
  email: string;
  phone: string;
  nowMs?: number;
  secretOverride?: string;
}

export interface RateLimitHashes {
  ipHash: string | null;
  emailHash: string;
  phoneHash: string;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: RateLimitBlockReason;
  retryAfterSeconds?: number;
  errorMessage?: string;
}

export interface RateLimitConfig {
  windowMs?: number;
  maxAttemptsPerIp?: number;
  maxAttemptsPerContact?: number;
  maxBuckets?: number;
}

export interface BookingRateLimitRpcArgs {
  p_ip_hash: string | null;
  p_email_hash: string;
  p_phone_hash: string;
  p_window_seconds: number;
  p_max_ip: number;
  p_max_contact: number;
}

export interface BookingRateLimitRpcResponse {
  data: {
    allowed?: unknown;
    reason?: unknown;
    retry_after_seconds?: unknown;
  } | null;
  error: {
    code?: string;
    message?: string;
  } | null;
}

export type BookingRateLimitRpcInvoker = (
  args: BookingRateLimitRpcArgs
) => Promise<BookingRateLimitRpcResponse>;

/**
 * Parses and normalizes an IPv4 dotted-quad string ("a.b.c.d") into canonical form.
 * Returns null if not a valid IPv4 address.
 */
function parseAndNormalizeIpv4(candidate: string): string | null {
  const parts = candidate.split(".");
  if (parts.length !== 4) return null;

  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const num = Number(part);
    if (!Number.isInteger(num) || num < 0 || num > 255) return null;
    octets.push(num);
  }

  return `${octets[0]}.${octets[1]}.${octets[2]}.${octets[3]}`;
}

/**
 * Normalizes any valid IPv4 or IPv6 address into a single canonical representation:
 * - Valid IPv4 addresses and IPv4-mapped IPv6 addresses (e.g. "::ffff:203.0.113.42",
 *   "0:0:0:0:0:ffff:cb00:712a") normalize to canonical dotted-decimal IPv4 ("203.0.113.42").
 * - Valid IPv6 addresses (compressed "::", mixed case, leading zeros omitted) normalize
 *   to full 8-group 4-hex-digit lowercase representation ("2001:0db8:0000:0000:0000:0000:0000:0001").
 * - Returns null if the input is not a valid IPv4 or IPv6 address.
 */
export function normalizeIpForRateLimit(rawIp?: string | null): string | null {
  if (!rawIp || typeof rawIp !== "string") return null;

  let cleaned = rawIp.trim();
  if (!cleaned || cleaned.length > 80) return null;

  // Strip IPv6 zone index (%eth0, %en0) if present (inside or outside brackets)
  cleaned = cleaned.replace(/%[^\]]+/, "").trim();

  // Strip surrounding IPv6 brackets [2001:db8::1] if present
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  if (!cleaned || !/^[0-9a-fA-F:.]+$/.test(cleaned)) {
    return null;
  }

  // Case 1: Pure IPv4 address
  if (!cleaned.includes(":")) {
    return parseAndNormalizeIpv4(cleaned);
  }

  // Case 2: IPv6 address (possibly with embedded IPv4 tail like ::ffff:203.0.113.42)
  let workingIpv6 = cleaned.toLowerCase();

  if (workingIpv6.includes(".")) {
    const lastColon = workingIpv6.lastIndexOf(":");
    if (lastColon === -1) return null;
    const ipv4Tail = parseAndNormalizeIpv4(workingIpv6.slice(lastColon + 1));
    if (!ipv4Tail) return null;
    const [o0, o1, o2, o3] = ipv4Tail.split(".").map(Number);
    const highGroup = ((o0 << 8) | o1).toString(16).padStart(4, "0");
    const lowGroup = ((o2 << 8) | o3).toString(16).padStart(4, "0");
    workingIpv6 = `${workingIpv6.slice(0, lastColon)}:${highGroup}:${lowGroup}`;
  }

  // Validate "::" zero-compression usage (at most one "::")
  const doubleColonParts = workingIpv6.split("::");
  if (doubleColonParts.length > 2) return null;

  let groups: string[] = [];

  if (doubleColonParts.length === 2) {
    const leftRaw = doubleColonParts[0] ? doubleColonParts[0].split(":") : [];
    const rightRaw = doubleColonParts[1] ? doubleColonParts[1].split(":") : [];
    const missingGroups = 8 - (leftRaw.length + rightRaw.length);
    if (missingGroups < 1) return null;
    groups = [
      ...leftRaw,
      ...Array.from({ length: missingGroups }, () => "0000"),
      ...rightRaw,
    ];
  } else {
    groups = workingIpv6.split(":");
  }

  if (groups.length !== 8) return null;

  const normalizedGroups: string[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    normalizedGroups.push(g.padStart(4, "0"));
  }

  // Convert IPv4-mapped IPv6 (0000:0000:0000:0000:0000:ffff:xxxx:yyyy) to canonical IPv4
  const isIpv4Mapped =
    normalizedGroups[0] === "0000" &&
    normalizedGroups[1] === "0000" &&
    normalizedGroups[2] === "0000" &&
    normalizedGroups[3] === "0000" &&
    normalizedGroups[4] === "0000" &&
    normalizedGroups[5] === "ffff";

  if (isIpv4Mapped) {
    const high = parseInt(normalizedGroups[6], 16);
    const low = parseInt(normalizedGroups[7], 16);
    const o0 = (high >> 8) & 0xff;
    const o1 = high & 0xff;
    const o2 = (low >> 8) & 0xff;
    const o3 = low & 0xff;
    return `${o0}.${o1}.${o2}.${o3}`;
  }

  return normalizedGroups.join(":");
}

/**
 * Normalizes an email address for rate-limit hashing.
 */
export function normalizeEmailForRateLimit(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes a phone string to digits and optional leading '+' so formatting
 * variations (parentheses, spaces, dashes) map to the exact same identifier.
 */
export function normalizePhoneForRateLimit(phone: string): string {
  const digitsAndPlus = phone.trim().replace(/[^\d+]/g, "");
  // Keep '+' only if it is at index 0
  if (digitsAndPlus.startsWith("+")) {
    return "+" + digitsAndPlus.slice(1).replace(/\+/g, "");
  }
  return digitsAndPlus.replace(/\+/g, "");
}

/**
 * Derives a dedicated 256-bit HMAC key from server-only secret material
 * (RATE_LIMIT_SECRET or SUPABASE_SERVICE_ROLE_KEY).
 * Never falls back to a static or public key.
 */
export function deriveRateLimitHmacKey(secretOverride?: string): Buffer {
  const rawSecret = (
    secretOverride ??
    process.env.RATE_LIMIT_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  ).trim();

  if (
    !rawSecret ||
    rawSecret.length < 16 ||
    rawSecret.toLowerCase().includes("placeholder") ||
    rawSecret === "your-service-role-key"
  ) {
    throw new Error(
      "Configuração de segredo server-only para rate limiting ausente ou inválida."
    );
  }

  return createHmac("sha256", rawSecret)
    .update("psi-grace:rate-limit:v1")
    .digest();
}

/**
 * Generates a domain-separated pseudonymized HMAC-SHA256 identifier:
 *   "<scope>:<64_hex_chars>" (max 70 chars).
 * Reduces personal data exposure by avoiding raw IP addresses, emails, or phone numbers
 * in memory, database tables, or logs.
 */
export function hashRateLimitIdentifier(
  scope: "ip" | "email" | "phone",
  rawValue: string,
  secretOverride?: string
): string {
  let normalized: string;
  if (scope === "ip") {
    const canonicalIp = normalizeIpForRateLimit(rawValue);
    if (!canonicalIp) {
      throw new Error("Endereço IP inválido para normalização canónica.");
    }
    normalized = canonicalIp;
  } else if (scope === "phone") {
    normalized = normalizePhoneForRateLimit(rawValue);
    if (!normalized) {
      throw new Error("Número de telefone inválido para normalização.");
    }
  } else {
    normalized = normalizeEmailForRateLimit(rawValue);
    if (!normalized) {
      throw new Error("Endereço de e-mail inválido para normalização.");
    }
  }

  const derivedKey = deriveRateLimitHmacKey(secretOverride);
  const macHex = createHmac("sha256", derivedKey)
    .update(`${scope}:${normalized}`)
    .digest("hex");

  return `${scope}:${macHex}`;
}

/**
 * Computes the domain-separated HMAC-SHA256 hashes for IP (optional), email, and phone.
 */
export function computeRateLimitHashes(input: RateLimitCheckInput): RateLimitHashes {
  const canonicalIp = normalizeIpForRateLimit(input.ip);
  const ipHash = canonicalIp
    ? hashRateLimitIdentifier("ip", canonicalIp, input.secretOverride)
    : null;
  const emailHash = hashRateLimitIdentifier(
    "email",
    input.email,
    input.secretOverride
  );
  const phoneHash = hashRateLimitIdentifier(
    "phone",
    input.phone,
    input.secretOverride
  );

  return { ipHash, emailHash, phoneHash };
}

/**
 * Safely extracts and canonicalizes the client IP address from request headers.
 * Prioritizes platform-verified headers injected by Vercel ('x-vercel-forwarded-for', 'x-real-ip')
 * before falling back to the first entry of 'x-forwarded-for'.
 */
export function extractClientIpFromHeaders(
  getHeader: (name: string) => string | null | undefined
): string | null {
  const candidates = [
    getHeader("x-vercel-forwarded-for"),
    getHeader("x-real-ip"),
    getHeader("x-forwarded-for"),
  ];

  for (const rawHeader of candidates) {
    if (!rawHeader || typeof rawHeader !== "string") continue;
    const firstHop = rawHeader.split(",")[0]?.trim() || "";
    const canonical = normalizeIpForRateLimit(firstHop);
    if (canonical) {
      return canonical;
    }
  }

  return null;
}

/**
 * Layer 1 In-Memory Sliding-Window Pre-Filter.
 * Acts as a fast local cache in front of the authoritative PostgreSQL RPC.
 */
export class SlidingWindowRateLimiter {
  private readonly buckets = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxAttemptsPerIp: number;
  private readonly maxAttemptsPerContact: number;
  private readonly maxBuckets: number;

  constructor(config?: RateLimitConfig) {
    this.windowMs = config?.windowMs ?? BOOKING_RATE_LIMIT_WINDOW_MS;
    this.maxAttemptsPerIp =
      config?.maxAttemptsPerIp ?? BOOKING_MAX_ATTEMPTS_PER_IP;
    this.maxAttemptsPerContact =
      config?.maxAttemptsPerContact ?? BOOKING_MAX_ATTEMPTS_PER_CONTACT;
    this.maxBuckets = config?.maxBuckets ?? BOOKING_RATE_LIMIT_MAX_BUCKETS;
  }

  /**
   * Read-only pre-filter check against local instance memory without recording a new attempt.
   */
  checkPreFilter(hashes: RateLimitHashes, nowMs?: number): RateLimitCheckResult {
    const now = nowMs ?? Date.now();
    const cutoff = now - this.windowMs;

    if (hashes.ipHash) {
      const ipTimestamps = this.getActiveTimestamps(hashes.ipHash, cutoff);
      if (ipTimestamps.length >= this.maxAttemptsPerIp) {
        return {
          allowed: false,
          reason: "ip_limit_exceeded",
          retryAfterSeconds: this.calculateRetryAfter(ipTimestamps[0], now),
          errorMessage: BOOKING_RATE_LIMIT_ERROR_MESSAGE,
        };
      }
    }

    const emailTimestamps = this.getActiveTimestamps(hashes.emailHash, cutoff);
    if (emailTimestamps.length >= this.maxAttemptsPerContact) {
      return {
        allowed: false,
        reason: "email_limit_exceeded",
        retryAfterSeconds: this.calculateRetryAfter(emailTimestamps[0], now),
        errorMessage: BOOKING_RATE_LIMIT_ERROR_MESSAGE,
      };
    }

    const phoneTimestamps = this.getActiveTimestamps(hashes.phoneHash, cutoff);
    if (phoneTimestamps.length >= this.maxAttemptsPerContact) {
      return {
        allowed: false,
        reason: "phone_limit_exceeded",
        retryAfterSeconds: this.calculateRetryAfter(phoneTimestamps[0], now),
        errorMessage: BOOKING_RATE_LIMIT_ERROR_MESSAGE,
      };
    }

    return { allowed: true };
  }

  /**
   * Records an approved attempt in local memory after authoritative confirmation.
   */
  recordApprovedAttempt(hashes: RateLimitHashes, nowMs?: number): void {
    const now = nowMs ?? Date.now();
    const cutoff = now - this.windowMs;
    this.ensureCapacity(cutoff);

    if (hashes.ipHash) {
      const ipTimestamps = this.getActiveTimestamps(hashes.ipHash, cutoff);
      ipTimestamps.push(now);
      this.buckets.set(hashes.ipHash, ipTimestamps);
    }

    const emailTimestamps = this.getActiveTimestamps(hashes.emailHash, cutoff);
    emailTimestamps.push(now);
    this.buckets.set(hashes.emailHash, emailTimestamps);

    const phoneTimestamps = this.getActiveTimestamps(hashes.phoneHash, cutoff);
    phoneTimestamps.push(now);
    this.buckets.set(hashes.phoneHash, phoneTimestamps);
  }

  /**
   * Standalone atomic check-and-record for in-memory usage.
   */
  checkAndRecord(input: RateLimitCheckInput): RateLimitCheckResult {
    const now = input.nowMs ?? Date.now();
    const hashes = computeRateLimitHashes(input);
    const check = this.checkPreFilter(hashes, now);
    if (!check.allowed) {
      return check;
    }
    this.recordApprovedAttempt(hashes, now);
    return { allowed: true };
  }

  reset(): void {
    this.buckets.clear();
  }

  getBucketCount(): number {
    return this.buckets.size;
  }

  private getActiveTimestamps(key: string, cutoff: number): number[] {
    const existing = this.buckets.get(key);
    if (!existing || existing.length === 0) {
      return [];
    }
    const active = existing.filter((ts) => ts > cutoff);
    if (active.length === 0) {
      this.buckets.delete(key);
      return [];
    }
    this.buckets.set(key, active);
    return active;
  }

  private calculateRetryAfter(
    oldestTimestamp: number | undefined,
    now: number
  ): number {
    if (!oldestTimestamp) {
      return Math.ceil(this.windowMs / 1000);
    }
    const remainingMs = Math.max(1000, oldestTimestamp + this.windowMs - now);
    return Math.ceil(remainingMs / 1000);
  }

  private ensureCapacity(cutoff: number): void {
    if (this.buckets.size < this.maxBuckets) {
      return;
    }

    for (const [key, timestamps] of this.buckets.entries()) {
      const active = timestamps.filter((ts) => ts > cutoff);
      if (active.length === 0) {
        this.buckets.delete(key);
      } else {
        this.buckets.set(key, active);
      }
    }

    if (this.buckets.size >= this.maxBuckets) {
      const oldestKey = this.buckets.keys().next().value;
      if (oldestKey) {
        this.buckets.delete(oldestKey);
      }
    }
  }
}

const defaultBookingRateLimiter = new SlidingWindowRateLimiter();

export function getDefaultBookingRateLimiter(): SlidingWindowRateLimiter {
  return defaultBookingRateLimiter;
}

/**
 * Enforces the two-layer distributed rate limit with a strict FAIL-CLOSED policy:
 * 1. Computes domain-separated HMAC-SHA256 hashes (fails closed if server secret is missing).
 * 2. Checks Layer 1 in-memory pre-filter to reject local bursts without network overhead.
 * 3. Calls Layer 2 authoritative PostgreSQL RPC (`check_and_record_booking_rate_limit`).
 * 4. If the RPC fails (missing function, permission error, timeout, connection failure, or malformed payload),
 *    blocks the request (Fail-Closed) with a safe temporary message in PT-PT and logs no secrets or PII.
 */
export async function enforceDistributedBookingRateLimit(
  input: RateLimitCheckInput,
  options: {
    rpcInvoker: BookingRateLimitRpcInvoker;
    localPreFilter?: SlidingWindowRateLimiter;
    windowSeconds?: number;
    maxAttemptsPerIp?: number;
    maxAttemptsPerContact?: number;
  }
): Promise<RateLimitCheckResult> {
  // 1. Derive HMAC-SHA256 hashes (Fail-Closed if secret is missing or invalid)
  let hashes: RateLimitHashes;
  try {
    hashes = computeRateLimitHashes(input);
  } catch (err) {
    console.error(
      "[Segurança/RateLimit] Falha na preparação criptográfica do rate limiting (Fail-Closed):",
      {
        code: "HMAC_INIT_ERROR",
        error: err instanceof Error ? err.message : "unknown_hmac_error",
      }
    );
    return {
      allowed: false,
      reason: "rpc_unavailable",
      errorMessage: BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE,
    };
  }

  const preFilter = options.localPreFilter ?? defaultBookingRateLimiter;

  // 2. Layer 1 In-Memory Pre-Filter (fast rejection if already over limit on this instance)
  try {
    const localCheck = preFilter.checkPreFilter(hashes, input.nowMs);
    if (!localCheck.allowed) {
      return localCheck;
    }
  } catch {
    // If local pre-filter throws unexpectedly, do NOT bypass: continue to authoritative Layer 2 RPC
  }

  // 3. Layer 2 Authoritative Distributed PostgreSQL RPC (Fail-Closed on any error)
  try {
    const rpcResponse = await options.rpcInvoker({
      p_ip_hash: hashes.ipHash,
      p_email_hash: hashes.emailHash,
      p_phone_hash: hashes.phoneHash,
      p_window_seconds:
        options.windowSeconds ?? BOOKING_RATE_LIMIT_WINDOW_SECONDS,
      p_max_ip: options.maxAttemptsPerIp ?? BOOKING_MAX_ATTEMPTS_PER_IP,
      p_max_contact:
        options.maxAttemptsPerContact ?? BOOKING_MAX_ATTEMPTS_PER_CONTACT,
    });

    if (rpcResponse.error) {
      console.error(
        "[Segurança/RateLimit] Erro devolvido pela RPC distribuída (Fail-Closed):",
        {
          code: rpcResponse.error.code || "RPC_ERROR",
        }
      );
      return {
        allowed: false,
        reason: "rpc_unavailable",
        errorMessage: BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE,
      };
    }

    const payload = rpcResponse.data;
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.allowed !== "boolean"
    ) {
      console.error(
        "[Segurança/RateLimit] Resposta inválida da RPC distribuída (Fail-Closed):",
        {
          code: "INVALID_RPC_PAYLOAD",
        }
      );
      return {
        allowed: false,
        reason: "rpc_unavailable",
        errorMessage: BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE,
      };
    }

    if (!payload.allowed) {
      const reason: RateLimitBlockReason =
        payload.reason === "ip_limit_exceeded" ||
        payload.reason === "email_limit_exceeded" ||
        payload.reason === "phone_limit_exceeded"
          ? payload.reason
          : "email_limit_exceeded";

      const retryAfterSeconds =
        typeof payload.retry_after_seconds === "number"
          ? payload.retry_after_seconds
          : BOOKING_RATE_LIMIT_WINDOW_SECONDS;

      return {
        allowed: false,
        reason,
        retryAfterSeconds,
        errorMessage: BOOKING_RATE_LIMIT_ERROR_MESSAGE,
      };
    }

    // 4. Authoritative RPC confirmed allowed = true -> synchronize Layer 1 pre-filter cache
    try {
      preFilter.recordApprovedAttempt(hashes, input.nowMs);
    } catch {
      // Non-fatal if local cache sync fails after authoritative DB recording
    }

    return { allowed: true };
  } catch {
    console.error(
      "[Segurança/RateLimit] Exceção na chamada à RPC distribuída (Fail-Closed):",
      {
        code: "RPC_EXCEPTION",
      }
    );
    return {
      allowed: false,
      reason: "rpc_unavailable",
      errorMessage: BOOKING_RATE_LIMIT_UNAVAILABLE_MESSAGE,
    };
  }
}
