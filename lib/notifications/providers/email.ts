// Server-only Email Notification Provider using Resend
// Adheres strictly to security, server-only execution, and no-fake-delivery rules

import { Resend } from "resend";
import type { NotificationMessage, NotificationDispatchResult } from "../types";
import type { NotificationProvider } from "./provider";

export class EmailNotificationProvider implements NotificationProvider {
  readonly name = "resend-email";

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
    if (!message.recipientEmail) {
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: "E-mail de destinatário não fornecido.",
        timestamp,
      };
    }

    // 2. API Key configuration check
    // If external provider credentials are not configured, do NOT fake delivery. Mark accurately as 'prepared'.
    if (!apiKey) {
      console.info(
        `[Notificações/Email] Envio adiado: RESEND_API_KEY não está configurada no ambiente (${message.event} para ${message.recipientEmail}).`
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
        `[Notificações/Email] Envio adiado: RESEND_FROM_EMAIL não está configurado no ambiente (${message.event} para ${message.recipientEmail}).`
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

    // Format sender address with optional display name
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    // 4. Execute server-side transactional dispatch via Resend SDK
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: [message.recipientEmail],
        subject: message.subject || "Notificação de Consulta — Psicóloga Grace",
        text: message.bodyText,
        html: message.bodyHtml,
      });

      if (error) {
        console.error("[Notificações/Email] Rejeição na API do Resend:", {
          event: message.event,
          recipientEmail: message.recipientEmail,
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
          recipientEmail: message.recipientEmail,
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
        recipientEmail: message.recipientEmail,
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
