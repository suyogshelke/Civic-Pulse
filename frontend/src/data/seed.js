/**
 * Deterministic seed data for the in-browser mock backend.
 *
 * A tiny seeded PRNG (mulberry32) makes every generated complaint, date and
 * assignment identical on each load, so screenshots, demos and viva
 * walkthroughs are perfectly reproducible.
 */

import { STATUS, PRIORITY, CATEGORY_KEYS, CATEGORIES, WARDS, ROLES } from '../utils/constants';

function mulberry32(seed) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20262027);
const rand = (min, max) => min + Math.floor(rng() * (max - min + 1));
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

/* ---------------------------------------------------------- departments */

export const departments = [
  { id: 1, name: 'Public Works', code: 'PWD', email: 'pwd@punecivic.gov.in', phone: '9820011001', head: 'Eng. R. Deshmukh', active: true },
  { id: 2, name: 'Sanitation', code: 'SAN', email: 'sanitation@punecivic.gov.in', phone: '9820011002', head: 'Ms. K. Patil', active: true },
  { id: 3, name: 'Water Supply', code: 'WTR', email: 'water@punecivic.gov.in', phone: '9820011003', head: 'Mr. A. Joshi', active: true },
  { id: 4, name: 'Drainage', code: 'DRN', email: 'drainage@punecivic.gov.in', phone: '9820011004', head: 'Mr. S. Kulkarni', active: true },
  { id: 5, name: 'Electricity', code: 'ELE', email: 'electricity@punecivic.gov.in', phone: '9820011005', head: 'Ms. P. Rane', active: true },
  { id: 6, name: 'Roads & Transport', code: 'RTO', email: 'roads@punecivic.gov.in', phone: '9820011006', head: 'Mr. V. Gaikwad', active: true },
];

const deptByName = Object.fromEntries(departments.map((d) => [d.name, d.id]));

/* --------------------------------------------------------------- users */
// NOTE: plain-text passwords exist ONLY in this front-end demo seed so the
// login screen can be tried instantly. The real Spring Boot backend stores
// BCrypt hashes and never returns them.

export const users = [
  { id: 1, role: ROLES.ADMIN, fullName: 'System Administrator', email: 'admin@civicpulse.in', phone: '9800000001', password: 'Admin@123', ward: WARDS[4], address: 'Municipal HQ, Shivajinagar', active: true, createdAt: daysAgo(120) },

  { id: 2, role: ROLES.OFFICER, fullName: 'Rahul Deshmukh', email: 'rahul.officer@civicpulse.in', phone: '9800000002', password: 'Officer@123', departmentId: 1, designation: 'Junior Engineer', active: true, createdAt: daysAgo(110) },
  { id: 3, role: ROLES.OFFICER, fullName: 'Kavita Patil', email: 'kavita.officer@civicpulse.in', phone: '9800000003', password: 'Officer@123', departmentId: 2, designation: 'Sanitary Inspector', active: true, createdAt: daysAgo(108) },
  { id: 4, role: ROLES.OFFICER, fullName: 'Amit Joshi', email: 'amit.officer@civicpulse.in', phone: '9800000004', password: 'Officer@123', departmentId: 3, designation: 'Section Officer', active: true, createdAt: daysAgo(96) },
  { id: 5, role: ROLES.OFFICER, fullName: 'Sunil Kulkarni', email: 'sunil.officer@civicpulse.in', phone: '9800000005', password: 'Officer@123', departmentId: 4, designation: 'Field Engineer', active: true, createdAt: daysAgo(90) },
  { id: 6, role: ROLES.OFFICER, fullName: 'Priya Rane', email: 'priya.officer@civicpulse.in', phone: '9800000006', password: 'Officer@123', departmentId: 5, designation: 'Electrical Supervisor', active: true, createdAt: daysAgo(84) },

  { id: 7, role: ROLES.CITIZEN, fullName: 'Suyog Shelke', email: 'suyog@civicpulse.in', phone: '9811100007', password: 'Citizen@123', ward: WARDS[0], address: 'Kothrud, Pune', pincode: '411038', active: true, createdAt: daysAgo(70) },
  { id: 8, role: ROLES.CITIZEN, fullName: 'Soham Shelke', email: 'soham@civicpulse.in', phone: '9811100008', password: 'Citizen@123', ward: WARDS[1], address: 'Karve Nagar, Pune', pincode: '411052', active: true, createdAt: daysAgo(66) },
  { id: 9, role: ROLES.CITIZEN, fullName: 'Meera Nair', email: 'meera@civicpulse.in', phone: '9811100009', password: 'Citizen@123', ward: WARDS[3], address: 'Erandwane, Pune', pincode: '411004', active: true, createdAt: daysAgo(60) },
  { id: 10, role: ROLES.CITIZEN, fullName: 'Imran Shaikh', email: 'imran@civicpulse.in', phone: '9811100010', password: 'Citizen@123', ward: WARDS[5], address: 'Kondhwa, Pune', pincode: '411048', active: true, createdAt: daysAgo(52) },
];

