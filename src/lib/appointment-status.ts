import type { AppointmentStatus } from "@/types/database";

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  no_show: "No-show",
};

export const STATUS_VARIANT: Record<
  AppointmentStatus,
  "warning" | "success" | "muted" | "danger"
> = {
  pending: "warning",
  confirmed: "success",
  completed: "muted",
  cancelled: "danger",
  no_show: "danger",
};
