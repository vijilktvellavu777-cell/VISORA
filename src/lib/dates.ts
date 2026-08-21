const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string) {
  return ISO_DATE_RE.test(value);
}

/** Parse yyyy-MM-dd as local calendar date (avoids UTC timezone shifts). */
export function parseIsoDateLocal(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Format a Date as yyyy-MM-dd in local time. */
export function formatIsoDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addLocalDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Keep range values valid for <input type="date"> and enforce from <= to. */
export function normalizeDateRange(from?: string, to?: string) {
  const today = startOfLocalDay(new Date());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  let start = from && isIsoDate(from) ? parseIsoDateLocal(from) : monthStart;
  let end = to && isIsoDate(to) ? parseIsoDateLocal(to) : today;

  if (Number.isNaN(start.getTime())) start = monthStart;
  if (Number.isNaN(end.getTime())) end = today;

  if (start > end) {
    const earlier = end;
    end = start;
    start = earlier;
  }

  return {
    from: formatIsoDateLocal(start),
    to: formatIsoDateLocal(end),
  };
}
