/**
 * Central domain constants for Civic-Pulse.
 *
 * Every enum here mirrors the corresponding Java enum in the Spring Boot
 * backend (com.mitwpu.civicpulse.enums), so the same string values travel
 * over the REST API without any translation layer.
 */

/* ------------------------------------------------------------------ roles */

export const ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  CITIZEN: 'Citizen',
  OFFICER: 'Officer',
  ADMIN: 'Administrator',
};

/** Landing route for each role immediately after a successful login. */
export const ROLE_HOME = {
  CITIZEN: '/citizen/dashboard',
  OFFICER: '/officer/dashboard',
  ADMIN: '/admin/dashboard',
};

/* --------------------------------------------------------- complaint status */

export const STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
};

/**
 * Presentation metadata for each status.
 * `step` drives the progress tracker in the complaint timeline; terminal
 * branches such as REJECTED carry a step of -1 so they sit outside the
 * happy-path ladder described in section 9.4 of the synopsis.
 */
export const STATUS_META = {
  SUBMITTED: { label: 'Submitted', variant: 'secondary', icon: 'bi-inbox', step: 1 },
  UNDER_REVIEW: { label: 'Under Review', variant: 'info', icon: 'bi-search', step: 2 },
  ASSIGNED: { label: 'Assigned', variant: 'primary', icon: 'bi-person-check', step: 3 },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning', icon: 'bi-gear-wide-connected', step: 4 },
  RESOLVED: { label: 'Resolved', variant: 'success', icon: 'bi-check2-circle', step: 5 },
  CLOSED: { label: 'Closed', variant: 'dark', icon: 'bi-archive', step: 6 },
  REJECTED: { label: 'Rejected', variant: 'danger', icon: 'bi-x-octagon', step: -1 },
};

/** The six-stage happy path from synopsis section 9.4. */
export const STATUS_LADDER = [
  STATUS.SUBMITTED,
  STATUS.UNDER_REVIEW,
  STATUS.ASSIGNED,
  STATUS.IN_PROGRESS,
  STATUS.RESOLVED,
  STATUS.CLOSED,
];

/**
 * Explicit state machine. A complaint may only move to a status listed
 * against its current status — this is enforced in the service layer so the
 * UI can never push an illegal transition to the API.
 */
export const STATUS_TRANSITIONS = {
  SUBMITTED: [STATUS.UNDER_REVIEW, STATUS.REJECTED],
  UNDER_REVIEW: [STATUS.ASSIGNED, STATUS.REJECTED],
  ASSIGNED: [STATUS.IN_PROGRESS, STATUS.REJECTED],
  IN_PROGRESS: [STATUS.RESOLVED],
  RESOLVED: [STATUS.CLOSED, STATUS.IN_PROGRESS],
  CLOSED: [],
  REJECTED: [],
};

export const OPEN_STATUSES = [
  STATUS.SUBMITTED,
  STATUS.UNDER_REVIEW,
  STATUS.ASSIGNED,
  STATUS.IN_PROGRESS,
];

export const isOpenStatus = (status) => OPEN_STATUSES.includes(status);
export const isTerminalStatus = (status) => status === STATUS.CLOSED || status === STATUS.REJECTED;
export const canTransition = (from, to) => (STATUS_TRANSITIONS[from] || []).includes(to);
export const nextStatuses = (from) => STATUS_TRANSITIONS[from] || [];

/* ------------------------------------------------------------------ priority */

export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const PRIORITY_META = {
  LOW: { label: 'Low', variant: 'success', icon: 'bi-arrow-down', slaDays: 15, weight: 1 },
  MEDIUM: { label: 'Medium', variant: 'info', icon: 'bi-dash', slaDays: 10, weight: 2 },
  HIGH: { label: 'High', variant: 'warning', icon: 'bi-arrow-up', slaDays: 5, weight: 3 },
  CRITICAL: { label: 'Critical', variant: 'danger', icon: 'bi-exclamation-triangle', slaDays: 2, weight: 4 },
};

/* ----------------------------------------------------------------- category */

/**
 * Civic issue categories. `department` is the default routing target used by
 * the auto-assignment rule engine, which stands in for the AI-based
 * categorisation listed under Future Scope in the synopsis.
 */
export const CATEGORIES = {
  POTHOLE: { label: 'Pothole / Road Damage', icon: 'bi-cone-striped', department: 'Public Works' },
  GARBAGE: { label: 'Garbage Accumulation', icon: 'bi-trash3', department: 'Sanitation' },
  WATER_LEAKAGE: { label: 'Water Leakage', icon: 'bi-droplet-half', department: 'Water Supply' },
  WATER_SUPPLY: { label: 'Water Supply Shortage', icon: 'bi-moisture', department: 'Water Supply' },
  DRAINAGE: { label: 'Drainage / Sewage', icon: 'bi-water', department: 'Drainage' },
  ELECTRICITY: { label: 'Electricity Failure', icon: 'bi-lightning-charge', department: 'Electricity' },
  STREETLIGHT: { label: 'Damaged Streetlight', icon: 'bi-lightbulb', department: 'Electricity' },
  TRAFFIC: { label: 'Traffic / Signal Issue', icon: 'bi-traffic-light', department: 'Roads & Transport' },
  ENCROACHMENT: { label: 'Illegal Encroachment', icon: 'bi-sign-no-parking', department: 'Public Works' },
  STRAY_ANIMALS: { label: 'Stray Animal Menace', icon: 'bi-bug', department: 'Sanitation' },
  NOISE: { label: 'Noise Pollution', icon: 'bi-volume-up', department: 'Sanitation' },
  OTHER: { label: 'Other Civic Issue', icon: 'bi-three-dots', department: 'Public Works' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

/* --------------------------------------------------------------- geography */

/** Municipal wards used for location tagging and ward-wise analytics. */
export const WARDS = [
  'Ward 1 — Kothrud',
  'Ward 2 — Karve Nagar',
  'Ward 3 — Warje',
  'Ward 4 — Erandwane',
  'Ward 5 — Shivajinagar',
  'Ward 6 — Kondhwa',
  'Ward 7 — Hadapsar',
  'Ward 8 — Aundh',
];

export const CITY = 'Pune';
export const STATE = 'Maharashtra';

/* ------------------------------------------------------------------- misc */

export const PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

/** Upload guardrails for complaint evidence. */
export const UPLOAD_RULES = {
  maxFiles: 4,
  maxSizeMb: 5,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  accept: 'image/jpeg,image/png,image/webp',
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Civic-Pulse';
export const APP_TAGLINE = 'Smart Civic Issue Resolution & Monitoring System';
