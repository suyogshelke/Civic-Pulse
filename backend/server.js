import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 8080);
const uploadDir = path.resolve(process.env.APP_UPLOAD_DIR || path.join(__dirname, 'uploads'));
fs.mkdirSync(uploadDir, { recursive: true });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'civicpulse',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

const upload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024 } });
const jwtSecret = process.env.APP_JWT_SECRET || 'Y2l2aWMtcHVsc2Utc2VjcmV0LWtleS1mb3ItbWl0d3B1LW1jYS1taW5pLXByb2plY3QtMjAyNg==';

app.use(cors({ origin: (process.env.APP_CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173').split(',') }));
app.use(express.json());
app.use('/api/files', express.static(uploadDir));

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const userDto = (user) => ({
  id: user.id, role: user.role, fullName: user.full_name, email: user.email, phone: user.phone,
  ward: user.ward, address: user.address, pincode: user.pincode, designation: user.designation,
  departmentId: user.department_id, departmentName: user.department_name, active: Boolean(user.active), createdAt: user.created_at,
});
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '24h' });

async function findUser(id) {
  const [rows] = await pool.execute(`SELECT u.*, d.name department_name FROM users u LEFT JOIN departments d ON d.id = u.department_id WHERE u.id = ?`, [id]);
  return rows[0] || null;
}

const auth = asyncRoute(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(header.slice(7), jwtSecret);
    req.user = await findUser(payload.sub);
    if (!req.user || !req.user.active) return res.status(401).json({ message: 'Invalid or inactive account' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});
const roles = (...allowed) => (req, res, next) => allowed.includes(req.user.role)
  ? next() : res.status(403).json({ message: 'You do not have permission to perform this action' });

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.execute(`SELECT u.*, d.name department_name FROM users u LEFT JOIN departments d ON d.id = u.department_id WHERE u.email = ?`, [email]);
  const user = rows[0];
  if (!user || !user.active || !(await bcrypt.compare(password || '', user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: tokenFor(user), user: userDto(user) });
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { fullName, email, phone, password, ward, address, pincode } = req.body || {};
  if (!fullName || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(`INSERT INTO users (role, full_name, email, phone, password_hash, ward, address, pincode, active, created_at) VALUES ('CITIZEN', ?, ?, ?, ?, ?, ?, ?, 1, NOW(6))`, [fullName, email, phone || null, hash, ward || null, address || null, pincode || null]);
  const user = await findUser(result.insertId);
  res.status(201).json({ token: tokenFor(user), user: userDto(user) });
}));
app.get('/api/auth/me', auth, (req, res) => res.json(userDto(req.user)));

app.get('/api/departments', auth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM departments ORDER BY name');
  res.json(rows.map((d) => ({ id: d.id, name: d.name, code: d.code, head: d.head, email: d.email, phone: d.phone, active: Boolean(d.active), createdAt: d.created_at })));
}));
app.post('/api/departments', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const { name, code, head, email, phone, active = true } = req.body;
  const [result] = await pool.execute('INSERT INTO departments (name, code, head, email, phone, active, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW(6))', [name, code, head || null, email || null, phone || null, active]);
  const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}));
app.put('/api/departments/:id', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const { name, code, head, email, phone, active = true } = req.body;
  await pool.execute('UPDATE departments SET name=?, code=?, head=?, email=?, phone=?, active=? WHERE id=?', [name, code, head || null, email || null, phone || null, active, req.params.id]);
  const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}));

app.put('/api/users/me', auth, asyncRoute(async (req, res) => {
  const { fullName, phone, ward, address, pincode } = req.body;
  await pool.execute('UPDATE users SET full_name=?, phone=?, ward=?, address=?, pincode=? WHERE id=?', [fullName, phone || null, ward || null, address || null, pincode || null, req.user.id]);
  res.json(userDto(await findUser(req.user.id)));
}));
app.put('/api/users/me/password', auth, asyncRoute(async (req, res) => {
  if (!(await bcrypt.compare(req.body.currentPassword || '', req.user.password_hash))) return res.status(400).json({ message: 'Your current password is incorrect' });
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(req.body.newPassword, 10), req.user.id]);
  res.json({ success: true });
}));
app.get('/api/users', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const params = [];
  let sql = 'SELECT u.*, d.name department_name FROM users u LEFT JOIN departments d ON d.id=u.department_id';
  if (req.query.role) { sql += ' WHERE u.role=?'; params.push(req.query.role); }
  sql += ' ORDER BY u.full_name';
  const [rows] = await pool.execute(sql, params);
  res.json(rows.map(userDto));
}));
app.patch('/api/users/:id/active', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  await pool.execute('UPDATE users SET active = NOT active WHERE id=?', [req.params.id]);
  res.json(userDto(await findUser(req.params.id)));
}));
app.post('/api/users/officers', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const { fullName, email, phone, departmentId, designation, password = 'Officer@123' } = req.body;
  const [result] = await pool.execute(`INSERT INTO users (role, full_name, email, phone, password_hash, department_id, designation, active, created_at) VALUES ('OFFICER', ?, ?, ?, ?, ?, ?, 1, NOW(6))`, [fullName, email, phone || null, await bcrypt.hash(password, 10), departmentId || null, designation || null]);
  res.status(201).json(userDto(await findUser(result.insertId)));
}));
app.put('/api/users/officers/:id', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const { fullName, email, phone, departmentId, designation, password } = req.body;
  const values = [fullName, email, phone || null, departmentId || null, designation || null, req.params.id];
  await pool.execute('UPDATE users SET full_name=?, email=?, phone=?, department_id=?, designation=? WHERE id=?', values);
  if (password) await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 10), req.params.id]);
  res.json(userDto(await findUser(req.params.id)));
}));

