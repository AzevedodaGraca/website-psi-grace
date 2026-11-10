// Notification orchestration service for Phase 7D.4
// Server-only dispatching with fault isolation and security safeguards

import type {
  AppointmentNotificationPayload,
  NotificationDispatchResult,
} from "./types";
import {
  buildAdminNewBookingNotification,
  buildPatientNewBookingNotification,
  buildPatientConfirmedNotification,
  buildPatientCancelledNotification,
  resolveAdminNotificationEmail,
  DEFAULT_ADMIN_NOTIFICATION_EMAIL,
} from "./templates";
import { EmailNotificationProvider } from "./providers/email";
import { WhatsAppNotificationProvider } from "./providers/whatsapp";
import type { NotificationProvider } from "./providers/provider";

export { resolveAdminNotificationEmail, DEFAULT_ADMIN_NOTIFICATION_EMAIL };

// Default singleton provider instances
const defaultEmailProvider = new EmailNotificationProvider();
const defaultWhatsAppProvider = new WhatsAppNotificationProvider();

export interface NotificationDispatchProviders {
  emailProvider?: NotificationProvider;
  whatsAppProvider?: NotificationProvider;
}

/**
 * Dispatches notifications when a new appointment is created on the website.
 * 1. Admin notification (to psychologist)
 * 2. Patient acknowledgment (pending status)
 * Non-blocking: Errors are caught and logged safely.
 */
export async function dispatchAppointmentCreatedNotifications(
  payload: AppointmentNotificationPayload,
  providers?: NotificationDispatchProviders
): Promise<NotificationDispatchResult[]> {
  const results: NotificationDispatchResult[] = [];
  const emailProvider = providers?.emailProvider ?? defaultEmailProvider;
  const whatsAppProvider = providers?.whatsAppProvider ?? defaultWhatsAppProvider;
  const adminEmail = resolveAdminNotificationEmail();

  if (!adminEmail) {
    console.info(
      `[Notificações] E-mail do administrador não configurado (ADMIN_NOTIFICATION_EMAIL). Notificação do administrador adiada com segurança (${payload.id}).`
    );
    results.push({
      channel: "email",
      recipient: "admin",
      event: "appointment_created_admin",
      delivered: false,
      status: "prepared",
      reason: "admin_email_not_configured",
      timestamp: new Date().toISOString(),
    });
  } else {
    try {
      // 1. Admin Notification
      const adminMessage = buildAdminNewBookingNotification(payload, adminEmail);
      const adminResult = await emailProvider.sendEmail(adminMessage);
      results.push(adminResult);
    } catch (err) {
      console.error("[Notificações] Falha ao preparar notificação do administrador:", err);
      results.push({
        channel: "email",
        recipient: "admin",
        event: "appointment_created_admin",
        delivered: false,
        status: "failed",
        error: "Erro inesperado ao despachar notificação ao administrador.",
        timestamp: new Date().toISOString(),
      });
    }
  }

  try {
    // 2. Patient Acknowledgment (Email)
    const patientMessage = buildPatientNewBookingNotification(payload, adminEmail);
    const patientEmailResult = await emailProvider.sendEmail(patientMessage);
    results.push(patientEmailResult);

    // 3. Patient Acknowledgment (WhatsApp - future provider channel)
    const patientWhatsAppResult = await whatsAppProvider.sendWhatsApp(patientMessage);
    results.push(patientWhatsAppResult);
  } catch (err) {
    console.error("[Notificações] Falha ao preparar notificação do utente:", err);
    results.push({
      channel: "email",
      recipient: "patient",
      event: "appointment_created_patient",
      delivered: false,
      status: "failed",
      error: "Erro inesperado ao despachar notificação ao utente.",
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Dispatches notification when an appointment is confirmed by the administrator.
 */
export async function dispatchAppointmentConfirmedNotification(
  payload: AppointmentNotificationPayload,
  providers?: NotificationDispatchProviders
): Promise<NotificationDispatchResult[]> {
  const results: NotificationDispatchResult[] = [];
  const emailProvider = providers?.emailProvider ?? defaultEmailProvider;
  const whatsAppProvider = providers?.whatsAppProvider ?? defaultWhatsAppProvider;
  const adminEmail = resolveAdminNotificationEmail();

  try {
    const patientMessage = buildPatientConfirmedNotification(payload, adminEmail);
    const emailResult = await emailProvider.sendEmail(patientMessage);
    results.push(emailResult);

    const whatsAppResult = await whatsAppProvider.sendWhatsApp(patientMessage);
    results.push(whatsAppResult);
  } catch (err) {
    console.error("[Notificações] Falha ao despachar confirmação ao utente:", err);
    results.push({
      channel: "email",
      recipient: "patient",
      event: "appointment_confirmed_patient",
      delivered: false,
      status: "failed",
      error: "Erro inesperado ao despachar confirmação ao utente.",
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Dispatches notification when an appointment is cancelled by the administrator.
 */
export async function dispatchAppointmentCancelledNotification(
  payload: AppointmentNotificationPayload,
  providers?: NotificationDispatchProviders
): Promise<NotificationDispatchResult[]> {
  const results: NotificationDispatchResult[] = [];
  const emailProvider = providers?.emailProvider ?? defaultEmailProvider;
  const whatsAppProvider = providers?.whatsAppProvider ?? defaultWhatsAppProvider;
  const adminEmail = resolveAdminNotificationEmail();

  try {
    const patientMessage = buildPatientCancelledNotification(payload, adminEmail);
    const emailResult = await emailProvider.sendEmail(patientMessage);
    results.push(emailResult);

    const whatsAppResult = await whatsAppProvider.sendWhatsApp(patientMessage);
    results.push(whatsAppResult);
  } catch (err) {
    console.error("[Notificações] Falha ao despachar cancelamento ao utente:", err);
    results.push({
      channel: "email",
      recipient: "patient",
      event: "appointment_cancelled_patient",
      delivered: false,
      status: "failed",
      error: "Erro inesperado ao despachar cancelamento ao utente.",
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
