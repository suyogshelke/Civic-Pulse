/**
 * Mock backend service — the in-browser stand-in for the Spring Boot API.
 *
 * Every function here has a one-to-one counterpart on the real backend and
 * returns the same DTO shape, so switching VITE_USE_MOCK_API to false is the
 * only change needed to run against Java + MySQL.
 */

import { getDb, persist, nextId, resetDb } from './db';
import { delay, MockApiError, signFakeToken, sanitiseUser, fileToDataUrl } from './helpers';
import {
  STATUS, ROLES, CATEGORIES, PRIORITY_META, canTransition, isOpenStatus,
} from '../../utils/constants';
import { daysBetween } from '../../utils/formatters';

/* ------------------------------------------------------------------- auth */

async function login({ email, password }) {
  await delay();
  const user = getDb().users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || user.password !== password) {
    throw new MockApiError(401, 'Invalid email or password');
  }
  if (!user.active) throw new MockApiError(403, 'This account has been deactivated');
  return { token: signFakeToken(user), user: sanitiseUser(user) };
}

async function register(form) {
  await delay();
  const db = getDb();
  if (db.users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
    throw new MockApiError(409, 'An account with this email already exists');
  }
  const user = {
    id: nextId('users'),
    role: ROLES.CITIZEN,
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    password: form.password,
    ward: form.ward,
    address: form.address,
    pincode: form.pincode || '',
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  persist();
  return { token: signFakeToken(user), user: sanitiseUser(user) };
}

async function me(userId) {
  await delay(120);
  const user = getDb().users.find((u) => u.id === userId);
  if (!user) throw new MockApiError(404, 'User not found');
  return sanitiseUser(user);
}

async function updateProfile(userId, patch) {
  await delay();
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new MockApiError(404, 'User not found');
  Object.assign(user, {
    fullName: patch.fullName ?? user.fullName,
    phone: patch.phone ?? user.phone,
    ward: patch.ward ?? user.ward,
    address: patch.address ?? user.address,
    pincode: patch.pincode ?? user.pincode,
  });
  persist();
  return sanitiseUser(user);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  await delay();
  const user = getDb().users.find((u) => u.id === userId);
  if (!user) throw new MockApiError(404, 'User not found');
  if (user.password !== currentPassword) throw new MockApiError(400, 'Current password is incorrect');
  user.password = newPassword;
  persist();
  return { success: true };
}

/* ------------------------------------------------------- complaint helpers */

const withNames = (c) => {
  const db = getDb();
  const dept = db.departments.find((d) => d.id === c.departmentId);
  return {
    ...c,
    departmentName: dept ? dept.name : '—',
    categoryLabel: CATEGORIES[c.category]?.label || c.category,
  };
};

function autoRoute(category) {
  const db = getDb();
  const deptName = CATEGORIES[category]?.department;
  const dept = db.departments.find((d) => d.name === deptName);
  return dept ? dept.id : db.departments[0].id;
}

/* ---------------------------------------------------------- complaint CRUD */

async function listComplaints(filters = {}) {
  await delay();
  const db = getDb();
  let rows = db.complaints.map(withNames);

  if (filters.citizenId) rows = rows.filter((c) => c.citizenId === filters.citizenId);
  if (filters.officerId) rows = rows.filter((c) => c.assignedOfficerId === filters.officerId);
  if (filters.departmentId) rows = rows.filter((c) => c.departmentId === Number(filters.departmentId));
  if (filters.status) rows = rows.filter((c) => c.status === filters.status);
  if (filters.priority) rows = rows.filter((c) => c.priority === filters.priority);
  if (filters.category) rows = rows.filter((c) => c.category === filters.category);
  if (filters.ward) rows = rows.filter((c) => c.wardName === filters.ward);
  if (filters.openOnly) rows = rows.filter((c) => isOpenStatus(c.status));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        String(c.id).includes(q) ||
        c.citizenName.toLowerCase().includes(q),
    );
  }
  rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return rows;
}

