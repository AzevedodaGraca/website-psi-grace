// Server-only WhatsApp Notification Provider Abstraction
// Prepared for future WhatsApp Cloud API integration

import type { NotificationMessage, NotificationDispatchResult } from "../types";
import type { NotificationProvider } from "./provider";

export class WhatsAppNotificationProvider implements NotificationProvider {
  readonly name = "whatsapp-cloud";

  async sendEmail(): Promise<NotificationDispatchResult> {
    return {
      channel: "email",
      recipient: "patient",
      event: "appointment_created_patient",
      delivered: false,
      status: "prepared",
      reason: "channel_not_supported_by_provider",
      timestamp: new Date().toISOString(),
    };
  }

  async sendWhatsApp(message: NotificationMessage): Promise<NotificationDispatchResult> {
    const timestamp = new Date().toISOString();
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Check if recipient phone is provided
    if (!message.recipientPhone) {
      return {
        channel: "whatsapp",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: "Número de telemóvel não fornecido.",
        timestamp,
      };
    }

    // Future integration placeholder:
    // If WhatsApp credentials are not configured, accurately report as prepared
    if (!apiKey || !phoneId) {
      console.info(
        `[Notificações/WhatsApp] Notificação (${message.event}) preparada para ${message.recipientPhone}, mas as credenciais de WhatsApp não estão configuradas. Envio adiado para fase posterior.`
      );
      return {
        channel: "whatsapp",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "prepared",
        reason: "provider_not_configured",
        timestamp,
      };
    }

    // When configured in future phase, dispatch via WhatsApp Cloud API
    try {
      // Future API call will reside here
      return {
        channel: "whatsapp",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "prepared",
        reason: "whatsapp_cloud_integration_pending",
        timestamp,
      };
    } catch (err) {
      console.error("[Notificações/WhatsApp] Exceção no envio:", err);
      return {
        channel: "whatsapp",
        recipient: message.recipient,
        event: message.event,
        delivered: false,
        status: "failed",
        error: "Exceção inesperada no envio de WhatsApp.",
        timestamp,
      };
    }
  }
}
