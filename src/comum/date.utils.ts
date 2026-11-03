const MILLISECONDS_PER_DAY = 86_400_000;

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const time = Date.parse(isoDate) + days * MILLISECONDS_PER_DAY;
  return new Date(time).toISOString().slice(0, 10);
}

export function daysBetween(start: string, end: string): number {
  return (Date.parse(end) - Date.parse(start)) / MILLISECONDS_PER_DAY;
}
