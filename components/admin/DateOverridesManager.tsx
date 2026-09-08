"use client";

import { useState } from "react";
import { FULL_HOUR_SLOTS, type FullHourTimeSlot } from "@/lib/supabase/types";
import type { ModalityOption } from "./WeeklyScheduleManager";

export interface DateOverrideItem {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  isBlockedFullDay: boolean;
  reason?: string;
  slots: Record<FullHourTimeSlot, { enabled: boolean; modality: ModalityOption; isBlockedSlot?: boolean }>;
}

interface DateOverridesManagerProps {
  overrides: DateOverrideItem[];
  onAddOverride: (newOverride: DateOverrideItem) => void;
  onRemoveOverride: (id: string) => void;
}

export default function DateOverridesManager({
  overrides,
  onAddOverride,
  onRemoveOverride,
}: DateOverridesManagerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isBlockedFullDay, setIsBlockedFullDay] = useState<boolean>(true);
  const [reason, setReason] = useState<string>("");
  const [slotStates, setSlotStates] = useState<
    Record<FullHourTimeSlot, { enabled: boolean; modality: ModalityOption; isBlockedSlot?: boolean }>
  >(() => {
    const initial: Record<string, { enabled: boolean; modality: ModalityOption; isBlockedSlot?: boolean }> = {};
    FULL_HOUR_SLOTS.forEach((slot) => {
      initial[slot] = { enabled: false, modality: "presencial", isBlockedSlot: false };
    });
    return initial as Record<FullHourTimeSlot, { enabled: boolean; modality: ModalityOption; isBlockedSlot?: boolean }>;
  });

  const formatDatePT = (isoDate: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleToggleSlot = (slot: FullHourTimeSlot) => {
    setSlotStates((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        enabled: !prev[slot].enabled,
      },
    }));
  };

  const handleModalityChange = (slot: FullHourTimeSlot, modality: ModalityOption) => {
    setSlotStates((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        modality,
      },
    }));
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const newOverride: DateOverrideItem = {
      id: `${selectedDate}-${Date.now()}`,
      date: selectedDate,
      isBlockedFullDay,
      reason: reason.trim() || undefined,
      slots: slotStates,
    };

    onAddOverride(newOverride);

    // Reset form
    setSelectedDate("");
    setIsBlockedFullDay(true);
    setReason("");
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-xl font-bold text-[#1d2a23]">
          Exceções por Data
        </h3>
        <p className="text-xs sm:text-sm text-[#5c6f64] mt-1">
          Adicione exceções para dias específicos, como férias, feriados, ausências ou horários de atendimento extraordinários.
        </p>
      </div>

      {/* Add Exception Form Card */}
      <form
        onSubmit={handleAddException}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-[#d1e3d5] shadow-xs space-y-5"
      >
        <h4 className="text-sm font-bold text-[#1d2a23]">
          Adicionar Nova Exceção por Data
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2">
              Selecione a Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d1e3d5] bg-[#f8faf8] text-xs font-semibold text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40]"
            />
          </div>

          {/* Exception Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2">
              Tipo de Exceção
            </label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsBlockedFullDay(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  isBlockedFullDay
                    ? "bg-red-50 text-red-700 border-red-300"
                    : "bg-white text-[#5c6f64] border-[#d1e3d5]"
                }`}
              >
                Dia Inteiro Indisponível
              </button>
              <button
                type="button"
                onClick={() => setIsBlockedFullDay(false)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  !isBlockedFullDay
                    ? "bg-[#f0f6f2] text-[#2e6f40] border-[#2e6f40]"
                    : "bg-white text-[#5c6f64] border-[#d1e3d5]"
                }`}
              >
                Horário Personalizado
              </button>
            </div>
          </div>
        </div>

        {/* Reason / Note optional field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-1">
            Motivo / Descrição <span className="text-xs font-normal text-[#5c6f64]">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Ex.: Férias, Feriado municipal, Formação"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#d1e3d5] bg-[#f8faf8] text-xs text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40]"
          />
        </div>

        {/* Custom Slot Selection if not full day blocked */}
        {!isBlockedFullDay && (
          <div className="pt-3 border-t border-[#f0f6f2] space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23]">
              Horários Específicos para a Data
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FULL_HOUR_SLOTS.map((slot) => {
                const state = slotStates[slot];
                return (
                  <div
                    key={slot}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                      state.enabled
                        ? "bg-[#f0f6f2] border-[#2e6f40] shadow-2xs"
                        : "bg-[#f8faf8] border-[#d1e3d5]/80 hover:border-[#d1e3d5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleSlot(slot)}
                        className="flex items-center gap-2 text-xs font-bold text-[#1d2a23] cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            state.enabled
                              ? "bg-[#2e6f40] border-[#2e6f40] text-white"
                              : "bg-white border-[#d1e3d5]"
                          }`}
                        >
                          {state.enabled && (
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
                          state.enabled ? "text-[#2e6f40]" : "text-zinc-400"
                        }`}
                      >
                        {state.enabled ? "Disponível" : "Indisponível"}
                      </span>
                    </div>

                    {state.enabled && (
                      <div className="pt-2 border-t border-[#d1e3d5]/60 flex flex-col gap-1.5 min-w-0">
                        <span className="font-semibold text-[#5c6f64] text-[11px]">
                          Modalidade:
                        </span>
                        <div className="flex flex-wrap items-center gap-1 w-full min-w-0">
                          <button
                            type="button"
                            onClick={() => handleModalityChange(slot, "presencial")}
                            className={`flex-1 min-w-[70px] px-2 py-1 rounded-lg text-center font-semibold text-[11px] transition-colors ${
                              state.modality === "presencial"
                                ? "bg-[#2e6f40] text-white shadow-2xs"
                                : "bg-white text-[#5c6f64] hover:bg-[#f0f6f2] border border-[#d1e3d5]/80"
                            }`}
                          >
                            Presencial
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModalityChange(slot, "online")}
                            className={`flex-1 min-w-[54px] px-2 py-1 rounded-lg text-center font-semibold text-[11px] transition-colors ${
                              state.modality === "online"
                                ? "bg-[#2e6f40] text-white shadow-2xs"
                                : "bg-white text-[#5c6f64] hover:bg-[#f0f6f2] border border-[#d1e3d5]/80"
                            }`}
                          >
                            Online
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModalityChange(slot, "ambas")}
                            className={`flex-1 min-w-[50px] px-2 py-1 rounded-lg text-center font-semibold text-[11px] transition-colors ${
                              state.modality === "ambas"
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

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!selectedDate}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedDate
                ? "bg-[#2e6f40] hover:bg-[#245933] text-white shadow-2xs cursor-pointer"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
          >
            Adicionar Exceção
          </button>
        </div>
      </form>

      {/* Active Exceptions List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#1d2a23]">
          Exceções Registadas ({overrides.length})
        </h4>

        {overrides.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-[#d1e3d5] text-center text-xs text-[#5c6f64]">
            Nenhuma exceção por data configurada. O calendário utilizará o horário semanal padrão.
          </div>
        ) : (
          <div className="space-y-2">
            {overrides.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-[#d1e3d5] shadow-2xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1d2a23]">
                      📅 {formatDatePT(item.date)}
                    </span>
                    {item.isBlockedFullDay ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                        Dia Inteiro Bloqueado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0f6f2] text-[#2e6f40] border border-[#d1e3d5]">
                        Horário Personalizado
                      </span>
                    )}
                  </div>
                  {item.reason && (
                    <p className="text-xs text-[#5c6f64] italic">
                      &ldquo;{item.reason}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveOverride(item.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-semibold transition-colors border border-red-200"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