const citizens = users.filter((u) => u.role === ROLES.CITIZEN);
const officers = users.filter((u) => u.role === ROLES.OFFICER);
const officerByDept = (deptId) => officers.find((o) => o.departmentId === deptId);

/* ---------------------------------------------------------- complaints */

const TITLES = {
  POTHOLE: ['Large pothole causing traffic slowdown', 'Crater-sized pothole after monsoon rain', 'Damaged road surface near school gate'],
  GARBAGE: ['Garbage not collected for over a week', 'Overflowing community waste bin', 'Illegal dumping at street corner'],
  WATER_LEAKAGE: ['Continuous water leakage from main pipeline', 'Burst pipe flooding the lane', 'Leaking valve wasting water daily'],
  WATER_SUPPLY: ['No water supply for three days', 'Very low water pressure every morning', 'Irregular water supply timing'],
  DRAINAGE: ['Blocked drainage causing waterlogging', 'Open manhole posing safety risk', 'Sewage overflow near residential area'],
  ELECTRICITY: ['Frequent power cuts in the evening', 'Transformer sparking dangerously', 'Loose hanging electric wires'],
  STREETLIGHT: ['Streetlight not working for two weeks', 'Entire lane in darkness at night', 'Flickering streetlight near junction'],
  TRAFFIC: ['Traffic signal not functioning', 'Faded zebra crossing near market', 'Missing road signage at turn'],
  ENCROACHMENT: ['Illegal shop encroachment on footpath', 'Vehicles blocking pedestrian path', 'Unauthorised construction debris'],
  STRAY_ANIMALS: ['Aggressive stray dogs near park', 'Cattle blocking the main road', 'Stray animal menace at bus stop'],
  NOISE: ['Loud construction noise late at night', 'Excessive loudspeaker noise', 'Continuous industrial noise pollution'],
  OTHER: ['General civic maintenance required', 'Public toilet in poor condition', 'Damaged public bench in garden'],
};

const LANDMARKS = ['near Bus Depot', 'opposite City Mall', 'beside Government School', 'near Water Tank', 'at Main Chowk', 'behind Market Yard', 'near Temple Road', 'opposite Petrol Pump'];

const REMARKS = {
  UNDER_REVIEW: 'Complaint reviewed and verified. Forwarding to the concerned department.',
  ASSIGNED: 'Complaint assigned to the field officer for inspection.',
  IN_PROGRESS: 'Site inspection completed. Repair work has commenced.',
  RESOLVED: 'Work completed and verified on site. Issue has been resolved.',
  CLOSED: 'Complaint closed after citizen confirmation.',
  REJECTED: 'Complaint could not be validated — insufficient or duplicate information.',
};

// How far along the lifecycle each generated complaint should be.
const STATUS_PLAN = [
  STATUS.SUBMITTED, STATUS.SUBMITTED,
  STATUS.UNDER_REVIEW, STATUS.UNDER_REVIEW,
  STATUS.ASSIGNED, STATUS.ASSIGNED,
  STATUS.IN_PROGRESS, STATUS.IN_PROGRESS, STATUS.IN_PROGRESS,
  STATUS.RESOLVED, STATUS.RESOLVED, STATUS.RESOLVED,
  STATUS.CLOSED, STATUS.CLOSED,
  STATUS.REJECTED,
];

const LADDER_FOR = {
  SUBMITTED: [STATUS.SUBMITTED],
  UNDER_REVIEW: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW],
  ASSIGNED: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW, STATUS.ASSIGNED],
  IN_PROGRESS: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW, STATUS.ASSIGNED, STATUS.IN_PROGRESS],
  RESOLVED: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.RESOLVED],
  CLOSED: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.RESOLVED, STATUS.CLOSED],
  REJECTED: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW, STATUS.REJECTED],
};

