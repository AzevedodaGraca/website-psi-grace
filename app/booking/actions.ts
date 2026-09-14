"use server";

import {
  type AppointmentType,
  type FullHourTimeSlot,
  FULL_HOUR_SLOTS,
} from "@/lib/supabase/types";
import { createServerSupabaseAdminClient } from "@/lib/supabase/server";

export interface CreateAppointmentInput {
  appointment_type: AppointmentType | string;
  appointment_date: string; // ISO date 'YYYY-MM-DD'
  time_slot: FullHourTimeSlot | string; // e.g. '10:00'
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_notes?: string | null;
}

export interface BookingActionResult {
  success: boolean;
  appointmentId?: string;
  error?: string;
}

/**
 * Returns current date and time components in Europe/Lisbon timezone.
 */
export async function getNowInLisbon(): Promise<{
  dateStr: string;
  hour: number;
  minute: number;
}> {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  let year = "";
  let month = "";
  let day = "";
  let hour = "0";
  let minute = "0";

  for (const p of parts) {
    if (p.type === "year") year = p.value;
    if (p.type === "month") month = p.value;
    if (p.type === "day") day = p.value;
    if (p.type === "hour") hour = p.value;
    if (p.type === "minute") minute = p.value;
  }

  return {
    dateStr: `${year}-${month}-${day}`,
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
  };
}

/**
 * Validates whether a date string is a real calendar date in YYYY-MM-DD format.
 */
function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 2024 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day
  );
}

/**
 * Calculates day of the week (0 = Sun, 1 = Mon, ..., 6 = Sat) in UTC
 * to prevent local timezone offsets from altering the calendar day.
 */
function getDayOfWeek(dateStr: string): number {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return dateObj.getUTCDay();
}

/**
 * Validates email format according to simplified RFC 5322.
 */