async function getComplaint(id) {
  await delay();
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === Number(id));
  if (!complaint) throw new MockApiError(404, 'Complaint not found');
  const timeline = db.complaintUpdates
    .filter((u) => u.complaintId === complaint.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const feedback = db.feedback.find((f) => f.complaintId === complaint.id) || null;
  return { ...withNames(complaint), timeline, feedback };
}

async function createComplaint(citizen, form) {
  await delay();
  const db = getDb();
  const departmentId = autoRoute(form.category);

  const attachments = [];
  if (form.files?.length) {
    for (const file of form.files) {
      // eslint-disable-next-line no-await-in-loop
      const dataUrl = await fileToDataUrl(file);
      attachments.push({ id: nextId('complaints') * 10 + attachments.length, name: file.name, type: file.type, size: file.size, dataUrl });
    }
  }

  const now = new Date().toISOString();
  const complaint = {
    id: nextId('complaints'),
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    status: STATUS.SUBMITTED,
    priority: form.priority,
    departmentId,
    wardName: form.ward,
    landmark: form.landmark,
    pincode: form.pincode || citizen.pincode || '',
    latitude: form.latitude || null,
    longitude: form.longitude || null,
    citizenId: citizen.id,
    citizenName: citizen.fullName,
    assignedOfficerId: null,
    assignedOfficerName: null,
    attachments,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  };
  db.complaints.push(complaint);
  db.complaintUpdates.push({
    id: nextId('complaintUpdates'),
    complaintId: complaint.id,
    fromStatus: null,
    toStatus: STATUS.SUBMITTED,
    remark: 'Complaint submitted by citizen.',
    byUserId: citizen.id,
    byName: citizen.fullName,
    byRole: ROLES.CITIZEN,
    createdAt: now,
  });
  persist();
  return withNames(complaint);
}

/**
 * Apply a status transition. Validates against the state machine, records a
 * timeline entry, and handles side-effects (assignment, resolution stamp).
 */
async function transitionComplaint(actor, id, { toStatus, remark, officerId, resolutionNote, files }) {
  await delay();
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === Number(id));
  if (!complaint) throw new MockApiError(404, 'Complaint not found');

  if (toStatus && !canTransition(complaint.status, toStatus)) {
    throw new MockApiError(400, `Cannot move a complaint from ${complaint.status} to ${toStatus}`);
  }

  const fromStatus = complaint.status;
  const now = new Date().toISOString();

  if (officerId) {
    const officer = db.users.find((u) => u.id === Number(officerId) && u.role === ROLES.OFFICER);
    if (!officer) throw new MockApiError(400, 'Selected officer does not exist');
    complaint.assignedOfficerId = officer.id;
    complaint.assignedOfficerName = officer.fullName;
    complaint.departmentId = officer.departmentId;
  }

  if (files?.length) {
    complaint.attachments = complaint.attachments || [];
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const dataUrl = await fileToDataUrl(file);
      complaint.attachments.push({ id: Date.now() + complaint.attachments.length, name: file.name, type: file.type, size: file.size, dataUrl, resolution: true });
    }
  }

  if (toStatus) {
    complaint.status = toStatus;
    if (toStatus === STATUS.RESOLVED) complaint.resolvedAt = now;
  }
  complaint.updatedAt = now;

  db.complaintUpdates.push({
    id: nextId('complaintUpdates'),
    complaintId: complaint.id,
    fromStatus,
    toStatus: toStatus || fromStatus,
    remark: resolutionNote || remark || 'Status updated.',
    byUserId: actor.id,
    byName: actor.fullName,
    byRole: actor.role,
    createdAt: now,
  });
  persist();
  return withNames(complaint);
}

