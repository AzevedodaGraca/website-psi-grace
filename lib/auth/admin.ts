/**
 * Administrator Authorization Utilities (Phase 9.5.5)
 * Centralizes the retrieval and validation of authorized administrator email addresses.
 */

/**
 * Retrieves the normalized list of authorized administrator emails from environment variables.
 *
 * Rules:
 * 1. Checks ADMIN_EMAILS (comma-separated list of emails).
 * 2. Checks ADMIN_EMAIL for backward compatibility (legacy single email).
 * 3. Trims whitespace and converts all emails to lowercase.
 * 4. Filters out empty strings and strings that do not contain '@'.
 * 5. Returns a deduplicated array of normalized email addresses.
 *
 * Deny by default: If neither variable is configured or both are empty/invalid, returns an empty array [].
 */
export function getAuthorizedAdminEmails(): string[] {
  const emailsSet = new Set<string>();

  // 1. Process ADMIN_EMAILS (comma-separated list)
  const envList = process.env.ADMIN_EMAILS;
  if (typeof envList === "string" && envList.trim()) {
    const parts = envList.split(",");
    for (const part of parts) {
      const normalized = part.trim().toLowerCase();
      if (normalized && normalized.includes("@")) {
        emailsSet.add(normalized);
      }
    }
  }

  // 2. Backward compatibility: Process legacy ADMIN_EMAIL (single email)
  const legacyEmail = process.env.ADMIN_EMAIL;
  if (typeof legacyEmail === "string" && legacyEmail.trim()) {
    const normalized = legacyEmail.trim().toLowerCase();
    if (normalized && normalized.includes("@")) {
      emailsSet.add(normalized);
    }
  }

  return Array.from(emailsSet);
}

/**
 * Checks whether a given email address belongs to an authorized administrator.
 *
 * Deny by default:
 * - If email is null, undefined, empty, or not a string -> returns false.
 * - If no authorized admin emails are configured in the environment -> returns false.
 * - If email is not in the authorized list -> returns false.
 *
 * Comparison is case-insensitive and trims whitespace.
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  const authorizedEmails = getAuthorizedAdminEmails();
  if (authorizedEmails.length === 0) {
    return false;
  }
  return authorizedEmails.includes(normalized);
}