function isValidEmail(email: string): boolean {
  if (!email || email.length > 150) return false;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format allowing international prefixes and standard separators.
 */
function isValidPhone(phone: string): boolean {
  if (!phone || phone.length < 6 || phone.length > 30) return false;
  return /^[+]?[0-9\s().-]{6,30}$/.test(phone);
}

/**
 * Core server action for booking a patient consultation.
 * Validates all input data, checks schedule availability and slot conflicts,
 * and inserts the appointment with status 'pending'.
 */
export async function bookAppointment(
  input: CreateAppointmentInput
): Promise<BookingActionResult> {
  try {
    // 1. Basic payload validation
    if (!input || typeof input !== "object") {
      return {
        success: false,
        error: "Dados de agendamento em falta.",
      };
    }

    // 2. Validate appointment_type
    if (input.appointment_type !== "presencial" && input.appointment_type !== "online") {
      return {
        success: false,
        error: "Modalidade de consulta inválida. As opções disponíveis são presencial ou online.",
      };
    }
    const sanitizedType: AppointmentType = input.appointment_type;

    // 3. Validate appointment_date
    const rawDate =
      typeof input.appointment_date === "string" ? input.appointment_date.trim() : "";
    if (!isValidCalendarDate(rawDate)) {
      return {
        success: false,
        error: "Data de consulta inválida. Por favor, selecione uma data válida no formato AAAA-MM-DD.",
      };
    }
    const sanitizedDate = rawDate;

    // 4. Validate time_slot
    const rawSlot =
      typeof input.time_slot === "string" ? input.time_slot.trim() : "";
    if (!FULL_HOUR_SLOTS.includes(rawSlot as FullHourTimeSlot)) {
      return {
        success: false,
        error:
          "Horário selecionado inválido. As consultas decorrem exclusivamente em horas certas autorizadas (ex: 09:00, 10:00, 14:00).",
      };
    }
    const sanitizedTimeSlot: FullHourTimeSlot = rawSlot as FullHourTimeSlot;

    // 5. Validate patient_name
    const sanitizedName =
      typeof input.patient_name === "string" ? input.patient_name.trim() : "";
    if (!sanitizedName) {
      return {
        success: false,
        error: "O nome completo é de preenchimento obrigatório.",
      };
    }
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return {
        success: false,
        error: "O nome deve conter entre 2 e 100 caracteres.",
      };
    }

    // 6. Validate patient_email
    const sanitizedEmail =
      typeof input.patient_email === "string"
        ? input.patient_email.trim().toLowerCase()
        : "";
    if (!sanitizedEmail) {
      return {
        success: false,
        error: "O endereço de e-mail é de preenchimento obrigatório.",
      };
    }
    if (!isValidEmail(sanitizedEmail)) {
      return {
        success: false,
        error: "Por favor, introduza um endereço de e-mail válido (máximo 150 caracteres).",
      };
    }

    // 7. Validate patient_phone
    const sanitizedPhone =
      typeof input.patient_phone === "string" ? input.patient_phone.trim() : "";
    if (!sanitizedPhone) {
      return {
        success: false,
        error: "O número de telefone / WhatsApp é de preenchimento obrigatório.",
      };
    }
    if (!isValidPhone(sanitizedPhone)) {
      return {
        success: false,
        error: "Por favor, introduza um número de contacto válido (entre 6 e 30 dígitos).",
      };
    }

    // 8. Validate patient_notes (optional)
    let sanitizedNotes: string | null = null;
    if (input.patient_notes !== undefined && input.patient_notes !== null) {
      if (typeof input.patient_notes !== "string") {
        return {
          success: false,
          error: "O campo de observações contém um formato inválido.",
        };
      }
      const trimmedNotes = input.patient_notes.trim();
      if (trimmedNotes.length > 1000) {
        return {
          success: false,
          error: "As observações adicionais não podem exceder os 1000 caracteres.",
        };
      }
      sanitizedNotes = trimmedNotes.length > 0 ? trimmedNotes : null;
    }

    // 9. Prevent booking dates or times in the past (Europe/Lisbon timezone)
    const nowInLisbon = await getNowInLisbon();
    if (sanitizedDate < nowInLisbon.dateStr) {
      return {
        success: false,
        error: "Não é possível agendar consultas para datas passadas.",
      };
    }

    if (sanitizedDate === nowInLisbon.dateStr) {
      const [slotHourStr, slotMinuteStr] = sanitizedTimeSlot.split(":");
      const slotHour = parseInt(slotHourStr, 10);
      const slotMinute = parseInt(slotMinuteStr || "0", 10);

      if (
        slotHour < nowInLisbon.hour ||
        (slotHour === nowInLisbon.hour && nowInLisbon.minute >= slotMinute)
      ) {
        return {
          success: false,
          error: "O horário selecionado já passou. Por favor, escolha um horário futuro.",
        };
      }
    }

    // 10. Verify availability against availability_schedules using server-only admin client
    const supabaseAdmin = createServerSupabaseAdminClient();

    // A. Check for specific date overrides first
    const { data: dateOverrides, error: dateOverridesError } = await supabaseAdmin
      .from("availability_schedules")
      .select("id, schedule_date, day_of_week, appointment_type, time_slot, is_blocked")
      .eq("schedule_date", sanitizedDate);

    if (dateOverridesError) {
      console.error("Erro ao consultar exceções de disponibilidade:", {
        message: dateOverridesError.message,
        code: dateOverridesError.code,
      });
      return {
        success: false,
        error:
          "Ocorreu um erro ao verificar a disponibilidade da agenda. Por favor, tente novamente.",
      };
    }

    if (dateOverrides && dateOverrides.length > 0) {
      // If the entire day is blocked by an override
      const isFullDayBlocked = dateOverrides.some((row) => row.is_blocked);
      if (isFullDayBlocked) {
        return {
          success: false,
          error: "O consultório encontra-se encerrado na data selecionada.",
        };
      }

      // If specific slots are overridden, match against active override records
      const matchingOverride = dateOverrides.find(
        (row) =>
          row.time_slot === sanitizedTimeSlot &&
          row.appointment_type === sanitizedType &&
          !row.is_blocked
      );

      if (!matchingOverride) {
        return {
          success: false,
          error:
            "O horário selecionado não se encontra disponível nesta data para a modalidade escolhida.",
        };
      }
    } else {
      // B. No date override; verify recurring weekly schedule
      const dayOfWeek = getDayOfWeek(sanitizedDate);

      const { data: weeklySchedule, error: weeklyError } = await supabaseAdmin
        .from("availability_schedules")
        .select("id, schedule_date, day_of_week, appointment_type, time_slot, is_blocked")
        .is("schedule_date", null)
        .eq("day_of_week", dayOfWeek);

      if (weeklyError) {
        console.error("Erro ao consultar horário semanal:", {
          message: weeklyError.message,
          code: weeklyError.code,
        });
        return {
          success: false,
          error:
            "Ocorreu um erro ao verificar a disponibilidade da agenda. Por favor, tente novamente.",
        };
      }

      const matchingWeekly = (weeklySchedule || []).find(
        (row) =>
          row.time_slot === sanitizedTimeSlot &&
          row.appointment_type === sanitizedType &&
          !row.is_blocked
      );

      if (!matchingWeekly) {
        return {
          success: false,
          error:
            "O horário selecionado não se encontra disponível na agenda semanal para a modalidade pretendida.",
        };
      }
    }

    // 11. Pre-check for existing active appointments (pending or confirmed)
    const { data: existingActive, error: activeCheckError } = await supabaseAdmin
      .from("appointments")
      .select("id")
      .eq("appointment_date", sanitizedDate)
      .eq("time_slot", sanitizedTimeSlot)
      .in("status", ["pending", "confirmed"])
      .limit(1);

    if (activeCheckError) {
      console.error("Erro ao consultar agendamentos existentes:", {
        message: activeCheckError.message,
        code: activeCheckError.code,
      });
      return {
        success: false,
        error:
          "Ocorreu um erro ao verificar a vaga selecionada. Por favor, tente novamente.",
      };
    }

    if (existingActive && existingActive.length > 0) {
      return {
        success: false,
        error:
          "O horário selecionado já se encontra reservado. Por favor, escolha outro horário.",
      };
    }

    // 12. Insert appointment with status: 'pending'
    const { data: newAppointment, error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert({
        appointment_type: sanitizedType,
        appointment_date: sanitizedDate,
        time_slot: sanitizedTimeSlot,
        patient_name: sanitizedName,
        patient_email: sanitizedEmail,
        patient_phone: sanitizedPhone,
        patient_notes: sanitizedNotes,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      // PostgreSQL 23505 = unique_violation (concurrent booking collision on idx_unique_active_appointment_slot)
      if (
        insertError.code === "23505" ||
        insertError.message?.toLowerCase().includes("unique") ||
        insertError.message?.toLowerCase().includes("duplicate")
      ) {
        return {
          success: false,
          error:
            "O horário selecionado acabou de ser reservado por outro utente. Por favor, escolha outro horário.",
        };
      }

      console.error("Erro ao registar marcação de consulta:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
      });

      return {
        success: false,
        error:
          "Não foi possível registar o seu pedido de marcação. Por favor, tente novamente mais tarde.",
      };
    }

    return {
      success: true,
      appointmentId: newAppointment.id,
    };
  } catch (err) {
    console.error("Exceção inesperada em bookAppointment:", err);
    return {
      success: false,
      error:
        "Ocorreu um erro inesperado ao processar o seu agendamento. Por favor, tente novamente mais tarde.",
    };
  }
}

/**
 * Alias for bookAppointment adhering to common naming conventions.
 */
export async function createAppointmentBooking(
  input: CreateAppointmentInput
): Promise<BookingActionResult> {
  return bookAppointment(input);
}

export interface AvailableSlotsResult {
  success: boolean;
  slots: FullHourTimeSlot[];
  isBlockedDate?: boolean;
  error?: string;
}

export interface MonthScheduleResult {
  success: boolean;
  activeDaysOfWeek: number[]; // 0-6 (Sun-Sat)
  blockedDates: string[]; // YYYY-MM-DD
  datesWithOverrides: Record<string, boolean>; // YYYY-MM-DD -> has slots or not
  error?: string;
}

/**
 * Retrieves available full-hour slots for a specific date and appointment modality.
 * Respects date-specific overrides, weekly default schedule, and excludes already booked appointments.
 */
export async function getAvailableSlots(
  dateStr: string,
  appointmentType: AppointmentType
): Promise<AvailableSlotsResult> {
  try {
    if (appointmentType !== "presencial" && appointmentType !== "online") {
      return { success: false, slots: [], error: "Modalidade inválida." };
    }

    if (!isValidCalendarDate(dateStr)) {
      return { success: false, slots: [], error: "Data inválida." };
    }

    const nowInLisbon = await getNowInLisbon();
    if (dateStr < nowInLisbon.dateStr) {
      return { success: true, slots: [], isBlockedDate: true };
    }

    const supabaseAdmin = createServerSupabaseAdminClient();

    // 1. Check date overrides for dateStr
    const { data: dateOverrides, error: dateOverridesError } = await supabaseAdmin
      .from("availability_schedules")
      .select("id, schedule_date, day_of_week, appointment_type, time_slot, is_blocked")
      .eq("schedule_date", dateStr);

    if (dateOverridesError) {
      console.error("Erro ao consultar exceções de disponibilidade:", {
        message: dateOverridesError.message,
        code: dateOverridesError.code,
      });
      return {
        success: false,
        slots: [],
        error: "Erro ao consultar disponibilidade da agenda.",
      };
    }

    let candidateSlots: FullHourTimeSlot[] = [];

    if (dateOverrides && dateOverrides.length > 0) {
      const isFullDayBlocked = dateOverrides.some((row) => row.is_blocked);
      if (isFullDayBlocked) {
        return { success: true, slots: [], isBlockedDate: true };
      }

      candidateSlots = dateOverrides
        .filter((row) => row.appointment_type === appointmentType && !row.is_blocked)
        .map((row) => row.time_slot as FullHourTimeSlot);
    } else {
      // 2. Check weekly schedule
      const dayOfWeek = getDayOfWeek(dateStr);
      const { data: weeklySchedule, error: weeklyError } = await supabaseAdmin
        .from("availability_schedules")
        .select("id, schedule_date, day_of_week, appointment_type, time_slot, is_blocked")
        .is("schedule_date", null)
        .eq("day_of_week", dayOfWeek);

      if (weeklyError) {
        console.error("Erro ao consultar horário semanal:", {
          message: weeklyError.message,
          code: weeklyError.code,
        });
        return {
          success: false,
          slots: [],
          error: "Erro ao consultar disponibilidade da agenda.",
        };
      }

      candidateSlots = (weeklySchedule || [])
        .filter((row) => row.appointment_type === appointmentType && !row.is_blocked)
        .map((row) => row.time_slot as FullHourTimeSlot);
    }

    if (candidateSlots.length === 0) {
      return { success: true, slots: [] };
    }

    // 3. Check existing active appointments for dateStr
    const { data: bookedData, error: bookedError } = await supabaseAdmin
      .from("appointments")
      .select("time_slot")
      .eq("appointment_date", dateStr)
      .in("status", ["pending", "confirmed"]);

    if (bookedError) {
      console.error("Erro ao consultar vagas ocupadas:", {
        message: bookedError.message,
        code: bookedError.code,
      });
      return {
        success: false,
        slots: [],
        error: "Erro ao verificar vagas existentes.",
      };
    }

    const bookedSlots = new Set((bookedData || []).map((row) => row.time_slot));
    let availableSlots = candidateSlots.filter((slot) => !bookedSlots.has(slot));

    // 4. If date is today in Lisbon, filter out past hours
    if (dateStr === nowInLisbon.dateStr) {
      availableSlots = availableSlots.filter((slot) => {
        const [hourStr, minuteStr] = slot.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr || "0", 10);
        return hour > nowInLisbon.hour || (hour === nowInLisbon.hour && nowInLisbon.minute < minute);
      });
    }

    // 5. Sort chronologically by FULL_HOUR_SLOTS order
    availableSlots.sort((a, b) => FULL_HOUR_SLOTS.indexOf(a) - FULL_HOUR_SLOTS.indexOf(b));

    return { success: true, slots: availableSlots };
  } catch (err) {
    console.error("Exceção inesperada em getAvailableSlots:", err);
    return {
      success: false,
      slots: [],
      error: "Ocorreu um erro ao carregar os horários disponíveis.",
    };
  }
}

