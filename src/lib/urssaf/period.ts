import { startOfMonth, startOfQuarter, addMonths, addQuarters, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { UrssafPeriodicity } from "@/generated/prisma/enums";

export function getPeriodBounds(periodicity: UrssafPeriodicity, ref: Date) {
  if (periodicity === "MONTHLY") {
    return { start: startOfMonth(ref), end: addMonths(startOfMonth(ref), 1) };
  }
  return { start: startOfQuarter(ref), end: addQuarters(startOfQuarter(ref), 1) };
}

export function shiftPeriod(periodicity: UrssafPeriodicity, ref: Date, direction: 1 | -1) {
  return periodicity === "MONTHLY" ? addMonths(ref, direction) : addQuarters(ref, direction);
}

export function formatPeriodLabel(periodicity: UrssafPeriodicity, ref: Date) {
  if (periodicity === "MONTHLY") {
    return format(ref, "MMMM yyyy", { locale: fr });
  }
  const quarter = Math.floor(ref.getMonth() / 3) + 1;
  return `T${quarter} ${format(ref, "yyyy")}`;
}