async function setPriority(actor, id, priority) {
  await delay();
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === Number(id));
  if (!complaint) throw new MockApiError(404, 'Complaint not found');
  const from = complaint.priority;
  complaint.priority = priority;
  complaint.updatedAt = new Date().toISOString();
  db.complaintUpdates.push({
    id: nextId('complaintUpdates'),
    complaintId: complaint.id,
    fromStatus: complaint.status,
    toStatus: complaint.status,
    remark: `Priority changed from ${from} to ${priority}.`,
    byUserId: actor.id,
    byName: actor.fullName,
    byRole: actor.role,
    createdAt: new Date().toISOString(),
  });
  persist();
  return withNames(complaint);
}

/* --------------------------------------------------------------- feedback */

async function submitFeedback(citizen, complaintId, { rating, comment }) {
  await delay();
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === Number(complaintId));
  if (!complaint) throw new MockApiError(404, 'Complaint not found');
  if (complaint.citizenId !== citizen.id) throw new MockApiError(403, 'You can only rate your own complaints');
  if (![STATUS.RESOLVED, STATUS.CLOSED].includes(complaint.status)) {
    throw new MockApiError(400, 'Feedback can only be given on resolved complaints');
  }
  const existing = db.feedback.find((f) => f.complaintId === complaint.id);
  const now = new Date().toISOString();
  if (existing) {
    Object.assign(existing, { rating, comment, createdAt: now });
    persist();
    return existing;
  }
  const entry = {
    id: nextId('feedback'),
    complaintId: complaint.id,
    citizenId: citizen.id,
    citizenName: citizen.fullName,
    rating,
    comment,
    createdAt: now,
  };
  db.feedback.push(entry);
  persist();
  return entry;
}

/* ---------------------------------------------------------- departments */

async function listDepartments() {
  await delay(150);
  const db = getDb();
  return db.departments.map((d) => {
    const officers = db.users.filter((u) => u.role === ROLES.OFFICER && u.departmentId === d.id);
    const complaints = db.complaints.filter((c) => c.departmentId === d.id);
    const resolved = complaints.filter((c) => [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status));
    return {
      ...d,
      officerCount: officers.length,
      complaintCount: complaints.length,
      resolvedCount: resolved.length,
    };
  });
}

async function saveDepartment(form) {
  await delay();
  const db = getDb();
  if (form.id) {
    const dept = db.departments.find((d) => d.id === form.id);
    if (!dept) throw new MockApiError(404, 'Department not found');
    Object.assign(dept, form);
    persist();
    return dept;
  }
  const dept = { id: nextId('departments'), active: true, ...form };
  db.departments.push(dept);
  persist();
  return dept;
}

/* --------------------------------------------------------------- users */

async function listUsers(role) {
  await delay(150);
  const db = getDb();
  let rows = db.users;
  if (role) rows = rows.filter((u) => u.role === role);
  return rows.map((u) => {
    const clean = sanitiseUser(u);
    if (u.role === ROLES.OFFICER) {
      const dept = db.departments.find((d) => d.id === u.departmentId);
      clean.departmentName = dept ? dept.name : '—';
      clean.assignedCount = db.complaints.filter((c) => c.assignedOfficerId === u.id).length;
    }
    if (u.role === ROLES.CITIZEN) {
      clean.complaintCount = db.complaints.filter((c) => c.citizenId === u.id).length;
    }
    return clean;
  });
}

async function saveOfficer(form) {
  await delay();
  const db = getDb();
  if (form.id) {
    const officer = db.users.find((u) => u.id === form.id);
    if (!officer) throw new MockApiError(404, 'Officer not found');
    Object.assign(officer, {
      fullName: form.fullName, phone: form.phone, departmentId: Number(form.departmentId),
      designation: form.designation, email: form.email,
    });
    if (form.password) officer.password = form.password;
    persist();
    return sanitiseUser(officer);
  }
  if (db.users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
    throw new MockApiError(409, 'A user with this email already exists');
  }
  const officer = {
    id: nextId('users'), role: ROLES.OFFICER, fullName: form.fullName, email: form.email,
    phone: form.phone, password: form.password, departmentId: Number(form.departmentId),
    designation: form.designation, active: true, createdAt: new Date().toISOString(),
  };
  db.users.push(officer);
  persist();
  return sanitiseUser(officer);
}

