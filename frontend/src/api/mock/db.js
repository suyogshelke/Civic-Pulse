/**
 * In-memory database for the mock backend.
 *
 * State is held in a module-level object and persisted to localStorage so a
 * demo survives page reloads. Calling resetDb() restores the deterministic
 * seed — handy for screenshots or starting a viva from a known state.
 */

import { freshSeed } from '../../data/seed';

const STORAGE_KEY = 'civicpulse.db.v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage and fall back to seed */
  }
  return freshSeed();
}

let db = load();

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage may be full or unavailable; the app still works in-memory */
  }
}

export function getDb() {
  return db;
}

export function resetDb() {
  db = freshSeed();
  persist();
  return db;
}

/** Monotonic id generator that stays ahead of any seeded id. */
export function nextId(collection) {
  const items = db[collection] || [];
  return items.reduce((max, item) => Math.max(max, item.id || 0), 1000) + 1;
}
