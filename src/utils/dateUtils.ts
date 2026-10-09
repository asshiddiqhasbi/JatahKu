/**
 * Safe and zero-dependency Date helpers for budget cycles and transactions.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculates calendar days between two YYYY-MM-DD dates inclusive.
 * e.g., Sept 1 to Sept 30 = 30 days.
 */
export function getInclusiveDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Adds a specific number of inclusive days to a starting date string (YYYY-MM-DD).
 * e.g., starting 2026-10-01 with 30 inclusive days returns 2026-10-30.
 */
export function addDaysToDate(startDateStr: string, daysInclusive: number): string {
  if (!startDateStr) return '';
  const [year, month, day] = startDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + (daysInclusive - 1));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns remaining days from a reference date (defaults to today) until endDate, inclusive of reference day.
 */
export function getRemainingDays(endDateStr: string, fromDateStr = getTodayDateString()): number {
  const from = parseDate(fromDateStr);
  const end = parseDate(endDateStr);
  const diffTime = end.getTime() - from.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  // If fromDate is beyond endDate, remaining days is 1 (avoid divide by zero)
  return Math.max(1, diffDays + 1);
}

/**
 * Returns number of days passed since startDate up to reference date.
 */
export function getDaysPassed(startDateStr: string, fromDateStr = getTodayDateString()): number {
  const start = parseDate(startDateStr);
  const from = parseDate(fromDateStr);
  const diffTime = from.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Format date to human-readable Indonesian label.
 */
export function formatDisplayDate(dateStr: string): string {
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) {
    return 'Hari Ini';
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) {
    return 'Kemarin';
  }

  const target = parseDate(dateStr);
  return target.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatFullDate(dateStr: string): string {
  const target = parseDate(dateStr);
  return target.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const target = parseDate(dateStr);
  return target.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