async function toggleUserActive(userId) {
  await delay();
  const db = getDb();
  const user = db.users.find((u) => u.id === Number(userId));
  if (!user) throw new MockApiError(404, 'User not found');
  if (user.role === ROLES.ADMIN) throw new MockApiError(400, 'The administrator account cannot be deactivated');
  user.active = !user.active;
  persist();
  return sanitiseUser(user);
}

/* --------------------------------------------------------------- analytics */

async function analytics() {
  await delay();
  const db = getDb();
  const all = db.complaints;
  const total = all.length;

  const byStatus = {};
  const byCategory = {};
  const byPriority = {};
  const byWard = {};
  const byDepartment = {};

  all.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    byWard[c.wardName] = (byWard[c.wardName] || 0) + 1;
    const dept = db.departments.find((d) => d.id === c.departmentId);
    const dn = dept ? dept.name : 'Unassigned';
    byDepartment[dn] = byDepartment[dn] || { total: 0, resolved: 0 };
    byDepartment[dn].total += 1;
    if ([STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)) byDepartment[dn].resolved += 1;
  });

  const resolved = all.filter((c) => [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status));
  const pending = all.filter((c) => isOpenStatus(c.status));

  // Average resolution time (days) across complaints that carry a resolved stamp.
  const resolutionTimes = resolved
    .filter((c) => c.resolvedAt)
    .map((c) => daysBetween(c.createdAt, c.resolvedAt));
  const avgResolutionDays = resolutionTimes.length
    ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)
    : '0.0';

  // 6-month trend of submitted vs resolved.
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('en-IN', { month: 'short' });
    const inMonth = (iso) => {
      const dt = new Date(iso);
      return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
    };
    months.push({
      month: key,
      submitted: all.filter((c) => inMonth(c.createdAt)).length,
      resolved: all.filter((c) => c.resolvedAt && inMonth(c.resolvedAt)).length,
    });
  }

  const ratings = db.feedback.map((f) => f.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';

  return {
    totals: {
      total,
      pending: pending.length,
      resolved: resolved.length,
      resolutionRate: total ? Math.round((resolved.length / total) * 100) : 0,
      avgResolutionDays,
      avgRating,
      critical: all.filter((c) => c.priority === 'CRITICAL' && isOpenStatus(c.status)).length,
      departments: db.departments.length,
      officers: db.users.filter((u) => u.role === ROLES.OFFICER).length,
      citizens: db.users.filter((u) => u.role === ROLES.CITIZEN).length,
    },
    byStatus,
    byCategory,
    byPriority,
    byWard,
    byDepartment,
    trend: months,
    priorityMeta: PRIORITY_META,
  };
}

async function officerStats(officerId) {
  await delay(150);
  const db = getDb();
  const mine = db.complaints.filter((c) => c.assignedOfficerId === officerId);
  return {
    assigned: mine.length,
    inProgress: mine.filter((c) => c.status === STATUS.IN_PROGRESS).length,
    resolved: mine.filter((c) => [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)).length,
    pending: mine.filter((c) => [STATUS.ASSIGNED, STATUS.IN_PROGRESS].includes(c.status)).length,
  };
}

async function citizenStats(citizenId) {
  await delay(150);
  const db = getDb();
  const mine = db.complaints.filter((c) => c.citizenId === citizenId);
  return {
    total: mine.length,
    open: mine.filter((c) => isOpenStatus(c.status)).length,
    resolved: mine.filter((c) => [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)).length,
    awaitingFeedback: mine.filter(
      (c) => c.status === STATUS.RESOLVED && !db.feedback.some((f) => f.complaintId === c.id),
    ).length,
  };
}

export const mockService = {
  login, register, me, updateProfile, changePassword,
  listComplaints, getComplaint, createComplaint, transitionComplaint, setPriority,
  submitFeedback,
  listDepartments, saveDepartment,
  listUsers, saveOfficer, toggleUserActive,
  analytics, officerStats, citizenStats,
  resetDb,
};
