/**
 * Admin formatting helpers: Gregorian dates and Latin digits only (never Hijri / Arabic-Indic digits).
 */
const pad = (n: number) => String(n).padStart(2, '0');

const toDate = (d: string | number | Date | undefined | null): Date | null => {
  if (d === undefined || d === null || d === '') return null;
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
};

/** 2026-10-27 */
export const fmtDate = (d?: string | number | Date | null) => {
  const dt = toDate(d);
  return dt ? `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` : '-';
};

/** 14:05 */
export const fmtTime = (d?: string | number | Date | null) => {
  const dt = toDate(d);
  return dt ? `${pad(dt.getHours())}:${pad(dt.getMinutes())}` : '-';
};

/** 2026-10-27 14:05 */
export const fmtDateTime = (d?: string | number | Date | null) => {
  const dt = toDate(d);
  return dt ? `${fmtDate(dt)} ${fmtTime(dt)}` : '-';
};

/** 12,500 */
export const fmtNum = (n?: number | null) => (n === undefined || n === null || isNaN(Number(n)) ? '-' : Number(n).toLocaleString('en-US'));

/** $1,250.5 */
export const fmtMoney = (n?: number | null) =>
  n === undefined || n === null || isNaN(Number(n))
    ? '-'
    : `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/** 0:38 */
export const fmtDuration = (sec?: number | null) => {
  if (sec === undefined || sec === null) return '-';
  return `${Math.floor(sec / 60)}:${pad(Math.round(sec % 60))}`;
};
