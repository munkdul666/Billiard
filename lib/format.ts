// Мөнгөн дүн ₮ форматлах
export function formatMNT(amount: number): string {
  return new Intl.NumberFormat("mn-MN").format(Math.round(amount)) + "₮";
}

// Секундийг HH:MM:SS болгох
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

// Эхэлсэн цагнаас хойших ширээний цэнэ (тариф нь цагийн үнэ)
export function calcTableCharge(startedAt: string, hourlyRate: number): number {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const hours = elapsedMs / 1000 / 3600;
  return hours * hourlyRate;
}

export function elapsedSeconds(startedAt: string): number {
  return (Date.now() - new Date(startedAt).getTime()) / 1000;
}
