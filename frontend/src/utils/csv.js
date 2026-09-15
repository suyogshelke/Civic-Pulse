/**
 * Tiny CSV helpers for the admin reporting screen.
 * No external dependency — builds RFC-4180-safe CSV and triggers a download.
 */

const escape = (v) => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Build a CSV string.
 * @param {Array<object>} rows
 * @param {Array<{key:string,label:string,value?:(row)=>any}>} columns
 */
export function toCsv(rows, columns) {
  const header = columns.map((c) => escape(c.label)).join(',');
  const body = (rows || [])
    .map((row) => columns.map((c) => escape(c.value ? c.value(row) : row[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

/** Trigger a browser download of the given CSV text. */
export function downloadCsv(filename, csv) {
  // Prepend a BOM so Excel reads UTF-8 correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
