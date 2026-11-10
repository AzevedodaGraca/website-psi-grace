// Server-only Email Notification Provider using Resend
// Adheres strictly to security, server-only execution, and no-fake-delivery rules

import { Resend } from "resend";
import type { NotificationMessage, NotificationDispatchResult } from "../types";
import type { NotificationProvider } from "./provider";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates whether a string is a safe, well-formed email address (simplified RFC 5322)
 * without control characters or angle brackets.
 */
export function isValidEmailAddress(email?: string | null): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 150) {
    return false;
  }
  if (/[\r\n<>]/.test(trimmed)) {
    return false;
  }
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validates and normalizes an optional Reply-To email address.
 * Returns undefined if the value is missing, untrusted, or invalid.
 */
export function sanitizeReplyToAddress(replyTo?: string | null): string | undefined {
  if (!replyTo || typeof replyTo !== "string") {
    return undefined;
  }
  const normalized = replyTo.trim().toLowerCase();
  if (!isValidEmailAddress(normalized)) {
    return undefined;
  }
  return normalized;
}

/**
 * Formats the Resend 'from' field safely:
 * - If rawFromEmail contains only a valid email address, combines it with rawFromName (if provided).
 * - If rawFromEmail is already formatted as "Name <email@domain>", preserves it without duplicating names or angle brackets.
 * - Returns null if the underlying email address is missing or invalid.
 */
export function formatResendFromAddress(
  rawFromEmail?: string | null,
  rawFromName?: string | null
): string | null {
  if (!rawFromEmail || typeof rawFromEmail !== "string") {
    return null;
  }

  // Strip surrounding quotes if present in environment variable value
  const cleanedFromEmail = rawFromEmail
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();

  if (!cleanedFromEmail || /[\r\n]/.test(cleanedFromEmail)) {
    return null;
  }

  const cleanDisplayName = (name?: string | null): string => {
    if (!name || typeof name !== "string") return "";
    return name
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .replace(/[\r\n<>]/g, "")
      .trim();
  };

  // Case 1: Already contains angle brackets, e.g. "Display Name <email@domain.pt>" or "<email@domain.pt>"
  if (cleanedFromEmail.includes("<") || cleanedFromEmail.includes(">")) {
    const bracketMatch = cleanedFromEmail.match(/^([^<>]*)<\s*([^<>]+)\s*>$/);
    if (!bracketMatch) {
      return null;
    }

    const embeddedName = cleanDisplayName(bracketMatch[1]);
    const extractedEmail = bracketMatch[2].trim();

    if (!isValidEmailAddress(extractedEmail)) {
      return null;
    }

    if (embeddedName) {
      return `${embeddedName} <${extractedEmail}>`;
    }

    const fallbackName = cleanDisplayName(rawFromName);
    return fallbackName ? `${fallbackName} <${extractedEmail}>` : extractedEmail;
  }

  // Case 2: Plain email address
  if (!isValidEmailAddress(cleanedFromEmail)) {
    return null;
  }

  const displayName = cleanDisplayName(rawFromName);
  return displayName ? `${displayName} <${cleanedFromEmail}>` : cleanedFromEmail;
}

export interface ResendSendEmailParams {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}

export interface ResendSendEmailResponse {
  data: { id: string } | null;
  error: { name?: string; message: string } | null;
}

export type ResendSendFn = (
  params: ResendSendEmailParams
) => Promise<ResendSendEmailResponse>;

export class EmailNotificationProvider implements NotificationProvider {
  readonly name = "resend-email";
  private readonly customSendFn?: ResendSendFn;

  constructor(customSendFn?: ResendSendFn) {
    this.customSendFn = customSendFn;
  }

