"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { FULL_HOUR_SLOTS, type FullHourTimeSlot } from "@/lib/supabase/types";
import AdminHeader from "@/components/admin/AdminHeader";
import WeeklyScheduleManager, {
  WEEKDAYS,
  type DayScheduleState,
  type ModalityOption,
} from "@/components/admin/WeeklyScheduleManager";
import DateOverridesManager, {
  type DateOverrideItem,
} from "@/components/admin/DateOverridesManager";
import { syncAdminUser } from "@/app/admin/actions";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Availability State
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<number, DayScheduleState>
  >(() => {
    const initial: Record<number, DayScheduleState> = {};
    WEEKDAYS.forEach(({ dayOfWeek, name }) => {
      const slotsState: Record<string, { enabled: boolean; modality: ModalityOption }> = {};
      FULL_HOUR_SLOTS.forEach((slot) => {
        slotsState[slot] = { enabled: false, modality: "presencial" };
      });
      initial[dayOfWeek] = {
        dayOfWeek,
        dayName: name,
        isActive: false,
        slots: slotsState as Record<FullHourTimeSlot, { enabled: boolean; modality: ModalityOption }>,
      };
    });
    return initial;
  });

  const [dateOverrides, setDateOverrides] = useState<DateOverrideItem[]>([]);

  // Feedback notifications
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const [isSaving, setIsSaving] = useState(false);

  // Load Availability from Supabase
  const loadAvailability = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase.from("availability_schedules") as any)
        .select("*");

      if (error) {
        console.error("Erro ao carregar disponibilidade:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setSaveStatus({
          type: "error",
          message: "Não foi possível carregar as disponibilidades da base de dados.",
        });
        setIsLoading(false);
        return;
      }

      const rows = data as unknown as import("@/lib/supabase/types").AvailabilitySchedule[] | null;

      if (rows && rows.length > 0) {
        // Reset base weekly state template
        const newWeeklyState: Record<number, DayScheduleState> = {};
        WEEKDAYS.forEach(({ dayOfWeek, name }) => {
          const slotsState: Record<string, { enabled: boolean; modality: ModalityOption }> = {};
          FULL_HOUR_SLOTS.forEach((slot) => {
            slotsState[slot] = { enabled: false, modality: "presencial" };
          });
          newWeeklyState[dayOfWeek] = {
            dayOfWeek,
            dayName: name,
            isActive: false,
            slots: slotsState as Record<FullHourTimeSlot, { enabled: boolean; modality: ModalityOption }>,
          };
        });

        const loadedOverridesMap: Record<string, DateOverrideItem> = {};

        // Parse DB rows
        rows.forEach((row) => {
          // 1. Weekly schedule rows
          if (row.day_of_week !== null && row.day_of_week !== undefined) {
            const dow = row.day_of_week;
            const slot = row.time_slot as FullHourTimeSlot;
            if (newWeeklyState[dow] && FULL_HOUR_SLOTS.includes(slot)) {
              newWeeklyState[dow].isActive = true;
              const currentSlot = newWeeklyState[dow].slots[slot];
              if (!currentSlot.enabled) {
                currentSlot.enabled = true;
                currentSlot.modality = row.appointment_type as ModalityOption;
              } else if (currentSlot.modality !== row.appointment_type) {
                currentSlot.modality = "ambas";
              }
            }
          }

          // 2. Date override rows
          if (row.schedule_date) {
            const dateStr = row.schedule_date;
            if (!loadedOverridesMap[dateStr]) {
              const emptySlots: Record<string, { enabled: boolean; modality: ModalityOption }> = {};
              FULL_HOUR_SLOTS.forEach((s) => {
                emptySlots[s] = { enabled: false, modality: "presencial" };
              });
              loadedOverridesMap[dateStr] = {
                id: dateStr,
                date: dateStr,
                isBlockedFullDay: row.is_blocked,
                slots: emptySlots as Record<FullHourTimeSlot, { enabled: boolean; modality: ModalityOption }>,
              };
            }

            if (row.is_blocked) {
              loadedOverridesMap[dateStr].isBlockedFullDay = true;
            } else {
              const slot = row.time_slot as FullHourTimeSlot;
              if (FULL_HOUR_SLOTS.includes(slot)) {
                const target = loadedOverridesMap[dateStr].slots[slot];
                target.enabled = true;
                target.modality = row.appointment_type as ModalityOption;
              }
            }
          }
        });

        setWeeklySchedule(newWeeklyState);
        setDateOverrides(Object.values(loadedOverridesMap));
      }
    } catch (err) {
      console.error("Erro inesperado ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auth Verification & Initial Fetch
  useEffect(() => {
    async function checkAuthAndFetch() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      setUser(user);
      const syncResult = await syncAdminUser();
      if (!syncResult.success) {
        console.error("Erro na sincronização do administrador:", syncResult.error);
        setSaveStatus({
          type: "error",
          message: "Não foi possível confirmar as permissões administrativas na base de dados.",
        });
        setIsLoading(false);
        return;
      }

      await loadAvailability();
    }

    checkAuthAndFetch();
  }, [router, loadAvailability]);

  // Logout Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  // Weekly Schedule Handlers
  const handleUpdateDay = (dayOfWeek: number, updatedDay: DayScheduleState) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayOfWeek]: updatedDay,
    }));
  };

  // Date Override Handlers
  const handleAddOverride = (newOverride: DateOverrideItem) => {
    setDateOverrides((prev) => [
      ...prev.filter((o) => o.date !== newOverride.date),
      newOverride,
    ]);
  };

  const handleRemoveOverride = (id: string) => {
    setDateOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  // Save All Changes to Supabase
  const handleSaveSchedule = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: null });

    try {
      const supabase = createClient();
      const rowsToInsert: {
        day_of_week?: number | null;
        schedule_date?: string | null;
        appointment_type: "presencial" | "online";
        time_slot: FullHourTimeSlot;
        is_blocked: boolean;
      }[] = [];

      // 1. Build weekly schedule rows
      Object.values(weeklySchedule).forEach((dayState) => {
        if (dayState.isActive) {
          FULL_HOUR_SLOTS.forEach((slot) => {
            const slotState = dayState.slots[slot];
            if (slotState.enabled) {
              if (slotState.modality === "presencial" || slotState.modality === "ambas") {
                rowsToInsert.push({
                  day_of_week: dayState.dayOfWeek,
                  schedule_date: null,
                  appointment_type: "presencial",
                  time_slot: slot,
                  is_blocked: false,
                });
              }
              if (slotState.modality === "online" || slotState.modality === "ambas") {
                rowsToInsert.push({
                  day_of_week: dayState.dayOfWeek,
                  schedule_date: null,
                  appointment_type: "online",
                  time_slot: slot,
                  is_blocked: false,
                });
              }
            }
          });
        }
      });

      // 2. Build date override rows
      dateOverrides.forEach((override) => {
        if (override.isBlockedFullDay) {
          rowsToInsert.push({
            day_of_week: null,
            schedule_date: override.date,
            appointment_type: "presencial",
            time_slot: "09:00",
            is_blocked: true,
          });
        } else {
          FULL_HOUR_SLOTS.forEach((slot) => {
            const slotState = override.slots[slot];
            if (slotState && slotState.enabled) {
              if (slotState.modality === "presencial" || slotState.modality === "ambas") {
                rowsToInsert.push({
                  day_of_week: null,
                  schedule_date: override.date,
                  appointment_type: "presencial",
                  time_slot: slot,
                  is_blocked: false,
                });
              }
              if (slotState.modality === "online" || slotState.modality === "ambas") {
                rowsToInsert.push({
                  day_of_week: null,
                  schedule_date: override.date,
                  appointment_type: "online",
                  time_slot: slot,
                  is_blocked: false,
                });
              }
            }
          });
        }
      });

      // 3. Clear old records and insert new ones
      const { error: deleteError } = await (supabase.from("availability_schedules") as any)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        console.error("Erro ao apagar registos antigos:", {
          message: deleteError.message,
          code: deleteError.code,
          details: deleteError.details,
          hint: deleteError.hint,
        });
        setSaveStatus({
          type: "error",
          message: "Não foi possível guardar as alterações. Tente novamente.",
        });
        setIsSaving(false);
        return;
      }

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await (supabase.from("availability_schedules") as any)
          .insert(rowsToInsert);

        if (insertError) {
          console.error("Erro ao inserir novos registos:", {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });
          setSaveStatus({
            type: "error",
            message: "Não foi possível guardar as alterações. Tente novamente.",
          });
          setIsSaving(false);
          return;
        }
      }

      setSaveStatus({
        type: "success",
        message: "Alterações guardadas com sucesso.",
      });
    } catch (err) {
      console.error("Erro no processo de guardado:", err);
      setSaveStatus({
        type: "error",
        message: "Não foi possível guardar as alterações. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#2e6f40] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#5c6f64]">
            A carregar disponibilidade...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col font-sans">
      {/* Administrative Header */}
      <AdminHeader
        userEmail={user?.email}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Title Bar & Main Save Action */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d1e3d5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-2">
              Gestão de Consultas
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1d2a23]">
              Gestão de Disponibilidade
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6f64] mt-1">
              Configure a sua agenda semanal e gerie exceções ou bloqueios para a consulta presencial em Ovar e online.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSaveSchedule}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#2e6f40] hover:bg-[#245933] active:bg-[#1d4628] text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>A guardar...</span>
                </>
              ) : (
                <span>Guardar alterações</span>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Notifications */}
        {saveStatus.type && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-2xs ${
              saveStatus.type === "success"
                ? "bg-[#f0f6f2] border-[#2e6f40] text-[#2e6f40]"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <span className="text-base">
              {saveStatus.type === "success" ? "✓" : "⚠️"}
            </span>
            <span>{saveStatus.message}</span>
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Weekly Schedule Manager Column */}
          <div className="lg:col-span-7">
            <WeeklyScheduleManager
              schedule={weeklySchedule}
              onUpdateDay={handleUpdateDay}
            />
          </div>

          {/* Date Overrides & Exceptions Column */}
          <div className="lg:col-span-5">
            <DateOverridesManager
              overrides={dateOverrides}
              onAddOverride={handleAddOverride}
              onRemoveOverride={handleRemoveOverride}
            />
          </div>
        </div>

        {/* Bottom Save Action Floating / Footer Bar */}
        <div className="pt-6 border-t border-[#d1e3d5]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#5c6f64]">
            As alterações guardadas serão aplicadas imediatamente à base de dados de disponibilidade em Supabase.
          </p>

          <button
            onClick={handleSaveSchedule}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-[#2e6f40] hover:bg-[#245933] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </main>
    </div>
  );
}
