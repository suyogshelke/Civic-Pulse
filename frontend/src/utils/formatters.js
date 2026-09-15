/** Display formatting helpers. Pure functions, no dependencies. */

const DATE_OPTS = { day: '2-digit', month: 'short', year: 'numeric' };
const TIME_OPTS = { hour: '2-digit', minute: '2-digit', hour12: true };

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', DATE_OPTS);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', DATE_OPTS)}, ${d.toLocaleTimeString('en-IN', TIME_OPTS)}`;
}

/** "3 days ago", "in 2 hours" — used across timelines and activity feeds. */
export function timeAgo(value) {
  if (!value) return '—';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '—';
  const diff = Date.now() - then;
  const future = diff < 0;
  const abs = Math.abs(diff);

  const units = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ];

  for (const [name, ms] of units) {
    const n = Math.floor(abs / ms);
    if (n >= 1) {
      const plural = n === 1 ? name : `${name}s`;
      return future ? `in ${n} ${plural}` : `${n} ${plural} ago`;
    }
  }
  return 'just now';
}

/** Whole days between two dates, rounded down. */
export function daysBetween(from, to = new Date()) {
  if (!from) return 0;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.floor((b - a) / 86400000));
}

/** CIV-2026-000123 — human-quotable public reference number. */
export function formatTicket(id, createdAt) {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `CIV-${year}-${String(id).padStart(6, '0')}`;
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
}

export function truncate(text = '', max = 90) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/** ENUM_VALUE -> "Enum value" fallback for any label we have not mapped. */
export function humanise(value = '') {
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function percent(part, total, digits = 0) {
  if (!total) return `0%`;
  return `${((part / total) * 100).toFixed(digits)}%`;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n ?? 0);
}