function buildComplaints() {
  const complaints = [];
  const updates = [];
  const feedback = [];
  let cId = 1000;
  let uId = 5000;
  let fId = 9000;

  const TOTAL = 46;
  for (let i = 0; i < TOTAL; i += 1) {
    const category = pick(CATEGORY_KEYS);
    const deptName = CATEGORIES[category].department;
    const departmentId = deptByName[deptName] || 1;
    const citizen = pick(citizens);
    const status = STATUS_PLAN[i % STATUS_PLAN.length];
    const priority = pick([PRIORITY.LOW, PRIORITY.MEDIUM, PRIORITY.MEDIUM, PRIORITY.HIGH, PRIORITY.HIGH, PRIORITY.CRITICAL]);
    const createdDaysAgo = rand(2, 85);
    const createdAt = daysAgo(createdDaysAgo);
    const ward = citizen.ward || pick(WARDS);
    const needsOfficer = [STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.RESOLVED, STATUS.CLOSED].includes(status);
    const officer = needsOfficer ? officerByDept(departmentId) : null;

    const id = (cId += 1);
    const ladder = LADDER_FOR[status];
    let cursorDaysAgo = createdDaysAgo;

    ladder.forEach((st, idx) => {
      if (idx === 0) return; // SUBMITTED is implicit creation
      cursorDaysAgo = Math.max(0, cursorDaysAgo - rand(1, 6));
      const actor = st === STATUS.UNDER_REVIEW ? users[0] : officer || users[0];
      updates.push({
        id: (uId += 1),
        complaintId: id,
        fromStatus: ladder[idx - 1],
        toStatus: st,
        remark: REMARKS[st] || 'Status updated.',
        byUserId: actor.id,
        byName: actor.fullName,
        byRole: actor.role,
        createdAt: daysAgo(cursorDaysAgo),
      });
    });

    const resolvedUpdate = updates.find((u) => u.complaintId === id && u.toStatus === STATUS.RESOLVED);
    const resolvedAt = resolvedUpdate ? resolvedUpdate.createdAt : null;

    if ((status === STATUS.RESOLVED || status === STATUS.CLOSED) && rng() > 0.25) {
      feedback.push({
        id: (fId += 1),
        complaintId: id,
        citizenId: citizen.id,
        citizenName: citizen.fullName,
        rating: rand(3, 5),
        comment: pick([
          'Quick and satisfactory resolution. Thank you!',
          'Issue was resolved well, though it took a little time.',
          'Very responsive officer. Appreciate the follow-up.',
          'Resolved properly. Hope it stays fixed.',
        ]),
        createdAt: resolvedAt || createdAt,
      });
    }

    complaints.push({
      id,
      title: pick(TITLES[category]),
      description:
        `Reporting a ${CATEGORIES[category].label.toLowerCase()} issue in ${ward}, ${pick(LANDMARKS)}. ` +
        'The problem has been persisting and is causing inconvenience to residents in the area. ' +
        'Requesting the concerned department to take prompt action to resolve this civic issue.',
      category,
      status,
      priority,
      departmentId,
      wardName: ward,
      landmark: pick(LANDMARKS),
      pincode: citizen.pincode || '411038',
      latitude: 18.5 + rng() * 0.1,
      longitude: 73.8 + rng() * 0.1,
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      assignedOfficerId: officer ? officer.id : null,
      assignedOfficerName: officer ? officer.fullName : null,
      attachments: rng() > 0.4
        ? [{ id: id * 10 + 1, name: `evidence-${id}.jpg`, type: 'image/jpeg', size: rand(180000, 900000) }]
        : [],
      createdAt,
      updatedAt: resolvedAt || createdAt,
      resolvedAt,
    });
  }
  return { complaints, updates, feedback };
}

const generated = buildComplaints();

export const complaints = generated.complaints;
export const complaintUpdates = generated.updates;
export const feedbackEntries = generated.feedback;

/** A fresh deep clone of the seed — the mock DB resets from this. */
export function freshSeed() {
  return {
    users: structuredClone(users),
    departments: structuredClone(departments),
    complaints: structuredClone(complaints),
    complaintUpdates: structuredClone(complaintUpdates),
    feedback: structuredClone(feedbackEntries),
  };
}
