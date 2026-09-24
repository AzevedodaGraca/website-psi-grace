"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/lib/supabase/types";
import {
  getAdminAppointments,
  updateAppointmentStatus,
} from "@/app/admin/actions";

interface AppointmentsManagerProps {
  initialAppointments?: Appointment[];
}

export default function AppointmentsManager({
  initialAppointments,
}: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialAppointments);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Status update tracking
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<"todas" | AppointmentStatus>("todas");
  const [modalityFilter, setModalityFilter] = useState<"todas" | AppointmentType>("todas");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detail Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch appointments on mount asynchronously
  useEffect(() => {
    let isMounted = true;

    getAdminAppointments()
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setAppointments(res.appointments);
        } else {
          setLoadError(
            res.error ||
              "Não foi possível carregar as marcações. Por favor, tente novamente."
          );
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Erro ao obter marcações:", err);
        setLoadError(
          "Não foi possível carregar as marcações. Por favor, tente novamente."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual refresh callback
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getAdminAppointments();
      if (res.success) {
        setAppointments(res.appointments);
      } else {
        setLoadError(
          res.error ||
            "Não foi possível carregar as marcações. Por favor, tente novamente."
        );
      }
    } catch (err) {
      console.error("Erro ao obter marcações:", err);
      setLoadError(
        "Não foi possível carregar as marcações. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle status update
  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    if (updatingId) return; // Prevent duplicate clicks
    setUpdatingId(appointmentId);
    setActionFeedback(null);

    try {
      const res = await updateAppointmentStatus(appointmentId, newStatus);
      if (res.success) {
        // Update locally without losing filters
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  status: newStatus,
                  updated_at: new Date().toISOString(),
                }
              : apt
          )
        );

        // Also update selected modal appointment if open
        setSelectedAppointment((prev) =>
          prev && prev.id === appointmentId
            ? { ...prev, status: newStatus, updated_at: new Date().toISOString() }
            : prev
        );

        const statusLabels: Record<AppointmentStatus, string> = {
          pending: "Pendente",
          confirmed: "Confirmada",
          cancelled: "Cancelada",
        };

        setActionFeedback({
          type: "success",
          message: `Estado da marcação atualizado para "${statusLabels[newStatus]}" com sucesso.`,
        });
      } else {
        setActionFeedback({
          type: "error",
          message: res.error || "Não foi possível atualizar o estado da marcação. Por favor, tente novamente.",
        });
      }
    } catch (err) {
      console.error("Erro ao alterar estado:", err);
      setActionFeedback({
        type: "error",
        message: "Não foi possível atualizar o estado da marcação. Por favor, tente novamente.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter((a) => a.status === "confirmed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    return { total, pending, confirmed, cancelled };
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (statusFilter !== "todas" && apt.status !== statusFilter) {
        return false;
      }
      // Modality filter
      if (modalityFilter !== "todas" && apt.appointment_type !== modalityFilter) {
        return false;
      }
      // Date filter
      if (dateFilter && apt.appointment_date !== dateFilter) {
        return false;
      }
      // Search query (name, email, phone)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = apt.patient_name.toLowerCase().includes(query);
        const emailMatch = apt.patient_email.toLowerCase().includes(query);
        const phoneMatch = apt.patient_phone.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, statusFilter, modalityFilter, dateFilter, searchQuery]);

  // Helper date formatting in PT-PT
  const formatIsoDateToPt = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("pt-PT", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTimePt = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Pendente
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0f6f2] text-[#2e6f40] border border-[#d1e3d5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e6f40] mr-1.5" />
            Confirmada
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mr-1.5" />
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header & Refresh */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d1e3d5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-2">
            Gestão Clínica
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1d2a23]">
            Marcações de Consultas
          </h2>
          <p className="text-xs sm:text-sm text-[#5c6f64] mt-1">
            Consulte as solicitações de consulta dos utentes, acompanhe detalhes e faça a gestão dos respetivos estados.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading || Boolean(updatingId)}
            className="px-4 py-2.5 text-xs font-semibold text-[#2e6f40] bg-[#f0f6f2] hover:bg-[#e4efe7] border border-[#d1e3d5] rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-[#2e6f40] border-t-transparent rounded-full animate-spin" />
                <span>A atualizar...</span>
              </>
            ) : (
              <>
                <span>↻</span>
                <span>Atualizar lista</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d1e3d5] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#5c6f64] uppercase block">
            Total Marcações
          </span>
          <span className="text-2xl font-bold text-[#1d2a23] mt-1 block">
            {metrics.total}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase block">
            Pendentes
          </span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {metrics.pending}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d1e3d5] bg-[#f0f6f2]/30 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#2e6f40] uppercase block">
            Confirmadas
          </span>
          <span className="text-2xl font-bold text-[#2e6f40] mt-1 block">
            {metrics.confirmed}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase block">
            Canceladas
          </span>
          <span className="text-2xl font-bold text-zinc-600 mt-1 block">
            {metrics.cancelled}
          </span>
        </div>
      </div>

      {/* Action Feedback Notification */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs ${
            actionFeedback.type === "success"
              ? "bg-[#f0f6f2] border-[#2e6f40] text-[#2e6f40]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">
              {actionFeedback.type === "success" ? "✓" : "⚠️"}
            </span>
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs underline hover:opacity-75 cursor-pointer ml-4"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#d1e3d5] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
          {/* Status Filter */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#1d2a23] uppercase mb-1.5">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "todas" | AppointmentStatus)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-[#d1e3d5] bg-white text-[#1d2a23] focus:outline-none focus:border-[#2e6f40]"
            >
              <option value="todas">Todas as marcações</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {/* Modality Filter */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#1d2a23] uppercase mb-1.5">
              Modalidade
            </label>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value as "todas" | AppointmentType)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-[#d1e3d5] bg-white text-[#1d2a23] focus:outline-none focus:border-[#2e6f40]"
            >
              <option value="todas">Todas as modalidades</option>
              <option value="presencial">Presencial (Ovar)</option>
              <option value="online">Consulta Online</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#1d2a23] uppercase mb-1.5">
              Data Específica
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-[#d1e3d5] bg-white text-[#1d2a23] focus:outline-none focus:border-[#2e6f40]"
            />
          </div>

          {/* Search Query */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#1d2a23] uppercase mb-1.5">
              Pesquisar Utente
            </label>
            <input
              type="text"
              placeholder="Nome, e-mail ou telemóvel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-[#d1e3d5] bg-white text-[#1d2a23] focus:outline-none focus:border-[#2e6f40]"
            />
          </div>
        </div>

        {/* Active Filters Clear Shortcut */}
        {(statusFilter !== "todas" ||
          modalityFilter !== "todas" ||
          dateFilter !== "" ||
          searchQuery !== "") && (
          <div className="pt-2 flex items-center justify-between border-t border-[#f0f6f2] text-xs">
            <span className="text-[#5c6f64]">
              A apresentar {filteredAppointments.length} de {appointments.length} marcações.
            </span>
            <button
              onClick={() => {
                setStatusFilter("todas");
                setModalityFilter("todas");
                setDateFilter("");
                setSearchQuery("");
              }}
              className="text-[#2e6f40] font-semibold hover:underline cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl border border-[#d1e3d5] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#5c6f64] flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-3 border-[#2e6f40] border-t-transparent rounded-full animate-spin" />
            <span>A carregar marcações da base de dados...</span>
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3">
            <span className="text-2xl block">⚠️</span>
            <p className="text-sm font-semibold text-red-700">{loadError}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2e6f40] hover:bg-[#245933] rounded-xl transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="text-3xl block">📋</span>
            <p className="text-sm font-bold text-[#1d2a23]">
              {appointments.length === 0
                ? "Nenhuma marcação encontrada."
                : "Não existem marcações para os filtros selecionados."}
            </p>
            {appointments.length > 0 && (
              <p className="text-xs text-[#5c6f64]">
                Tente ajustar os filtros acima para visualizar outros registos.
              </p>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1d2a23]">
                <thead className="bg-[#f8faf8] border-b border-[#d1e3d5] text-[11px] font-bold uppercase text-[#5c6f64] tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">
                      Data & Hora
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Utente
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Modalidade
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Contacto
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Estado
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1e3d5]/60">
                  {filteredAppointments.map((apt) => {
                    const isUpdating = updatingId === apt.id;
                    return (
                      <tr
                        key={apt.id}
                        className="hover:bg-[#f8faf8]/80 transition-colors"
                      >
                        {/* Data & Hora */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-bold block text-sm text-[#1d2a23]">
                            {apt.time_slot}
                          </span>
                          <span className="text-xs text-[#5c6f64] block">
                            {formatIsoDateToPt(apt.appointment_date)}
                          </span>
                        </td>

                        {/* Utente */}
                        <td className="py-4 px-4">
                          <span className="font-semibold block text-sm text-[#1d2a23]">
                            {apt.patient_name}
                          </span>
                          {apt.patient_notes && (
                            <span className="text-[11px] text-[#5c6f64] italic block truncate max-w-[200px]" title={apt.patient_notes}>
                              &ldquo;{apt.patient_notes}&rdquo;
                            </span>
                          )}
                        </td>

                        {/* Modalidade */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {apt.appointment_type === "presencial" ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-[#1d2a23]">
                              <span>🏢</span>
                              <span>Presencial</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-medium text-[#2e6f40]">
                              <span>💻</span>
                              <span>Online</span>
                            </span>
                          )}
                        </td>

                        {/* Contactos */}
                        <td className="py-4 px-4">
                          <a
                            href={`tel:${apt.patient_phone}`}
                            className="font-medium text-[#1d2a23] hover:text-[#2e6f40] block"
                          >
                            {apt.patient_phone}
                          </a>
                          <a
                            href={`mailto:${apt.patient_email}`}
                            className="text-[#5c6f64] hover:text-[#2e6f40] block truncate max-w-[180px]"
                            title={apt.patient_email}
                          >
                            {apt.patient_email}
                          </a>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {renderStatusBadge(apt.status)}
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                          {/* Detalhes */}
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(apt)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#d1e3d5] bg-white hover:bg-[#f0f6f2] text-[#1d2a23] transition-colors cursor-pointer"
                          >
                            Ver detalhes
                          </button>

                          {/* Confirm Button */}
                          {apt.status !== "confirmed" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(apt.id, "confirmed")}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2e6f40] hover:bg-[#245933] text-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? "..." : apt.status === "cancelled" ? "Reativar" : "Confirmar"}
                            </button>
                          )}

                          {/* Cancel Button */}
                          {apt.status !== "cancelled" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(apt.id, "cancelled")}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? "..." : "Cancelar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="block md:hidden divide-y divide-[#d1e3d5]/60">
              {filteredAppointments.map((apt) => {
                const isUpdating = updatingId === apt.id;
                return (
                  <div key={apt.id} className="p-4 space-y-3">
                    {/* Header: Date, Time & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-[#1d2a23]">
                            {apt.time_slot}
                          </span>
                          <span className="text-xs text-[#5c6f64]">
                            • {formatIsoDateToPt(apt.appointment_date)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#1d2a23] mt-0.5 block">
                          {apt.appointment_type === "presencial" ? "🏢 Presencial (Ovar)" : "💻 Consulta Online"}
                        </span>
                      </div>
                      <div>{renderStatusBadge(apt.status)}</div>
                    </div>

                    {/* Patient Info */}
                    <div className="bg-[#f8faf8] p-3 rounded-xl border border-[#d1e3d5]/70 text-xs space-y-1">
                      <div className="font-semibold text-[#1d2a23]">
                        {apt.patient_name}
                      </div>
                      <div className="text-[#5c6f64]">
                        <span>📞 </span>
                        <a href={`tel:${apt.patient_phone}`} className="hover:underline">
                          {apt.patient_phone}
                        </a>
                      </div>
                      <div className="text-[#5c6f64] truncate">
                        <span>✉️ </span>
                        <a href={`mailto:${apt.patient_email}`} className="hover:underline">
                          {apt.patient_email}
                        </a>
                      </div>
                      {apt.patient_notes && (
                        <div className="text-[11px] text-[#5c6f64] italic pt-1 border-t border-[#d1e3d5]/50">
                          &ldquo;{apt.patient_notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(apt)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#d1e3d5] bg-white text-[#1d2a23] cursor-pointer"
                      >
                        Detalhes
                      </button>

                      {apt.status !== "confirmed" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(apt.id, "confirmed")}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2e6f40] text-white cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? "..." : apt.status === "cancelled" ? "Reativar" : "Confirmar"}
                        </button>
                      )}

                      {apt.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(apt.id, "cancelled")}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? "..." : "Cancelar"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#d1e3d5] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#d1e3d5]/60 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#5c6f64] tracking-wider block">
                  Detalhes da Marcação
                </span>
                <h3 className="text-xl font-bold text-[#1d2a23] mt-1">
                  {selectedAppointment.patient_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-zinc-400 hover:text-[#1d2a23] text-xl font-bold p-1 cursor-pointer"
                aria-label="Fechar janela"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Info */}
            <div className="space-y-4 text-xs">
              {/* Status Row */}
              <div className="flex items-center justify-between p-3 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]/70">
                <span className="font-semibold text-[#5c6f64]">Estado Atual:</span>
                <div>{renderStatusBadge(selectedAppointment.status)}</div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]/70">
                <div>
                  <span className="font-semibold text-[#5c6f64] block">Data:</span>
                  <span className="font-bold text-sm text-[#1d2a23]">
                    {formatIsoDateToPt(selectedAppointment.appointment_date)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[#5c6f64] block">Horário:</span>
                  <span className="font-bold text-sm text-[#2e6f40]">
                    {selectedAppointment.time_slot}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#d1e3d5]/50">
                  <span className="font-semibold text-[#5c6f64] block">Modalidade:</span>
                  <span className="font-bold text-[#1d2a23]">
                    {selectedAppointment.appointment_type === "presencial"
                      ? "Consulta Presencial (Gabinete em Ovar: Rua de Timor, 67 – 1.º H)"
                      : "Consulta Online"}
                  </span>
                </div>
              </div>

              {/* Patient Contact Info */}
              <div className="space-y-2 p-3 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]/70">
                <span className="font-bold uppercase text-[11px] text-[#5c6f64] block">
                  Dados de Contacto
                </span>
                <div className="flex justify-between">
                  <span className="text-[#5c6f64]">Telemóvel / WhatsApp:</span>
                  <div className="space-x-2 text-right">
                    <a
                      href={`tel:${selectedAppointment.patient_phone}`}
                      className="font-semibold text-[#2e6f40] hover:underline"
                    >
                      {selectedAppointment.patient_phone}
                    </a>
                    <a
                      href={`https://wa.me/${selectedAppointment.patient_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#25D366] font-bold hover:underline"
                    >
                      (Abrir WhatsApp)
                    </a>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c6f64]">E-mail:</span>
                  <a
                    href={`mailto:${selectedAppointment.patient_email}`}
                    className="font-semibold text-[#2e6f40] hover:underline"
                  >
                    {selectedAppointment.patient_email}
                  </a>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.patient_notes && (
                <div className="p-3 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]/70">
                  <span className="font-bold uppercase text-[11px] text-[#5c6f64] block mb-1">
                    Observações do Utente
                  </span>
                  <p className="italic text-[#1d2a23] leading-relaxed">
                    &ldquo;{selectedAppointment.patient_notes}&rdquo;
                  </p>
                </div>
              )}

              {/* Meta information */}
              <div className="text-[11px] text-[#5c6f64] space-y-1 pt-1">
                <div>
                  Marcação registada em: {formatDateTimePt(selectedAppointment.created_at)}
                </div>
                {selectedAppointment.updated_at && (
                  <div>
                    Última atualização: {formatDateTimePt(selectedAppointment.updated_at)}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#d1e3d5]/60">
              <div className="space-x-2">
                {selectedAppointment.status !== "confirmed" && (
                  <button
                    type="button"
                    disabled={updatingId === selectedAppointment.id}
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "confirmed")
                    }
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2e6f40] hover:bg-[#245933] text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {selectedAppointment.status === "cancelled" ? "Reativar Consulta" : "Confirmar Consulta"}
                  </button>
                )}

                {selectedAppointment.status !== "cancelled" && (
                  <button
                    type="button"
                    disabled={updatingId === selectedAppointment.id}
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "cancelled")
                    }
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancelar Consulta
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5c6f64] hover:text-[#1d2a23] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
