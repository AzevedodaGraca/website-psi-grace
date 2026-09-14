// TypeScript definitions for Phase 7 Backend & Database Layer

export type AppointmentType = "presencial" | "online";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

// Standard 1-hour time slots used for consultations in Ovar, Portugal
export type FullHourTimeSlot =
  | "09:00"
  | "10:00"
  | "11:00"
  | "12:00"
  | "14:00"
  | "15:00"
  | "16:00"
  | "17:00"
  | "18:00"
  | "19:00"
  | "20:00";

export const FULL_HOUR_SLOTS: FullHourTimeSlot[] = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export type Appointment = {
  id: string;
  appointment_type: AppointmentType;
  appointment_date: string; // ISO Date 'YYYY-MM-DD'
  time_slot: FullHourTimeSlot;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_notes?: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
};

export type AvailabilitySchedule = {
  id: string;
  schedule_date?: string | null; // ISO Date 'YYYY-MM-DD' if specific date override
  day_of_week?: number | null; // 0-6 (Sun-Sat) if recurring weekly schedule
  appointment_type: AppointmentType;
  time_slot: FullHourTimeSlot;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  user_id?: string | null;
  email?: string | null;
  created_at: string;
};

// Database Schema interface for Supabase Client
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Appointment, "id">>;
        Relationships: [];
      };
      availability_schedules: {
        Row: AvailabilitySchedule;
        Insert: Omit<AvailabilitySchedule, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AvailabilitySchedule, "id">>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AdminUser, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