  async sendEmail(message: NotificationMessage): Promise<NotificationDispatchResult> {
    const timestamp = new Date().toISOString();
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = (
      process.env.RESEND_FROM_EMAIL ||
      process.env.NOTIFICATION_FROM_EMAIL ||
      ""
    ).trim();
    const fromName = process.env.RESEND_FROM_NAME?.trim();

    // 1. Recipient email validation
    const recipientEmail = message.recipientEmail?.trim();
    if (!recipientEmail || !isValidEmailAddress(recipientEmail)) {
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: "E-mail de destinatário inválido ou não fornecido.",
        timestamp,
      };
    }

    // 2. API Key configuration check
    // If external provider credentials are not configured, do NOT fake delivery. Mark accurately as 'prepared'.
    if (!apiKey) {
      console.info(
        `[Notificações/Email] Envio adiado: RESEND_API_KEY não está configurada no ambiente (${message.event} para ${recipientEmail}).`
      );
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "prepared",
        reason: "provider_not_configured",
        timestamp,
      };
    }

    // 3. Sender address configuration check
    if (!fromEmail) {
      console.info(
        `[Notificações/Email] Envio adiado: RESEND_FROM_EMAIL não está configurado no ambiente (${message.event} para ${recipientEmail}).`
      );
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "prepared",
        reason: "from_email_not_configured",
        timestamp,
      };
    }

    // Format and validate sender address with optional display name
    const from = formatResendFromAddress(fromEmail, fromName);
    if (!from) {
      console.error(
        `[Notificações/Email] Configuração inválida: RESEND_FROM_EMAIL contém um formato inválido (${message.event}).`
      );
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        reason: "invalid_from_email",
        error: "Endereço de remetente (RESEND_FROM_EMAIL) inválido.",
        timestamp,
      };
    }

    // Validate optional Reply-To address
    const validReplyTo = sanitizeReplyToAddress(message.replyTo);

    // 4. Execute server-side transactional dispatch via Resend SDK
    try {
      const sendPayload: ResendSendEmailParams = {
        from,
        to: [recipientEmail],
        ...(validReplyTo ? { replyTo: validReplyTo } : {}),
        subject: message.subject || "Notificação de Consulta — Psicóloga Grace",
        text: message.bodyText,
        html: message.bodyHtml,
      };

      const { data, error } = this.customSendFn
        ? await this.customSendFn(sendPayload)
        : await new Resend(apiKey).emails.send(sendPayload);

      if (error) {
        console.error("[Notificações/Email] Rejeição na API do Resend:", {
          event: message.event,
          recipientEmail,
          errorName: error.name,
          errorMessage: error.message,
        });

        return {
          channel: "email",
          recipient: message.recipient,
          event: message.event,
          delivered: false,
          status: "failed",
          error: error.message || "Erro rejeitado pelo fornecedor de e-mail.",
          timestamp,
        };
      }

      if (data?.id) {
        console.info("[Notificações/Email] E-mail entregue com sucesso via Resend:", {
          event: message.event,
          recipientEmail,
          messageId: data.id,
        });

        return {
          channel: "email",
          recipient: message.recipient,
          event: message.event,
          delivered: true,
          status: "delivered",
          providerMessageId: data.id,
          timestamp,
        };
      }

      // Fallback in case of unexpected empty response without explicit error
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: "Resposta ambígua do fornecedor de e-mail (sem ID de confirmação).",
        timestamp,
      };
    } catch (err: unknown) {
      const safeErrorMessage =
        err instanceof Error ? err.message : "Exceção inesperada no envio de e-mail.";

      console.error("[Notificações/Email] Exceção no envio de e-mail:", {
        event: message.event,
        recipientEmail,
        error: safeErrorMessage,
      });

      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: safeErrorMessage,
        timestamp,
      };
    }
  }

  async sendWhatsApp(): Promise<NotificationDispatchResult> {
    return {
      channel: "whatsapp",
      recipient: "patient",
      event: "appointment_created_patient",
      delivered: false,
      status: "prepared",
      reason: "channel_not_supported_by_provider",
      timestamp: new Date().toISOString(),
    };
  }
}
