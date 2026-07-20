import { addDays, format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function addDaysToToday(days: number): Date {
  return addDays(new Date(), days);
}

export function formatDate(date: Date, lang: "FR" | "EN" = "FR"): string {
  return format(date, "d MMMM yyyy", { locale: lang === "FR" ? fr : enUS });
}
