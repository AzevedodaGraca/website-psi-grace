// Server-only Email Notification Provider
// Adheres strictly to security and no-fake-delivery rules

import type { NotificationMessage, NotificationDispatchResult } from "../types";
import type { NotificationProvider } from "./provider";

export class EmailNotificationProvider implements NotificationProvider {
  readonly name = "resend-email";

  async sendEmail(message: NotificationMessage): Promise<NotificationDispatchResult> {
    const timestamp = new Date().toISOString();
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.NOTIFICATION_FROM_EMAIL || "consultas@grcpsi.pt";

    // If recipient email is missing, fail safely
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

    // If external provider credentials are not configured:
    // DO NOT fake delivery. Mark accurately as 'prepared'.
    if (!apiKey) {
      console.info(
        `[Notificações/Email] Notificação (${message.event}) preparada para ${message.recipientEmail}, contudo RESEND_API_KEY não está configurada em ambiente. Envio adiado com segurança.`
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

    // Execute real dispatch using Resend REST API via server fetch
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [message.recipientEmail],
          subject: message.subject || "Notificação de Consulta — Psicóloga Grace",
          text: message.bodyText,
          html: message.bodyHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Notificações/Email] Erro na API do fornecedor de e-mail:", {
          status: response.status,
          message: errorData?.message || "Erro desconhecido no fornecedor",
        });

        return {
          channel: "email",
          recipient: message.recipient,
          event: message.event,
          delivered: false,
          status: "failed",
          error: "Falha na comunicação com o serviço de envio de e-mail.",
          timestamp,
        };
      }

      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: true,
        status: "delivered",
        timestamp,
      };
    } catch (err) {
      console.error("[Notificações/Email] Exceção no envio de e-mail:", err);
      return {
        channel: "email",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: "Exceção inesperada no envio de e-mail.",
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
