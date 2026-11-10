// Notification templates in European Portuguese (PT-PT)
// Follows the visual and communication standards for Psicóloga Grace Azevedo da Graça

import type {
  AppointmentNotificationPayload,
  NotificationMessage,
} from "./types";
import { isValidEmailAddress, sanitizeReplyToAddress } from "./providers/email";

export const DEFAULT_ADMIN_NOTIFICATION_EMAIL = "gracepsi@hotmail.com";

/**
 * Resolves the administrative notification and clinic Reply-To email address.
 * Priority:
 * 1. ADMIN_NOTIFICATION_EMAIL environment variable (when valid).
 * 2. Official clinic email fallback (gracepsi@hotmail.com).
 */
export function resolveAdminNotificationEmail(): string {
  const configuredEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim().toLowerCase();
  if (configuredEmail && isValidEmailAddress(configuredEmail)) {
    return configuredEmail;
  }
  return DEFAULT_ADMIN_NOTIFICATION_EMAIL;
}

/**
 * Escapes special HTML characters in user-provided strings to prevent
 * HTML injection or broken markup in email bodies while keeping text readable.
 */
export function escapeHtml(value?: string | null): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into full European Portuguese text.
 * Example: "Segunda-feira, 21 de setembro de 2026"
 */
export function formatAppointmentDatePt(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const formatted = date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    // Capitalize first letter (e.g. "Segunda-feira")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

/**
 * Formats the appointment modality with location / platform details.
 */
export function formatModalityPt(type: "presencial" | "online"): {
  title: string;
  location: string;
} {
  if (type === "presencial") {
    return {
      title: "Consulta Presencial",
      location: "Gabinete em Ovar: Rua de Timor, 67 – 1.º H, 3880-180 Ovar",
    };
  }
  return {
    title: "Consulta Online",
    location: "Videochamada através do WhatsApp",
  };
}

/**
 * 1. Admin Notification: New appointment received on the website.
 */
export function buildAdminNewBookingNotification(
  payload: AppointmentNotificationPayload,
  adminEmail: string
): NotificationMessage {
  const modality = formatModalityPt(payload.appointment_type);
  const formattedDate = formatAppointmentDatePt(payload.appointment_date);
  const safeSubjectName = payload.patient_name.replace(/[\r\n]+/g, " ").trim();

  const safeNameHtml = escapeHtml(payload.patient_name);
  const safeEmailHtml = escapeHtml(payload.patient_email);
  const safePhoneHtml = escapeHtml(payload.patient_phone);
  const safeNotesHtml = payload.patient_notes
    ? escapeHtml(payload.patient_notes)
    : "";

  const subject = `[Nova Marcação] ${safeSubjectName} — ${formattedDate} às ${payload.time_slot}`;

  const bodyText = `Nova marcação recebida através do website.

Detalhes da Marcação:
- Utente: ${payload.patient_name}
- Modalidade: ${modality.title} (${modality.location})
- Data: ${formattedDate}
- Horário: ${payload.time_slot} (duração de 1 hora)
- Telemóvel / WhatsApp: ${payload.patient_phone}
- E-mail: ${payload.patient_email}
${payload.patient_notes ? `- Observações do utente: "${payload.patient_notes}"\n` : ""}- Estado atual: Pendente

Poderá gerir e confirmar esta consulta através do Painel Administrativo.`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2a23; line-height: 1.6;">
      <div style="background-color: #f0f6f2; border-left: 4px solid #2e6f40; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 6px 0; color: #1d2a23; font-size: 20px;">Nova Marcação Recebida</h2>
        <p style="margin: 0; color: #5c6f64; font-size: 14px;">Foi registado um novo pedido de consulta através do website.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tbody>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #5c6f64; font-weight: 600; width: 140px;">Utente:</td>
            <td style="padding: 10px 0; color: #1d2a23; font-weight: bold;">${safeNameHtml}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #5c6f64; font-weight: 600;">Data:</td>
            <td style="padding: 10px 0; color: #1d2a23;">${formattedDate}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #5c6f64; font-weight: 600;">Horário:</td>
            <td style="padding: 10px 0; color: #2e6f40; font-weight: bold;">${payload.time_slot}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #5c6f64; font-weight: 600;">Modalidade:</td>
            <td style="padding: 10px 0; color: #1d2a23;">${modality.title}<br/><span style="font-size: 12px; color: #5c6f64;">${modality.location}</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #5c6f64; font-weight: 600;">Contactos:</td>
            <td style="padding: 10px 0; color: #1d2a23;">
              <a href="tel:${safePhoneHtml}" style="color: #2e6f40; text-decoration: none;">${safePhoneHtml}</a> &bull; 
              <a href="mailto:${safeEmailHtml}" style="color: #2e6f40; text-decoration: none;">${safeEmailHtml}</a>
            </td>
          </tr>
          ${
            safeNotesHtml
              ? `<tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #5c6f64; font-weight: 600;">Observação:</td>
                  <td style="padding: 10px 0; color: #1d2a23; font-style: italic;">&ldquo;${safeNotesHtml}&rdquo;</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 10px 0; color: #5c6f64; font-weight: 600;">Estado:</td>
            <td style="padding: 10px 0;"><span style="background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px;">Pendente</span></td>
          </tr>
        </tbody>
      </table>

      <p style="font-size: 13px; color: #5c6f64; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        Poderá aceder ao Painel Administrativo para confirmar ou gerir esta marcação.
      </p>
    </div>
  `;

  const replyTo = sanitizeReplyToAddress(payload.patient_email);

  return {
    event: "appointment_created_admin",
    recipient: "admin",
    recipientName: "Psicóloga Grace Azevedo da Graça",
    recipientEmail: adminEmail,
    ...(replyTo ? { replyTo } : {}),
    subject,
    bodyText,
    bodyHtml,
    payload,
  };
}

/**
 * 2. Patient Notification: Request received and is pending confirmation.
 */
export function buildPatientNewBookingNotification(
  payload: AppointmentNotificationPayload,
  replyToEmail?: string
): NotificationMessage {
  const modality = formatModalityPt(payload.appointment_type);
  const formattedDate = formatAppointmentDatePt(payload.appointment_date);
  const safeNameHtml = escapeHtml(payload.patient_name);

  const subject = `Recebemos o seu pedido de marcação — Psicóloga Grace Azevedo da Graça`;

  const bodyText = `Olá ${payload.patient_name},

Obrigado pelo seu contacto. A sua solicitação de consulta foi registada com sucesso e encontra-se pendente de confirmação.

Resumo do Pedido:
- Modalidade: ${modality.title}
- Local / Plataforma: ${modality.location}
- Data: ${formattedDate}
- Horário: ${payload.time_slot} (duração de 1 hora)

Entraremos em contacto brevemente através do WhatsApp ou e-mail para confirmar a sua marcação.

Com os melhores cumprimentos,
Grace Azevedo da Graça
Psicóloga Clínica (Cédula Profissional OPP 25999)
Ovar, Portugal`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2a23; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="color: #2e6f40; margin: 0 0 4px 0; font-size: 22px;">Pedido de Marcação Registado</h2>
        <p style="margin: 0; color: #5c6f64; font-size: 13px;">Psicóloga Grace Azevedo da Graça &bull; OPP 25999</p>
      </div>

      <p style="font-size: 15px;">Olá <strong>${safeNameHtml}</strong>,</p>

      <p style="font-size: 14px; color: #374151;">
        Obrigado pelo seu contacto. A sua solicitação de consulta foi registada com sucesso e encontra-se <strong>pendente de confirmação</strong>.
      </p>

      <div style="background-color: #f8faf8; border: 1px solid #d1e3d5; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1d2a23; border-bottom: 1px solid #d1e3d5; padding-bottom: 8px;">Resumo da Solicitação</h3>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Modalidade:</strong> ${modality.title}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Local:</strong> ${modality.location}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Data:</strong> ${formattedDate}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Horário:</strong> <span style="color: #2e6f40; font-weight: bold;">${payload.time_slot}</span> (1 hora)</p>
      </div>

      <div style="background-color: #f0f6f2; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #2e6f40; margin-bottom: 24px;">
        ℹ️ Entraremos em contacto brevemente via WhatsApp ou e-mail para confirmar a sua consulta.
      </div>

      <p style="font-size: 13px; color: #5c6f64; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        Com os melhores cumprimentos,<br/>
        <strong>Grace Azevedo da Graça</strong><br/>
        Psicóloga Clínica &bull; Cédula OPP 25999<br/>
        Ovar, Portugal
      </p>
    </div>
  `;

  const replyTo = sanitizeReplyToAddress(
    replyToEmail ?? resolveAdminNotificationEmail()
  );

  return {
    event: "appointment_created_patient",
    recipient: "patient",
    recipientName: payload.patient_name,
    recipientEmail: payload.patient_email,
    recipientPhone: payload.patient_phone,
    ...(replyTo ? { replyTo } : {}),
    subject,
    bodyText,
    bodyHtml,
    payload,
  };
}

/**
 * 3. Patient Notification: Appointment confirmed by the psychologist.
 */
export function buildPatientConfirmedNotification(
  payload: AppointmentNotificationPayload,
  replyToEmail?: string
): NotificationMessage {
  const modality = formatModalityPt(payload.appointment_type);
  const formattedDate = formatAppointmentDatePt(payload.appointment_date);
  const safeNameHtml = escapeHtml(payload.patient_name);

  const subject = `Consulta Confirmada — Psicóloga Grace Azevedo da Graça`;

  const bodyText = `Olá ${payload.patient_name},

A sua consulta foi confirmada com sucesso.

Detalhes da Consulta:
- Modalidade: ${modality.title}
- Local / Plataforma: ${modality.location}
- Data: ${formattedDate}
- Horário: ${payload.time_slot} (duração de 1 hora)

${
  payload.appointment_type === "presencial"
    ? "O gabinete situa-se na Rua de Timor, 67 – 1.º H, em Ovar. Agradecemos a chegada com 5 minutos de antecedência."
    : "A consulta online será realizada por videochamada através do WhatsApp no horário agendado."
}

Caso necessite de alterar ou remarcar a sua consulta, solicitamos que nos contacte com a maior antecedência possível.

Com os melhores cumprimentos,
Grace Azevedo da Graça
Psicóloga Clínica (Cédula Profissional OPP 25999)
Ovar, Portugal`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2a23; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="color: #2e6f40; margin: 0 0 4px 0; font-size: 22px;">Consulta Confirmada ✓</h2>
        <p style="margin: 0; color: #5c6f64; font-size: 13px;">Psicóloga Grace Azevedo da Graça &bull; OPP 25999</p>
      </div>

      <p style="font-size: 15px;">Olá <strong>${safeNameHtml}</strong>,</p>

      <p style="font-size: 14px; color: #374151;">
        Temos o prazer de informar que a sua consulta foi <strong>confirmada com sucesso</strong>.
      </p>

      <div style="background-color: #f0f6f2; border: 1px solid #2e6f40; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1d2a23; border-bottom: 1px solid #d1e3d5; padding-bottom: 8px;">Dados da Consulta</h3>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Modalidade:</strong> ${modality.title}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Local / Plataforma:</strong> ${modality.location}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Data:</strong> ${formattedDate}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Horário:</strong> <span style="color: #2e6f40; font-weight: bold; font-size: 16px;">${payload.time_slot}</span> (1 hora)</p>
      </div>

      <div style="background-color: #f8faf8; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #374151; margin-bottom: 24px;">
        ${
          payload.appointment_type === "presencial"
            ? "📍 <strong>Instruções:</strong> O gabinete localiza-se na <em>Rua de Timor, 67 – 1.º H, Ovar</em>. Agradecemos a chegada com cerca de 5 minutos de antecedência."
            : "💻 <strong>Instruções:</strong> A consulta online será realizada por videochamada através do WhatsApp no horário agendado."
        }
      </div>

      <p style="font-size: 13px; color: #5c6f64; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        Com os melhores cumprimentos,<br/>
        <strong>Grace Azevedo da Graça</strong><br/>
        Psicóloga Clínica &bull; Cédula OPP 25999<br/>
        Ovar, Portugal
      </p>
    </div>
  `;

  const replyTo = sanitizeReplyToAddress(
    replyToEmail ?? resolveAdminNotificationEmail()
  );

  return {
    event: "appointment_confirmed_patient",
    recipient: "patient",
    recipientName: payload.patient_name,
    recipientEmail: payload.patient_email,
    recipientPhone: payload.patient_phone,
    ...(replyTo ? { replyTo } : {}),
    subject,
    bodyText,
    bodyHtml,
    payload,
  };
}

/**
 * 4. Patient Notification: Appointment cancelled.
 */
export function buildPatientCancelledNotification(
  payload: AppointmentNotificationPayload,
  replyToEmail?: string
): NotificationMessage {
  const modality = formatModalityPt(payload.appointment_type);
  const formattedDate = formatAppointmentDatePt(payload.appointment_date);
  const safeNameHtml = escapeHtml(payload.patient_name);

  const subject = `Atualização da Marcação: Cancelada — Psicóloga Grace Azevedo da Graça`;

  const bodyText = `Olá ${payload.patient_name},

Informamos que a sua marcação de consulta para o dia ${formattedDate} às ${payload.time_slot} (${modality.title}) foi cancelada.

Caso deseje agendar uma nova data ou horário, poderá fazê-lo comodamente através do nosso website ou contactando-nos diretamente por WhatsApp.

Com os melhores cumprimentos,
Grace Azevedo da Graça
Psicóloga Clínica (Cédula Profissional OPP 25999)
Ovar, Portugal`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2a23; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="color: #b91c1c; margin: 0 0 4px 0; font-size: 22px;">Marcação Cancelada</h2>
        <p style="margin: 0; color: #5c6f64; font-size: 13px;">Psicóloga Grace Azevedo da Graça &bull; OPP 25999</p>
      </div>

      <p style="font-size: 15px;">Olá <strong>${safeNameHtml}</strong>,</p>

      <p style="font-size: 14px; color: #374151;">
        Informamos que a sua marcação de consulta para o dia <strong>${formattedDate}</strong> às <strong>${payload.time_slot}</strong> (${modality.title}) foi cancelada.
      </p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #991b1b; margin: 20px 0;">
        Se pretender remarcar ou agendar para outra data, poderá fazê-lo diretamente através do website ou por contacto via WhatsApp.
      </div>

      <p style="font-size: 13px; color: #5c6f64; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        Com os melhores cumprimentos,<br/>
        <strong>Grace Azevedo da Graça</strong><br/>
        Psicóloga Clínica &bull; Cédula OPP 25999<br/>
        Ovar, Portugal
      </p>
    </div>
  `;

  const replyTo = sanitizeReplyToAddress(
    replyToEmail ?? resolveAdminNotificationEmail()
  );

  return {
    event: "appointment_cancelled_patient",
    recipient: "patient",
    recipientName: payload.patient_name,
    recipientEmail: payload.patient_email,
    recipientPhone: payload.patient_phone,
    ...(replyTo ? { replyTo } : {}),
    subject,
    bodyText,
    bodyHtml,
    payload,
  };
}
