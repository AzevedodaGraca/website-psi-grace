"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  bookAppointment,
  getAvailableSlots,
  getMonthSchedule,
  type MonthScheduleResult,
} from "@/app/booking/actions";
import type { AppointmentType, FullHourTimeSlot } from "@/lib/supabase/types";

// Types
interface PatientForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  consent?: string;
}

function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WHATSAPP_OBSERVATION_URL = `https://wa.me/351926362033?text=${encodeURIComponent(
  "Olá! O meu melhor horário para a consulta está indisponível. Gostaria de saber se existe possibilidade de encontrar outro horário. Obrigado(a)!"
)}`;

export default function SchedulingSection() {
  // Stepper state: 1 (Type), 2 (Date & Time), 3 (Patient Info), 4 (Summary), 5 (Confirmed)
  const [step, setStep] = useState<number>(1);

  // Selection states
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Real availability states from Supabase
  const [monthSchedule, setMonthSchedule] = useState<MonthScheduleResult | null>(null);
  const [availableSlots, setAvailableSlots] = useState<FullHourTimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState<PatientForm>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load monthly availability schedule whenever currentMonth or appointmentType changes
  useEffect(() => {
    if (!appointmentType) return;
    let isMounted = true;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    getMonthSchedule(year, month, appointmentType)
      .then((res) => {
        if (isMounted && res.success) {
          setMonthSchedule(res);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar calendário do mês:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentMonth, appointmentType]);

  // Load available time slots when user selects a date
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (!appointmentType) return;

    setIsLoadingSlots(true);
    setSlotsError(null);

    const dateStr = formatDateToIso(date);

    getAvailableSlots(dateStr, appointmentType)
      .then((res) => {
        if (res.success) {
          setAvailableSlots(res.slots);
          if (res.slots.length === 0) {
            if (res.isBlockedDate) {
              setSlotsError("O consultório encontra-se encerrado na data selecionada.");
            } else {
              setSlotsError("Não existem horários disponíveis para a data selecionada.");
            }
          }
        } else {
          setSlotsError(res.error || "Não foi possível carregar os horários disponíveis.");
        }
        setIsLoadingSlots(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar horários disponíveis:", err);
        setSlotsError("Erro ao comunicar com o servidor. Por favor, tente novamente.");
        setIsLoadingSlots(false);
      });
  };

  // Switch modality and reset dependent date/time selections
  const handleSelectModality = (type: AppointmentType) => {
    if (type !== appointmentType) {
      setAppointmentType(type);
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableSlots([]);
      setSlotsError(null);
    }
  };

  // Helper date calculations for Calendar
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get day of week (0 = Sun, 1 = Mon, ..., 6 = Sat). Shift so Monday is 0.
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: (Date | null)[] = [];

    // Empty padding days before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    const monthName = currentMonth.toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }, [currentMonth]);

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) return true;

    // Use real database availability schedule if available
    if (monthSchedule && monthSchedule.success) {
      const isoDate = formatDateToIso(date);

      // 1. Explicitly blocked date in override
      if (monthSchedule.blockedDates.includes(isoDate)) {
        return true;
      }

      // 2. Specific override with active slots
      if (monthSchedule.datesWithOverrides[isoDate] === true) {
        return false;
      }

      // 3. Weekly recurring days check
      const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      if (!monthSchedule.activeDaysOfWeek.includes(day)) {
        return true;
      }

      return false;
    }

    // Fallback while loading: disable past dates and weekends (0 = Sun, 6 = Sat)
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    return false;
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    // Don't navigate to months before current month
    if (
      prev.getFullYear() < today.getFullYear() ||
      (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())
    ) {
      return;
    }
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Por favor, introduza o seu nome completo.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Por favor, introduza o seu e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Por favor, introduza um e-mail válido.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Por favor, introduza o seu número de telemóvel / WhatsApp.";
    }
    if (!consentGiven) {
      newErrors.consent = "É necessário aceitar a Política de Privacidade para prosseguir com a marcação.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitError(null);
      setStep(4); // Move to Summary step
    }
  };

  const handleConfirmBooking = async () => {
    if (!appointmentType || !selectedDate || !selectedTime) {
      setSubmitError("Por favor, selecione a modalidade, data e horário da consulta.");
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setSubmitError("Por favor, preencha os seus dados de contacto.");
      return;
    }
    if (!consentGiven) {
      setSubmitError("É necessário aceitar a Política de Privacidade para registar o seu pedido de marcação.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await bookAppointment({
        appointment_type: appointmentType,
        appointment_date: formatDateToIso(selectedDate),
        time_slot: selectedTime,
        patient_name: form.name,
        patient_email: form.email,
        patient_phone: form.phone,
        patient_notes: form.notes || undefined,
        consent_given: consentGiven,
      });

      if (result.success) {
        setStep(5); // Move to Success state
      } else {
        setSubmitError(
          result.error ||
            "Não foi possível registar o seu pedido de marcação. Por favor, tente novamente."
        );
      }
    } catch (err) {
      console.error("Erro na confirmação da marcação:", err);
      setSubmitError(
        "Ocorreu um erro inesperado ao comunicar com o servidor. Por favor, tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setAppointmentType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: "", email: "", phone: "", notes: "" });
    setConsentGiven(false);
    setErrors({});
    setSubmitError(null);
    setAvailableSlots([]);
    setSlotsError(null);
    // Scroll smoothly to start of section
    const elem = document.getElementById("marcacao");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="marcacao" className="py-20 sm:py-28 bg-[#f8faf8] border-t border-[#d1e3d5]/60 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step 1 Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-white px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Marcação Online
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Marque a sua consulta
          </h2>
          <p className="mt-3 text-base text-[#5c6f64]">
            Escolha a modalidade de atendimento que melhor se adapta às suas necessidades.
          </p>
        </div>

        {/* Stepper Progress Bar (Only visible before confirmation) */}
        {step < 5 && (
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5c6f64] mb-2">
              <span className={step >= 1 ? "text-[#2e6f40]" : ""}>1. Modalidade</span>
              <span className={step >= 2 ? "text-[#2e6f40]" : ""}>2. Data & Hora</span>
              <span className={step >= 3 ? "text-[#2e6f40]" : ""}>3. Seus Dados</span>
              <span className={step >= 4 ? "text-[#2e6f40]" : ""}>4. Resumo</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#d1e3d5]">
              <div
                className="h-full bg-[#2e6f40] transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-[#d1e3d5] shadow-lg p-6 sm:p-10 transition-all duration-300">
          {/* STEP 1: Select Appointment Type */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-[#1d2a23]">
                  Selecione o Tipo de Atendimento
                </h3>
                <p className="text-sm text-[#5c6f64] mt-1">
                  Selecione se prefere atendimento presencial no gabinete em Ovar ou atendimento online.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Option Presencial */}
                <div
                  onClick={() => handleSelectModality("presencial")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    appointmentType === "presencial"
                      ? "border-[#2e6f40] bg-[#f0f6f2] shadow-md"
                      : "border-[#d1e3d5] bg-[#f8faf8] hover:border-[#2e6f40]/50 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">🏢</span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          appointmentType === "presencial"
                            ? "border-[#2e6f40] bg-[#2e6f40]"
                            : "border-[#d1e3d5]"
                        }`}
                      >
                        {appointmentType === "presencial" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-[#1d2a23]">
                      Consulta Presencial
                    </h4>
                    <span className="inline-block text-xs font-semibold text-[#2e6f40] mt-1">
                      Gabinete em Ovar
                    </span>

                    <p className="text-xs sm:text-sm text-[#5c6f64] mt-3 leading-relaxed">
                      Atendimento presencial no gabinete.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#d1e3d5]/60 text-xs font-medium text-[#1d2a23]">
                    📍 Rua de Timor, 67 – 1.º H, Ovar
                  </div>
                </div>

                {/* Option Online */}
                <div
                  onClick={() => handleSelectModality("online")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    appointmentType === "online"
                      ? "border-[#2e6f40] bg-[#f0f6f2] shadow-md"
                      : "border-[#d1e3d5] bg-[#f8faf8] hover:border-[#2e6f40]/50 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">💻</span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          appointmentType === "online"
                            ? "border-[#2e6f40] bg-[#2e6f40]"
                            : "border-[#d1e3d5]"
                        }`}
                      >
                        {appointmentType === "online" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-[#1d2a23]">
                      Consulta Online
                    </h4>
                    <span className="inline-block text-xs font-semibold text-[#2e6f40] mt-1">
                      Videochamada
                    </span>

                    <p className="text-xs sm:text-sm text-[#5c6f64] mt-3 leading-relaxed">
                      Atendimento psicológico online.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#d1e3d5]/60 text-xs font-medium text-[#1d2a23]">
                    💻 Plataforma a combinar previamente com o utente
                  </div>
                </div>
              </div>

              {/* Observation Notice */}
              <div className="p-4 rounded-xl bg-[#f8faf8] border border-[#d1e3d5] text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
                <span className="font-semibold text-[#1d2a23]">Observação:</span> Podem ocorrer cancelamentos e trocas de horários entre os utentes. Caso o seu melhor horário esteja indisponível, entre em contacto via{" "}
                <a
                  href={WHATSAPP_OBSERVATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#2e6f40] hover:text-[#245933] underline underline-offset-2 decoration-[#2e6f40]/40 hover:decoration-[#2e6f40] transition-colors"
                >
                  WhatsApp
                </a>
                .
              </div>

              {/* Step 1 Action Button */}
              <div className="flex justify-end pt-4 border-t border-[#f0f6f2]">
                <button
                  disabled={!appointmentType}
                  onClick={() => setStep(2)}
                  className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all shadow-xs ${
                    appointmentType
                      ? "bg-[#2e6f40] hover:bg-[#245933] text-white cursor-pointer"
                      : "bg-[#d1e3d5] text-[#5c6f64] cursor-not-allowed opacity-60"
                  }`}
                >
                  Continuar para Data & Hora &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#1d2a23]">
                    Selecione a Data e Horário
                  </h3>
                  <p className="text-sm text-[#5c6f64] mt-1">
                    Modalidade escolhida:{" "}
                    <span className="font-semibold text-[#2e6f40]">
                      {appointmentType === "presencial"
                        ? "Consulta Presencial (Gabinete em Ovar)"
                        : "Consulta Online"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#2e6f40] hover:underline cursor-pointer"
                >
                  Alterar modalidade
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-7 bg-[#f8faf8] p-5 sm:p-6 rounded-2xl border border-[#d1e3d5]">
                  {/* Month header */}
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-base font-bold text-[#1d2a23]">
                      {monthLabel}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevMonth}
                        aria-label="Mês anterior"
                        className="p-2 text-[#5c6f64] hover:text-[#1d2a23] hover:bg-white rounded-lg transition-colors border border-[#d1e3d5] cursor-pointer"
                      >
                        &larr;
                      </button>
                      <button
                        onClick={handleNextMonth}
                        aria-label="Mês seguinte"
                        className="p-2 text-[#5c6f64] hover:text-[#1d2a23] hover:bg-white rounded-lg transition-colors border border-[#d1e3d5] cursor-pointer"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Days of week header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#5c6f64] mb-2">
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span className="text-zinc-400">Sáb</span>
                    <span className="text-zinc-400">Dom</span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} className="h-10" />;
                      }

                      const disabled = isDateDisabled(date);
                      const isSelected =
                        selectedDate &&
                        selectedDate.toDateString() === date.toDateString();

                      return (
                        <button
                          key={date.toISOString()}
                          disabled={disabled}
                          onClick={() => handleSelectDate(date)}
                          className={`h-10 text-xs font-semibold rounded-xl transition-all flex items-center justify-center ${
                            isSelected
                              ? "bg-[#2e6f40] text-white shadow-md scale-105"
                              : disabled
                              ? "bg-transparent text-zinc-300 cursor-not-allowed"
                              : "bg-white text-[#1d2a23] border border-[#d1e3d5] hover:border-[#2e6f40] hover:text-[#2e6f40] cursor-pointer"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#1d2a23] mb-3">
                      Horários Disponíveis
                    </h4>

                    {selectedDate ? (
                      <div>
                        <p className="text-xs text-[#5c6f64] mb-4">
                          Data selecionada:{" "}
                          <span className="font-semibold text-[#1d2a23]">
                            {selectedDate.toLocaleDateString("pt-PT", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </p>

                        {isLoadingSlots ? (
                          <div className="py-8 text-center text-xs text-[#5c6f64] flex flex-col items-center justify-center gap-2">
                            <span className="inline-block w-5 h-5 border-2 border-[#2e6f40] border-t-transparent rounded-full animate-spin" />
                            <span>A verificar horários disponíveis...</span>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {availableSlots.map((time) => {
                              const isTimeSelected = selectedTime === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setSelectedTime(time)}
                                  className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                    isTimeSelected
                                      ? "bg-[#2e6f40] text-white border-[#2e6f40] shadow-xs"
                                      : "bg-white text-[#1d2a23] border-[#d1e3d5] hover:border-[#2e6f40] hover:text-[#2e6f40]"
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-6 bg-[#f8faf8] rounded-2xl border border-[#d1e3d5] text-center text-xs text-[#5c6f64] space-y-1">
                            <p className="font-semibold text-[#1d2a23]">
                              {slotsError || "Sem horários disponíveis"}
                            </p>
                            <p className="text-[11px]">
                              Por favor, selecione outro dia no calendário para verificar a disponibilidade.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 bg-[#f8faf8] rounded-2xl border border-[#d1e3d5] text-center text-xs text-[#5c6f64]">
                        👉 Por favor, selecione primeiro um dia no calendário ao lado para ver os horários disponíveis.
                      </div>
                    )}
                  </div>

                  {/* Step 2 Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#f0f6f2]">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23] cursor-pointer"
                    >
                      &larr; Voltar
                    </button>
                    <button
                      type="button"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(3)}
                      className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all shadow-xs ${
                        selectedDate && selectedTime
                          ? "bg-[#2e6f40] hover:bg-[#245933] text-white cursor-pointer"
                          : "bg-[#d1e3d5] text-[#5c6f64] cursor-not-allowed opacity-60"
                      }`}
                    >
                      Continuar para os Seus Dados &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information Form */}
          {step === 3 && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1d2a23]">
                  Seus Dados de Contacto
                </h3>
                <p className="text-sm text-[#5c6f64] mt-1">
                  Introduza a sua informação pessoal para a marcação da consulta.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nome completo */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-name"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2"
                  >
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    placeholder="Ex.: Maria Santos Silva"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${
                      errors.name ? "border-red-500 bg-red-50/30" : "border-[#d1e3d5] bg-[#f8faf8]"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2"
                  >
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    placeholder="Ex.: maria@exemplo.pt"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${
                      errors.email ? "border-red-500 bg-red-50/30" : "border-[#d1e3d5] bg-[#f8faf8]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2"
                  >
                    Telefone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    placeholder="Ex.: +351 912 345 678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${
                      errors.phone ? "border-red-500 bg-red-50/30" : "border-[#d1e3d5] bg-[#f8faf8]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Observações */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-notes"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2"
                  >
                    Observação <span className="text-xs font-normal text-[#5c6f64]">(opcional)</span>
                  </label>
                  <textarea
                    id="booking-notes"
                    rows={3}
                    placeholder="Alguma nota ou esclarecimento adicional que deseje partilhar..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#d1e3d5] bg-[#f8faf8] text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40]"
                  />
                  <p className="text-xs text-[#5c6f64] mt-1.5 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-[#2e6f40] shrink-0 font-bold">ℹ️</span>
                    <span>Para proteger a sua privacidade, evite indicar detalhes clínicos sensíveis neste campo durante o pedido de marcação.</span>
                  </p>
                </div>

                {/* Consentimento RGPD */}
                <div className="sm:col-span-2 pt-2 border-t border-[#f0f6f2]">
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => {
                        setConsentGiven(e.target.checked);
                        if (e.target.checked && errors.consent) {
                          setErrors((prev) => ({ ...prev, consent: undefined }));
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-[#d1e3d5] text-[#2e6f40] focus:ring-[#2e6f40] cursor-pointer shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-[#1d2a23] leading-relaxed">
                      Li e aceito a{" "}
                      <Link
                        href="/privacidade"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#2e6f40] hover:underline cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Política de Privacidade
                      </Link>{" "}
                      e autorizo o tratamento dos meus dados para efeitos de gestão do pedido de marcação e comunicação relacionada com a consulta.{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-red-500 mt-1.5 pl-7">{errors.consent}</p>
                  )}
                </div>
              </div>

              {/* Step 3 Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f0f6f2]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23] cursor-pointer"
                >
                  &larr; Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2e6f40] hover:bg-[#245933] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Revisar Marcação &rarr;
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Appointment Summary */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1d2a23]">
                  Resumo da Solicitação de Consulta
                </h3>
                <p className="text-sm text-[#5c6f64] mt-1">
                  Por favor, verifique os dados antes de confirmar a solicitação.
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-[#f8faf8] p-6 rounded-2xl border border-[#d1e3d5] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#d1e3d5]">
                  <div>
                    <span className="text-xs font-semibold text-[#5c6f64] uppercase block">
                      Modalidade
                    </span>
                    <span className="text-sm font-bold text-[#1d2a23]">
                      {appointmentType === "presencial"
                        ? "Consulta Presencial (Gabinete em Ovar)"
                        : "Consulta Online"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#5c6f64] uppercase block">
                      Data & Horário
                    </span>
                    <span className="text-sm font-bold text-[#2e6f40]">
                      {selectedDate?.toLocaleDateString("pt-PT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      às {selectedTime}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-[#5c6f64] uppercase block">
                      Nome do Utente
                    </span>
                    <span className="text-sm font-semibold text-[#1d2a23]">
                      {form.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#5c6f64] uppercase block">
                      Contactos
                    </span>
                    <span className="text-sm text-[#1d2a23] block">
                      {form.phone}
                    </span>
                    <span className="text-xs text-[#5c6f64] block">
                      {form.email}
                    </span>
                  </div>
                </div>

                {form.notes && (
                  <div className="pt-3 border-t border-[#d1e3d5]">
                    <span className="text-xs font-semibold text-[#5c6f64] uppercase block mb-1">
                      Observação
                    </span>
                    <p className="text-xs text-[#1d2a23] italic">
                      &ldquo;{form.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Informação discreta de conformidade no Passo 4 */}
              <div className="p-3.5 bg-[#f0f6f2] rounded-xl border border-[#d1e3d5] text-xs text-[#5c6f64] flex items-center gap-2">
                <span className="text-[#2e6f40] text-sm shrink-0">🔒</span>
                <span>
                  O seu pedido será submetido de acordo com a{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#2e6f40] hover:underline"
                  >
                    Política de Privacidade
                  </Link>{" "}
                  aceite.
                </span>
              </div>

              {/* Error message banner if booking submission fails */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                  <span className="text-base leading-none">⚠️</span>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{submitError}</p>
                    {(submitError.toLowerCase().includes("reservado") ||
                      submitError.toLowerCase().includes("disponível") ||
                      submitError.toLowerCase().includes("passou")) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitError(null);
                          setSelectedTime(null);
                          setStep(2);
                        }}
                        className="inline-flex items-center font-bold text-[#2e6f40] hover:underline cursor-pointer"
                      >
                        &larr; Voltar à seleção de data e horário
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4 Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f0f6f2]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setSubmitError(null);
                    setStep(3);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23] cursor-pointer"
                >
                  &larr; Alterar Informações
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className={`px-6 py-3 bg-[#2e6f40] hover:bg-[#245933] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>A registar marcação...</span>
                    </>
                  ) : (
                    <span>Confirmar marcação</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Confirmation / Success State */}
          {step === 5 && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#f0f6f2] text-[#2e6f40] border-2 border-[#2e6f40] flex items-center justify-center mx-auto text-2xl animate-bounce">
                ✓
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-[#1d2a23]">
                  Pedido de marcação enviado
                </h3>
                <p className="text-sm text-[#5c6f64] leading-relaxed">
                  Obrigado pelo seu contacto. A sua solicitação de consulta foi registada.
                </p>
              </div>

              {/* Confirmed Summary Card */}
              <div className="max-w-md mx-auto bg-[#f8faf8] p-5 rounded-2xl border border-[#d1e3d5] text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-[#d1e3d5] pb-2">
                  <span className="font-semibold text-[#5c6f64]">Modalidade:</span>
                  <span className="font-bold text-[#1d2a23]">
                    {appointmentType === "presencial" ? "Presencial (Ovar)" : "Online"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d1e3d5] pb-2">
                  <span className="font-semibold text-[#5c6f64]">Data e Hora:</span>
                  <span className="font-bold text-[#2e6f40]">
                    {selectedDate?.toLocaleDateString("pt-PT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    às {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#5c6f64]">Utente:</span>
                  <span className="font-bold text-[#1d2a23]">{form.name}</span>
                </div>
              </div>

              <p className="text-xs font-semibold text-[#2e6f40] bg-[#f0f6f2] py-2 px-4 rounded-xl inline-block">
                Entraremos em contacto para confirmar a sua marcação.
              </p>

              <div className="pt-4">
                <button
                  onClick={resetFlow}
                  className="px-6 py-3 bg-[#1d2a23] hover:bg-[#2e6f40] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Voltar ao início
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
