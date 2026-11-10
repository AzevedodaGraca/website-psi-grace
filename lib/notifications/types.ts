// Types for Phase 7D.4: Appointment Notification Foundation

import type {
  AppointmentType,
  AppointmentStatus,
  FullHourTimeSlot,
} from "@/lib/supabase/types";

/**
 * Validated, stripped appointment payload required for notifications.
 * Never includes database secrets or extraneous internal fields.
 */
export interface AppointmentNotificationPayload {
  id: string;
  appointment_type: AppointmentType;
  appointment_date: string; // ISO date 'YYYY-MM-DD'
  time_slot: FullHourTimeSlot;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_notes?: string | null;
  status: AppointmentStatus;
}

export type NotificationChannel = "email" | "whatsapp";

export type NotificationRecipient = "patient" | "admin";

export type NotificationEvent =
  | "appointment_created_admin"
  | "appointment_created_patient"
  | "appointment_confirmed_patient"
  | "appointment_cancelled_patient";

/**
 * Standardized message payload prepared for delivery.
 */
export interface NotificationMessage {
  event: NotificationEvent;
  recipient: NotificationRecipient;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  replyTo?: string;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  payload: AppointmentNotificationPayload;
}

/**
 * Result of a notification dispatch attempt.
 * Accurately distinguishes between delivered, prepared (awaiting provider config), and failed.
 */
export interface NotificationDispatchResult {
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  event: NotificationEvent;
  delivered: boolean;
  status: "delivered" | "prepared" | "failed";
  reason?: string;
  error?: string;
  providerMessageId?: string;
  timestamp: string;
}
