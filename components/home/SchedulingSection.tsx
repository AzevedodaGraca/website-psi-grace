"use client";

import { useState, useMemo } from "react";

// Types
type AppointmentType = "presencial" | "online";

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
}

const mockTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export default function SchedulingSection() {
  // Stepper state: 1 (Type), 2 (Date & Time), 3 (Patient Info), 4 (Summary), 5 (Confirmed)
  const [step, setStep] = useState<number>(1);

  // Selection states
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Form states
  const [form, setForm] = useState<PatientForm>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

    // Disable weekends (0 = Sun, 6 = Sat)
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    return false;
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    // Don't navigate to months before current month
    if (prev.getFullYear() < today.getFullYear() || (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(4); // Move to Summary step
    }
  };

  const handleConfirmBooking = () => {
    setStep(5); // Move to Success state
  };

  const resetFlow = () => {
    setStep(1);
    setAppointmentType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: "", email: "", phone: "", notes: "" });
    setErrors({});
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
          {/* STEP 1 & 2: Select Appointment Type */}
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
                  onClick={() => setAppointmentType("presencial")}
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
                  onClick={() => setAppointmentType("online")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    appointmentType === "online"
                      ? "border-[#2e6f40] bg-[#f0f6f2] shadow-md"
                      : "border-[#d1e3d5] bg-[#f8faf8] hover:border-[#2e6f40]/50 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">📱</span>
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
                    <span className="inline-block text-xs font-semibold text-[#25D366] mt-1">
                      Via WhatsApp
                    </span>

                    <p className="text-xs sm:text-sm text-[#5c6f64] mt-3 leading-relaxed">
                      Atendimento psicológico online.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#d1e3d5]/60 text-xs font-medium text-[#1d2a23]">
                    💬 Videochamada direta no WhatsApp
                  </div>
                </div>
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

          {/* STEP 3 & 4: Date & Time Selection */}
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
                        : "Consulta Online (Via WhatsApp)"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#2e6f40] hover:underline"
                >
                  Alterar modalidade
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar (Step 3) */}
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
                        className="p-2 text-[#5c6f64] hover:text-[#1d2a23] hover:bg-white rounded-lg transition-colors border border-[#d1e3d5]"
                      >
                        &larr;
                      </button>
                      <button
                        onClick={handleNextMonth}
                        aria-label="Mês seguinte"
                        className="p-2 text-[#5c6f64] hover:text-[#1d2a23] hover:bg-white rounded-lg transition-colors border border-[#d1e3d5]"
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
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null); // Reset time when date changes
                          }}
                          className={`h-10 text-xs font-semibold rounded-xl transition-all flex items-center justify-center ${
                            isSelected
                              ? "bg-[#2e6f40] text-white shadow-md scale-105"
                              : disabled
                              ? "bg-transparent text-zinc-300 cursor-not-allowed"
                              : "bg-white text-[#1d2a23] border border-[#d1e3d5] hover:border-[#2e6f40] hover:text-[#2e6f40]"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots (Step 4) */}
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

                        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                          {mockTimeSlots.map((time) => {
                            const isTimeSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
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
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23]"
                    >
                      &larr; Voltar
                    </button>
                    <button
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

          {/* STEP 5: Patient Information Form */}
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2">
                    Telefone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2">
                    Observação <span className="text-xs font-normal text-[#5c6f64]">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Alguma nota ou esclarecimento adicional que deseje partilhar..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#d1e3d5] bg-[#f8faf8] text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40]"
                  />
                </div>
              </div>

              {/* Step 3 Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f0f6f2]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23]"
                >
                  &larr; Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2e6f40] hover:bg-[#245933] text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
                >
                  Revisar Marcação &rarr;
                </button>
              </div>
            </form>
          )}

          {/* STEP 6: Appointment Summary */}
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
                        : "Consulta Online (Via WhatsApp)"}
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

              {/* Step 4 Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f0f6f2]">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23]"
                >
                  &larr; Alterar Informações
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="px-6 py-3 bg-[#2e6f40] hover:bg-[#245933] text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                >
                  Confirmar marcação
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Confirmation / Success State */}
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
                    {appointmentType === "presencial" ? "Presencial (Ovar)" : "Online (WhatsApp)"}
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
                  className="px-6 py-3 bg-[#1d2a23] hover:bg-[#2e6f40] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
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
