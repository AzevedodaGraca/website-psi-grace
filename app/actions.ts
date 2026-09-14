"use server";

export {
  bookAppointment,
  createAppointmentBooking,
  getAvailableSlots,
  getMonthSchedule,
  type CreateAppointmentInput,
  type BookingActionResult,
  type AvailableSlotsResult,
  type MonthScheduleResult,
} from "./booking/actions";
