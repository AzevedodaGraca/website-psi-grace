// Provider interface for Phase 7D.4: Appointment Notification Foundation

import type {
  NotificationMessage,
  NotificationDispatchResult,
} from "../types";

export interface NotificationProvider {
  /**
   * Unique name of the notification provider (e.g. 'resend', 'smtp', 'whatsapp-cloud', 'unconfigured').
   */
  readonly name: string;

  /**
   * Dispatches an email notification.
   */
  sendEmail(message: NotificationMessage): Promise<NotificationDispatchResult>;

  /**
   * Dispatches a WhatsApp notification.
   */
  sendWhatsApp(message: NotificationMessage): Promise<NotificationDispatchResult>;
}
