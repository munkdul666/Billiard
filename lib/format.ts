import type { BillingMode } from "./types";

// Мөнгөн дүн ₮ форматлах
export function formatMNT(amount: number): string {
  return new Intl.NumberFormat("mn-MN").format(Math.round(amount)) + "₮";
}

// Секундийг HH:MM:SS болгох
export function formatDuration(totalSeconds: number): string {
  const neg = totalSeconds < 0;
  const s = Math.abs(Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${neg ? "-" : ""}${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export function elapsedSeconds(startedAt: string): number {
  return (Date.now() - new Date(startedAt).getTime()) / 1000;
}

// Ширээний цэнэ. open: өнгөрсөн цаг × тариф.
// fixed: тогтсон цаг × тариф (суурь), хэтэрвэл илүү цагийг нэмж тооцно.
export function calcCharge(
  startedAt: string,
  hourlyRate: number,
  billingMode: BillingMode = "open",
  plannedMinutes: number | null = null
): number {
  const elapsedHours = elapsedSeconds(startedAt) / 3600;

  if (billingMode === "fixed" && plannedMinutes) {
    const plannedHours = plannedMinutes / 60;
    const base = plannedHours * hourlyRate;
    const overtimeHours = Math.max(0, elapsedHours - plannedHours);
    return base + overtimeHours * hourlyRate;
  }

  return elapsedHours * hourlyRate;
}

// fixed багцад үлдсэн секунд (сөрөг бол хэтэрсэн = overtime)
export function remainingSeconds(
  startedAt: string,
  plannedMinutes: number
): number {
  return plannedMinutes * 60 - elapsedSeconds(startedAt);
}
