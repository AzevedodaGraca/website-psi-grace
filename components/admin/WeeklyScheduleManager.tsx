"use client";

import { FULL_HOUR_SLOTS, type FullHourTimeSlot } from "@/lib/supabase/types";

export type ModalityOption = "presencial" | "online" | "ambas";

export interface SlotState {
  enabled: boolean;
  modality: ModalityOption;
}

export interface DayScheduleState {
  dayOfWeek: number; // 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb, 0 = Dom
  dayName: string;
  isActive: boolean;
  slots: Record<FullHourTimeSlot, SlotState>;
}

interface WeeklyScheduleManagerProps {
  schedule: Record<number, DayScheduleState>;
  onUpdateDay: (dayOfWeek: number, updatedDay: DayScheduleState) => void;
}

export const WEEKDAYS = [
  { dayOfWeek: 1, name: "Segunda-feira" },
  { dayOfWeek: 2, name: "Terça-feira" },
  { dayOfWeek: 3, name: "Quarta-feira" },
  { dayOfWeek: 4, name: "Quinta-feira" },
  { dayOfWeek: 5, name: "Sexta-feira" },
  { dayOfWeek: 6, name: "Sábado" },
  { dayOfWeek: 0, name: "Domingo" },
];

export default function WeeklyScheduleManager({
  schedule,
  onUpdateDay,
}: WeeklyScheduleManagerProps) {
  const handleToggleDayActive = (dayOfWeek: number) => {
    const current = schedule[dayOfWeek];
    onUpdateDay(dayOfWeek, {
      ...current,
      isActive: !current.isActive,
    });
  };

  const handleToggleSlot = (dayOfWeek: number, slot: FullHourTimeSlot) => {
    const current = schedule[dayOfWeek];
    const slotState = current.slots[slot];
    const updatedSlots = {
      ...current.slots,
      [slot]: {
        ...slotState,
        enabled: !slotState.enabled,
      },
    };
    onUpdateDay(dayOfWeek, {
      ...current,
      slots: updatedSlots,
    });
  };

  const handleModalityChange = (
    dayOfWeek: number,
    slot: FullHourTimeSlot,
    modality: ModalityOption
  ) => {
    const current = schedule[dayOfWeek];
    const slotState = current.slots[slot];
    const updatedSlots = {
      ...current.slots,
      [slot]: {
        ...slotState,
        modality,
      },
    };
    onUpdateDay(dayOfWeek, {
      ...current,
      slots: updatedSlots,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-xl font-bold text-[#1d2a23]">
          Disponibilidade Semanal
        </h3>
        <p className="text-xs sm:text-sm text-[#5c6f64] mt-1">
          Defina os dias e os horários de consulta recorrentes para o atendimento no gabinete em Ovar e online.
        </p>
      </div>

      <div className="space-y-4">
        {WEEKDAYS.map(({ dayOfWeek, name }) => {
          const dayState = schedule[dayOfWeek];
          if (!dayState) return null;

          const activeCount = Object.values(dayState.slots).filter(
            (s) => s.enabled
          ).length;

          return (
            <div
              key={dayOfWeek}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                dayState.isActive
                  ? "bg-white border-[#d1e3d5] shadow-xs"
                  : "bg-[#f8faf8] border-[#d1e3d5]/60 opacity-80"
              }`}
            >
              {/* Day Header Bar */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-[#f0f6f2]">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-[#1d2a23]">
                    {name}
                  </span>
                  {dayState.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f0f6f2] text-[#2e6f40] border border-[#d1e3d5]">
                      {activeCount} {activeCount === 1 ? "horário" : "horários"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200">
                      Dia Inativo
                    </span>
                  )}
                </div>

                {/* Day Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleDayActive(dayOfWeek)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dayState.isActive
                      ? "bg-[#2e6f40] text-white shadow-xs"
                      : "bg-white text-[#5c6f64] border border-[#d1e3d5] hover:text-[#1d2a23]"
                  }`}
                >
                  {dayState.isActive ? "Ativo" : "Ativar Dia"}
                </button>
              </div>

              {/* Time Slots Grid (Visible when day is active) */}
              {dayState.isActive && (
                <div className="p-4 sm:p-5 bg-white space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {FULL_HOUR_SLOTS.map((slot) => {
                      const slotState = dayState.slots[slot];
                      const isSelected = slotState.enabled;

                      return (
                        <div
                          key={slot}
                          className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? "bg-[#f0f6f2] border-[#2e6f40] shadow-2xs"
                              : "bg-[#f8faf8] border-[#d1e3d5]/80 hover:border-[#d1e3d5]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleToggleSlot(dayOfWeek, slot)}
                              className="flex items-center gap-2 text-xs font-bold text-[#1d2a23] cursor-pointer"
                            >
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-[#2e6f40] border-[#2e6f40] text-white"
                                    : "bg-white border-[#d1e3d5]"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 stroke-current"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span>{slot}</span>
                            </button>

                            <span
                              className={`text-[10px] font-semibold ${
                                isSelected ? "text-[#2e6f40]" : "text-zinc-400"
                              }`}
                            >
                              {isSelected ? "Disponível" : "Indisponível"}
                            </span>
                          </div>

                          {/* Modality Selector (Presencial / Online / Ambas) */}
                          {isSelected && (
                            <div className="pt-2 border-t border-[#d1e3d5]/60 flex flex-col gap-1.5 min-w-0">
                              <span className="font-semibold text-[#5c6f64] text-[11px]">
                                Modalidade:
                              </span>
                              <div className="flex flex-wrap items-center gap-1 w-full min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModalityChange(
                                      dayOfWeek,
                                      slot,
                                      "presencial"
                                    )
                                  }
                                  className={`flex-1 min-w-[70px] px-2 py-1 rounded-lg text-center font-semibold text-[11px] transition-colors ${
                                    slotState.modality === "presencial"
                                      ? "bg-[#2e6f40] text-white shadow-2xs"
                                      : "bg-white text-[#5c6f64] hover:bg-[#f0f6f2] border border-[#d1e3d5]/80"
                                  }`}
                                >
                                  Presencial
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModalityChange(
                                      dayOfWeek,
                                      slot,
                                      "online"
                                    )
                                  }
                                  className={`flex-1 min-w-[54px] px-2 py-1 rounded-lg text-center font-semibold text-[11px] transition-colors ${
                                    slotState.modality === "online"
                                      ? "bg-[#2e6f40] text-white shadow-2xs"
                                      : "bg-white text-[#5c6f64] hover:bg-[#f0f6f2] border border-[#d1e3d5]/80"
                                  }`}
                                >
                                  Online
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModalityChange(
                                      dayOfWeek,
                                      slot,
                                      "ambas"
                                    )
                                  }
                                  className={`flex-1 min-w-[50px] px-2 py-1 rounded-lg text-center font-semibold text-[11px] transition-colors ${
                                    slotState.modality === "ambas"
                                      ? "bg-[#2e6f40] text-white shadow-2xs"
                                      : "bg-white text-[#5c6f64] hover:bg-[#f0f6f2] border border-[#d1e3d5]/80"
                                  }`}
                                >
                                  Ambas
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
