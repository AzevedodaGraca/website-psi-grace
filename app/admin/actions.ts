"use server";

import {
  createServerClientInstance,
  createServerSupabaseAdminClient,
} from "@/lib/supabase/server";
import type { Appointment, AppointmentStatus } from "@/lib/supabase/types";

/**
 * Helper to securely verify caller authentication and admin authorization.
 */
async function verifyAdminAuth() {
  const serverSupabase = await createServerClientInstance();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user || !user.email) {
    return { authorized: false, error: "Não autenticado." };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return { authorized: false, error: "Não autorizado." };
  }

  // Verify registration in public.admin_users
  const adminDb = createServerSupabaseAdminClient();
  const { data: adminRecord, error: adminErr } = await adminDb
    .from("admin_users")
    .select("id")
    .or(`user_id.eq.${user.id},email.eq.${user.email.toLowerCase()}`)
    .maybeSingle();

  if (adminErr || !adminRecord) {
    if (adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase()) {
      await adminDb.from("admin_users").upsert(
        {
          user_id: user.id,
          email: user.email.toLowerCase(),
        },
        { onConflict: "email" }
      );
    } else {
      return { authorized: false, error: "Não autorizado." };
    }
  }

  return { authorized: true, user };
}

/**
 * Synchronizes the authenticated administrator user with the admin_users table.
 */
export async function syncAdminUser() {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error || "Não autorizado." };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro inesperado em syncAdminUser:", err);
    return { success: false, error: "Erro interno do servidor." };
  }
}

export type GetAppointmentsResult =
  | {
      success: true;
      appointments: Appointment[];
    }
  | {
      success: false;
      appointments: [];
      error: string;
    };

/**
 * Retrieves all appointments for administrative management.
 * Orders upcoming consultations first, followed by past appointments.
 */
export async function getAdminAppointments(): Promise<GetAppointmentsResult> {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.authorized) {
      return {
        success: false,
        appointments: [],
        error: authCheck.error || "Acesso não autorizado.",
      };
    }

    const adminDb = createServerSupabaseAdminClient();
    const { data, error } = await adminDb
      .from("appointments")
      .select(
        "id, appointment_type, appointment_date, time_slot, patient_name, patient_email, patient_phone, patient_notes, status, created_at, updated_at"
      )
      .order("appointment_date", { ascending: false })
      .order("time_slot", { ascending: false });

    if (error) {
      console.error("Erro ao consultar marcações administrativas:", {
        message: error.message,
        code: error.code,
      });
      return {
        success: false,
        appointments: [],
        error: "Não foi possível carregar as marcações. Por favor, tente novamente.",
      };
    }

    // Determine today in Europe/Lisbon timezone
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const appointments = (data || []) as Appointment[];

    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    for (const apt of appointments) {
      if (apt.appointment_date >= todayStr) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    }

    // Upcoming: closest date first, time ascending
    upcoming.sort((a, b) => {
      if (a.appointment_date !== b.appointment_date) {
        return a.appointment_date.localeCompare(b.appointment_date);
      }
      return a.time_slot.localeCompare(b.time_slot);
    });

    // Past: most recent past date first, time descending
    past.sort((a, b) => {
      if (a.appointment_date !== b.appointment_date) {
        return b.appointment_date.localeCompare(a.appointment_date);
      }
      return b.time_slot.localeCompare(a.time_slot);
    });

    return {
      success: true,
      appointments: [...upcoming, ...past],
    };
  } catch (err) {
    console.error("Exceção inesperada em getAdminAppointments:", err);
    return {
      success: false,
      appointments: [],
      error: "Ocorreu um erro inesperado ao consultar as marcações.",
    };
  }
}

export type UpdateStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Updates the status of an appointment ('pending' | 'confirmed' | 'cancelled').
 * Strictly modifies status and updated_at, enforcing double-booking safety.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<UpdateStatusResult> {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.authorized) {
      return {
        success: false,
        error: authCheck.error || "Acesso não autorizado.",
      };
    }

    if (!appointmentId || typeof appointmentId !== "string") {
      return { success: false, error: "Identificador de marcação inválido." };
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(appointmentId)) {
      return { success: false, error: "Formato de ID de marcação inválido." };
    }

    if (!["pending", "confirmed", "cancelled"].includes(newStatus)) {
      return { success: false, error: "Estado de consulta inválido." };
    }

    const adminDb = createServerSupabaseAdminClient();

    // Fetch existing appointment to verify existence and slot details
    const { data: existing, error: fetchErr } = await adminDb
      .from("appointments")
      .select("id, appointment_date, time_slot, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return { success: false, error: "Marcação não encontrada." };
    }

    // If status isn't changing, return success early
    if (existing.status === newStatus) {
      return { success: true };
    }

    // If setting to active status ('confirmed' or 'pending'):
    // Check if another active appointment already occupies this slot
    if (newStatus === "confirmed" || newStatus === "pending") {
      const { data: conflict, error: conflictErr } = await adminDb
        .from("appointments")
        .select("id")
        .eq("appointment_date", existing.appointment_date)
        .eq("time_slot", existing.time_slot)
        .neq("id", appointmentId)
        .in("status", ["pending", "confirmed"])
        .maybeSingle();

      if (conflictErr) {
        console.error("Erro ao verificar conflito de horário:", conflictErr);
        return {
          success: false,
          error: "Erro ao verificar disponibilidade do horário.",
        };
      }

      if (conflict) {
        return {
          success: false,
          error:
            "Não é possível ativar esta marcação porque o horário já se encontra ocupado por outra consulta ativa.",
        };
      }
    }

    // Perform status update - strictly updating status and updated_at ONLY
    const nowIso = new Date().toISOString();
    const { error: updateErr } = await adminDb
      .from("appointments")
      .update({
        status: newStatus,
        updated_at: nowIso,
      })
      .eq("id", appointmentId);

    if (updateErr) {
      // PostgreSQL 23505 = unique_violation (concurrent collision on idx_unique_active_appointment_slot)
      if (
        updateErr.code === "23505" ||
        updateErr.message?.toLowerCase().includes("unique") ||
        updateErr.message?.toLowerCase().includes("duplicate")
      ) {
        return {
          success: false,
          error:
            "O horário desta marcação acabou de ser ocupado por outra consulta ativa. Não é possível confirmar.",
        };
      }

      console.error("Erro ao atualizar estado da marcação:", {
        code: updateErr.code,
        message: updateErr.message,
      });

      return {
        success: false,
        error:
          "Não foi possível atualizar o estado da marcação. Por favor, tente novamente.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Exceção inesperada em updateAppointmentStatus:", err);
    return {
      success: false,
      error: "Ocorreu um erro inesperado ao atualizar a marcação.",
    };
  }
}