async function complaintView(id) {
  const [rows] = await pool.execute(`SELECT c.*, d.name department_name, cu.full_name citizen_name, ao.full_name assigned_officer_name FROM complaints c LEFT JOIN departments d ON d.id=c.department_id LEFT JOIN users cu ON cu.id=c.citizen_id LEFT JOIN users ao ON ao.id=c.assigned_officer_id WHERE c.id=?`, [id]);
  const c = rows[0];
  if (!c) return null;
  const [attachments] = await pool.execute('SELECT id, file_name fileName, content_type contentType, size, url, resolution, created_at createdAt FROM attachments WHERE complaint_id=? ORDER BY created_at', [id]);
  const [timeline] = await pool.execute('SELECT id, from_status fromStatus, to_status toStatus, remark, by_name byName, by_role byRole, created_at createdAt FROM complaint_updates WHERE complaint_id=? ORDER BY created_at', [id]);
  const [feedback] = await pool.execute('SELECT id, rating, comment, citizen_name citizenName, created_at createdAt, updated_at updatedAt FROM feedback WHERE complaint_id=?', [id]);
  return { id: c.id, title: c.title, description: c.description, category: c.category, categoryLabel: c.category, status: c.status, priority: c.priority, departmentId: c.department_id, departmentName: c.department_name, wardName: c.ward, landmark: c.landmark, pincode: c.pincode, latitude: c.latitude, longitude: c.longitude, citizenId: c.citizen_id, citizenName: c.citizen_name, assignedOfficerId: c.assigned_officer_id, assignedOfficerName: c.assigned_officer_name, createdAt: c.created_at, updatedAt: c.updated_at, resolvedAt: c.resolved_at, attachments, timeline, feedback: feedback[0] || null };
}