/**
 * Retrieves monthly availability metadata for the calendar view.
 * Returns active recurring weekdays, explicitly blocked dates, and specific override dates.
 */
export async function getMonthSchedule(
  year: number,
  month: number, // 1-12
  appointmentType: AppointmentType
): Promise<MonthScheduleResult> {
  try {
    if (appointmentType !== "presencial" && appointmentType !== "online") {
      return {
        success: false,
        activeDaysOfWeek: [],
        blockedDates: [],
        datesWithOverrides: {},
        error: "Modalidade inválida.",
      };
    }

    const supabaseAdmin = createServerSupabaseAdminClient();

    // 1. Get weekly recurring days of week for this modality
    const { data: weeklyData, error: weeklyError } = await supabaseAdmin
      .from("availability_schedules")
      .select("day_of_week")
      .is("schedule_date", null)
      .eq("appointment_type", appointmentType)
      .eq("is_blocked", false);

    if (weeklyError) {
      console.error("Erro ao carregar dias da semana ativos:", {
        message: weeklyError.message,
        code: weeklyError.code,
      });
      return {
        success: false,
        activeDaysOfWeek: [],
        blockedDates: [],
        datesWithOverrides: {},
        error: "Erro ao consultar agenda.",
      };
    }

    const activeDaysOfWeek = Array.from(
      new Set(
        (weeklyData || [])
          .map((row) => row.day_of_week)
          .filter((dow): dow is number => dow !== null && dow !== undefined)
      )
    );

    // 2. Query date overrides for this month
    const startMonthStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDayNum = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const endMonthStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;

    const { data: overrideData, error: overrideError } = await supabaseAdmin
      .from("availability_schedules")
      .select("schedule_date, appointment_type, is_blocked")
      .gte("schedule_date", startMonthStr)
      .lte("schedule_date", endMonthStr);

    if (overrideError) {
      console.error("Erro ao carregar exceções do mês:", {
        message: overrideError.message,
        code: overrideError.code,
      });
      return {
        success: false,
        activeDaysOfWeek,
        blockedDates: [],
        datesWithOverrides: {},
        error: "Erro ao consultar agenda.",
      };
    }

    const blockedDates: string[] = [];
    const datesWithOverrides: Record<string, boolean> = {};

    const byDate: Record<string, { hasBlocked: boolean; hasActiveSlotForModality: boolean }> = {};

    (overrideData || []).forEach((row) => {
      if (!row.schedule_date) return;
      const d = row.schedule_date;
      if (!byDate[d]) {
        byDate[d] = { hasBlocked: false, hasActiveSlotForModality: false };
      }
      if (row.is_blocked) {
        byDate[d].hasBlocked = true;
      } else if (row.appointment_type === appointmentType) {
        byDate[d].hasActiveSlotForModality = true;
      }
    });

    Object.entries(byDate).forEach(([d, info]) => {
      if (info.hasBlocked) {
        blockedDates.push(d);
        datesWithOverrides[d] = false;
      } else {
        datesWithOverrides[d] = info.hasActiveSlotForModality;
        if (!info.hasActiveSlotForModality) {
          blockedDates.push(d);
        }
      }
    });

    return {
      success: true,
      activeDaysOfWeek,
      blockedDates,
      datesWithOverrides,
    };
  } catch (err) {
    console.error("Exceção inesperada em getMonthSchedule:", err);
    return {
      success: false,
      activeDaysOfWeek: [],
      blockedDates: [],
      datesWithOverrides: {},
      error: "Erro ao consultar agenda mensal.",
    };
  }
}