app.get('/api/complaints', auth, asyncRoute(async (req, res) => {
  const where = []; const params = [];
  if (req.user.role === 'CITIZEN') { where.push('c.citizen_id=?'); params.push(req.user.id); }
  if (req.query.status) { where.push('c.status=?'); params.push(req.query.status); }
  if (req.query.priority) { where.push('c.priority=?'); params.push(req.query.priority); }
  if (req.query.category) { where.push('c.category=?'); params.push(req.query.category); }
  if (req.query.departmentId) { where.push('c.department_id=?'); params.push(req.query.departmentId); }
  if (req.query.search) { where.push('(c.title LIKE ? OR c.description LIKE ?)'); params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
  const [rows] = await pool.execute(`SELECT c.id, c.title, c.description, c.category, c.status, c.priority, c.department_id departmentId, d.name departmentName, c.ward wardName, c.citizen_id citizenId, cu.full_name citizenName, c.assigned_officer_id assignedOfficerId, ao.full_name assignedOfficerName, c.created_at createdAt, c.updated_at updatedAt, c.resolved_at resolvedAt FROM complaints c LEFT JOIN departments d ON d.id=c.department_id LEFT JOIN users cu ON cu.id=c.citizen_id LEFT JOIN users ao ON ao.id=c.assigned_officer_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.created_at DESC`, params);
  res.json(rows.map((row) => ({ ...row, categoryLabel: row.category })));
}));
app.get('/api/complaints/:id', auth, asyncRoute(async (req, res) => {
  const complaint = await complaintView(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (req.user.role === 'CITIZEN' && complaint.citizenId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
  res.json(complaint);
}));
app.post('/api/complaints', auth, roles('CITIZEN'), upload.array('files'), asyncRoute(async (req, res) => {
  const { title, description, category, priority = 'MEDIUM', ward, landmark, pincode, latitude, longitude } = req.body;
  const [result] = await pool.execute(`INSERT INTO complaints (title, description, category, status, priority, ward, landmark, pincode, latitude, longitude, citizen_id, created_at, updated_at) VALUES (?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6))`, [title, description, category, priority, ward, landmark || null, pincode || null, latitude || null, longitude || null, req.user.id]);
  await pool.execute('INSERT INTO complaint_updates (complaint_id, to_status, remark, by_user_id, by_name, by_role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW(6))', [result.insertId, 'SUBMITTED', 'Complaint submitted by citizen.', req.user.id, req.user.full_name, req.user.role]);
  res.status(201).json(await complaintView(result.insertId));
}));
app.patch('/api/complaints/:id/status', auth, roles('OFFICER', 'ADMIN'), upload.array('files'), asyncRoute(async (req, res) => {
  const { toStatus, remark, resolutionNote } = req.body;
  const complaint = await complaintView(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  await pool.execute('UPDATE complaints SET status=?, resolved_at=IF(?="RESOLVED", NOW(6), resolved_at), updated_at=NOW(6) WHERE id=?', [toStatus || complaint.status, toStatus || complaint.status, req.params.id]);
  await pool.execute('INSERT INTO complaint_updates (complaint_id, from_status, to_status, remark, by_user_id, by_name, by_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(6))', [req.params.id, complaint.status, toStatus || complaint.status, resolutionNote || remark || 'Status updated.', req.user.id, req.user.full_name, req.user.role]);
  res.json(await complaintView(req.params.id));
}));
app.patch('/api/complaints/:id/priority', auth, roles('OFFICER', 'ADMIN'), asyncRoute(async (req, res) => {
  await pool.execute('UPDATE complaints SET priority=?, updated_at=NOW(6) WHERE id=?', [req.body.priority, req.params.id]);
  res.json(await complaintView(req.params.id));
}));
app.patch('/api/complaints/:id/assign', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const [officers] = await pool.execute('SELECT * FROM users WHERE id=? AND role="OFFICER" AND active=1', [req.body.officerId]);
  if (!officers[0]) return res.status(400).json({ message: 'Selected officer does not exist' });
  await pool.execute('UPDATE complaints SET assigned_officer_id=?, department_id=(SELECT department_id FROM users WHERE id=?), status=IF(status IN ("SUBMITTED", "UNDER_REVIEW"), "ASSIGNED", status), updated_at=NOW(6) WHERE id=?', [req.body.officerId, req.body.officerId, req.params.id]);
  res.json(await complaintView(req.params.id));
}));
app.post('/api/complaints/:id/feedback', auth, roles('CITIZEN'), asyncRoute(async (req, res) => {
  const [complaints] = await pool.execute('SELECT * FROM complaints WHERE id=? AND citizen_id=?', [req.params.id, req.user.id]);
  if (!complaints[0]) return res.status(403).json({ message: 'You can only rate your own complaints' });
  await pool.execute('INSERT INTO feedback (complaint_id, citizen_id, citizen_name, rating, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(6), NOW(6)) ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment), updated_at=NOW(6)', [req.params.id, req.user.id, req.user.full_name, req.body.rating, req.body.comment || null]);
  const [feedback] = await pool.execute('SELECT id, rating, comment, citizen_name citizenName, created_at createdAt, updated_at updatedAt FROM feedback WHERE complaint_id=?', [req.params.id]);
  res.json(feedback[0]);
}));

app.get('/api/analytics/overview', auth, roles('ADMIN'), asyncRoute(async (req, res) => {
  const [[totals]] = await pool.execute(`SELECT COUNT(*) total, SUM(status IN ('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS')) pending, SUM(status IN ('RESOLVED','CLOSED')) resolved FROM complaints`);
  const [byStatus] = await pool.execute('SELECT status name, COUNT(*) value FROM complaints GROUP BY status');
  res.json({ totals: { total: totals.total || 0, pending: totals.pending || 0, resolved: totals.resolved || 0, resolutionRate: totals.total ? Math.round((totals.resolved / totals.total) * 100) : 0 }, byStatus, byCategory: [], byPriority: [], byWard: [], byDepartment: [], trend: [], priorityMeta: {} });
}));
app.get('/api/analytics/officer', auth, roles('OFFICER'), asyncRoute(async (req, res) => {
  const [[stats]] = await pool.execute(`SELECT COUNT(*) assigned, SUM(status='IN_PROGRESS') inProgress, SUM(status IN ('RESOLVED','CLOSED')) resolved, SUM(status IN ('ASSIGNED','IN_PROGRESS')) pending FROM complaints WHERE assigned_officer_id=?`, [req.user.id]);
  res.json(Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Number(value || 0)])));
}));
app.get('/api/analytics/citizen', auth, roles('CITIZEN'), asyncRoute(async (req, res) => {
  const [[stats]] = await pool.execute(`SELECT COUNT(*) total, SUM(status NOT IN ('RESOLVED','CLOSED')) open, SUM(status IN ('RESOLVED','CLOSED')) resolved FROM complaints WHERE citizen_id=?`, [req.user.id]);
  res.json({ total: Number(stats.total || 0), open: Number(stats.open || 0), resolved: Number(stats.resolved || 0), awaitingFeedback: 0 });
}));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: error.code === 'ER_DUP_ENTRY' ? 'A record with that value already exists' : 'Server error' });
});
app.listen(port, () => console.log(`Civic-Pulse Node backend listening on http://localhost:${port}/api`));
