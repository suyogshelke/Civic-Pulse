-- =====================================================================
--  Civic-Pulse — reference seed data (MySQL 8.x)
-- ---------------------------------------------------------------------
--  NOTE: By default the Spring Boot app auto-seeds a richer demo dataset
--  (6 departments, 10 users, ~46 complaints across the whole lifecycle)
--  on first run via DataSeeder — you normally do NOT need this file.
--
--  Use this script only if you disabled auto-seeding (APP_SEED_DEMO=false)
--  and want to load a representative demo set manually, or to inspect the
--  shape of the data. Run schema.sql first.
--
--  Login passwords (BCrypt-hashed below):
--    admin@civicpulse.in            Admin@123     (ADMIN)
--    <name>.officer@civicpulse.in   Officer@123   (OFFICER)
--    <name>@civicpulse.in           Citizen@123   (CITIZEN)
-- =====================================================================

USE civicpulse;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE feedback;
TRUNCATE TABLE complaint_updates;
TRUNCATE TABLE attachments;
TRUNCATE TABLE complaints;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
--  Departments
-- ---------------------------------------------------------------------
INSERT INTO departments (id, name, code, head, email, phone, active, created_at) VALUES
  (1, 'Public Works',      'PWD', 'Eng. R. Deshmukh', 'pwd@punecivic.gov.in',         '9820011001', 1, NOW(6)),
  (2, 'Sanitation',        'SAN', 'Ms. K. Patil',     'sanitation@punecivic.gov.in',  '9820011002', 1, NOW(6)),
  (3, 'Water Supply',      'WTR', 'Mr. A. Joshi',     'water@punecivic.gov.in',       '9820011003', 1, NOW(6)),
  (4, 'Drainage',          'DRN', 'Mr. S. Kulkarni',  'drainage@punecivic.gov.in',    '9820011004', 1, NOW(6)),
  (5, 'Electricity',       'ELE', 'Ms. P. Rane',      'electricity@punecivic.gov.in', '9820011005', 1, NOW(6)),
  (6, 'Roads & Transport', 'RTO', 'Mr. V. Gaikwad',   'roads@punecivic.gov.in',       '9820011006', 1, NOW(6));

-- ---------------------------------------------------------------------
--  Users  (1 admin, 5 officers, 4 citizens)
--  Password hashes are valid BCrypt for the passwords noted above.
-- ---------------------------------------------------------------------
INSERT INTO users (id, role, full_name, email, phone, password_hash, ward, address, pincode, designation, department_id, active, created_at) VALUES
  (1, 'ADMIN',   'System Administrator', 'admin@civicpulse.in',         '9800000001', '$2b$10$aEb21GfjQnXgIi8UvpN4Peri12bm4IkVxkUkgqzUdPw0hxKddyUJu', 'Ward 5 — Shivajinagar', 'Municipal HQ, Shivajinagar', NULL,     NULL,                    NULL, 1, NOW(6)),
  (2, 'OFFICER', 'Rahul Deshmukh',       'rahul.officer@civicpulse.in', '9800000002', '$2b$10$Z4ffjKDaVsINatBn8V7DdeudJHUqYujOzrvO6PESoMqyPJ0i3ICY6', NULL, NULL, NULL, 'Junior Engineer',       1, 1, NOW(6)),
  (3, 'OFFICER', 'Kavita Patil',         'kavita.officer@civicpulse.in','9800000003', '$2b$10$Z4ffjKDaVsINatBn8V7DdeudJHUqYujOzrvO6PESoMqyPJ0i3ICY6', NULL, NULL, NULL, 'Sanitary Inspector',    2, 1, NOW(6)),
  (4, 'OFFICER', 'Amit Joshi',           'amit.officer@civicpulse.in',  '9800000004', '$2b$10$Z4ffjKDaVsINatBn8V7DdeudJHUqYujOzrvO6PESoMqyPJ0i3ICY6', NULL, NULL, NULL, 'Section Officer',       3, 1, NOW(6)),
  (5, 'OFFICER', 'Sunil Kulkarni',       'sunil.officer@civicpulse.in', '9800000005', '$2b$10$Z4ffjKDaVsINatBn8V7DdeudJHUqYujOzrvO6PESoMqyPJ0i3ICY6', NULL, NULL, NULL, 'Field Engineer',        4, 1, NOW(6)),
  (6, 'OFFICER', 'Priya Rane',           'priya.officer@civicpulse.in', '9800000006', '$2b$10$Z4ffjKDaVsINatBn8V7DdeudJHUqYujOzrvO6PESoMqyPJ0i3ICY6', NULL, NULL, NULL, 'Electrical Supervisor', 5, 1, NOW(6)),
  (7, 'CITIZEN', 'Suyog Shelke', 'suyog@civicpulse.in', '9811100007', '$2b$10$NkSFHK92mBhRl1OM7NAQEu4e9/D3fNd1ZS7GKihQiPaTAosjwG3fW', 'Ward 1 — Kothrud',     'Kothrud, Pune',     '411038', NULL, NULL, 1, NOW(6)),
  (8, 'CITIZEN', 'Soham Shelke', 'soham@civicpulse.in', '9811100008', '$2b$10$NkSFHK92mBhRl1OM7NAQEu4e9/D3fNd1ZS7GKihQiPaTAosjwG3fW', 'Ward 2 — Karve Nagar', 'Karve Nagar, Pune', '411052', NULL, NULL, 1, NOW(6)),
  (9, 'CITIZEN', 'Meera Nair',   'meera@civicpulse.in', '9811100009', '$2b$10$NkSFHK92mBhRl1OM7NAQEu4e9/D3fNd1ZS7GKihQiPaTAosjwG3fW', 'Ward 4 — Erandwane',   'Erandwane, Pune',   '411004', NULL, NULL, 1, NOW(6)),
  (10,'CITIZEN', 'Imran Shaikh', 'imran@civicpulse.in', '9811100010', '$2b$10$NkSFHK92mBhRl1OM7NAQEu4e9/D3fNd1ZS7GKihQiPaTAosjwG3fW', 'Ward 6 — Kondhwa',     'Kondhwa, Pune',     '411048', NULL, NULL, 1, NOW(6));

-- ---------------------------------------------------------------------
--  Complaints  (10 representative rows spanning every status & priority)
--  Note: department 6 (Roads & Transport) has no officer, so category
--        TRAFFIC complaints remain unassigned — mirrors the live demo.
-- ---------------------------------------------------------------------
INSERT INTO complaints (id, title, description, category, status, priority, department_id, ward, landmark, pincode, latitude, longitude, citizen_id, assigned_officer_id, created_at, updated_at, resolved_at) VALUES
  (1,  'Large pothole causing traffic slowdown',      'A deep pothole near the bus depot is causing daily traffic slowdowns and is a hazard to two-wheelers.',        'POTHOLE',       'RESOLVED',     'HIGH',     1, 'Ward 1 — Kothrud',     'near Bus Depot',           '411038', 18.507, 73.807, 7,  2,    NOW(6) - INTERVAL 30 DAY, NOW(6) - INTERVAL 21 DAY, NOW(6) - INTERVAL 21 DAY),
  (2,  'Garbage not collected for over a week',        'Community waste bin opposite City Mall has been overflowing for over a week, attracting stray animals.',       'GARBAGE',       'IN_PROGRESS',  'MEDIUM',   2, 'Ward 2 — Karve Nagar', 'opposite City Mall',       '411052', 18.502, 73.812, 8,  3,    NOW(6) - INTERVAL 12 DAY, NOW(6) - INTERVAL 3 DAY,  NULL),
  (3,  'Continuous water leakage from main pipeline',  'A burst pipe beside the government school is wasting water and flooding the lane.',                             'WATER_LEAKAGE', 'ASSIGNED',     'CRITICAL', 3, 'Ward 4 — Erandwane',   'beside Government School', '411004', 18.516, 73.821, 9,  4,    NOW(6) - INTERVAL 6 DAY,  NOW(6) - INTERVAL 4 DAY,  NULL),
  (4,  'Blocked drainage causing waterlogging',        'Blocked drainage near the water tank causes waterlogging after every rain.',                                    'DRAINAGE',      'UNDER_REVIEW', 'HIGH',     4, 'Ward 6 — Kondhwa',     'near Water Tank',          '411048', 18.463, 73.885, 10, NULL, NOW(6) - INTERVAL 8 DAY,  NOW(6) - INTERVAL 6 DAY,  NULL),
  (5,  'Frequent power cuts in the evening',           'The area faces frequent evening power cuts, disrupting work and study.',                                        'ELECTRICITY',   'SUBMITTED',    'MEDIUM',   5, 'Ward 1 — Kothrud',     'at Main Chowk',            '411038', 18.509, 73.805, 7,  NULL, NOW(6) - INTERVAL 2 DAY,  NOW(6) - INTERVAL 2 DAY,  NULL),
  (6,  'Streetlight not working for two weeks',        'The streetlight near the temple road junction has been off for two weeks, leaving the lane dark at night.',     'STREETLIGHT',   'CLOSED',       'LOW',      5, 'Ward 2 — Karve Nagar', 'near Temple Road',         '411052', 18.498, 73.815, 8,  6,    NOW(6) - INTERVAL 45 DAY, NOW(6) - INTERVAL 33 DAY, NOW(6) - INTERVAL 34 DAY),
  (7,  'Traffic signal not functioning',              'The traffic signal at the main chowk is not functioning, causing confusion during peak hours.',                 'TRAFFIC',       'SUBMITTED',    'HIGH',     6, 'Ward 4 — Erandwane',   'at Main Chowk',            '411004', 18.518, 73.823, 9,  NULL, NOW(6) - INTERVAL 3 DAY,  NOW(6) - INTERVAL 3 DAY,  NULL),
  (8,  'No water supply for three days',               'No water supply for three days behind the market yard; residents are struggling.',                             'WATER_SUPPLY',  'RESOLVED',     'MEDIUM',   3, 'Ward 6 — Kondhwa',     'behind Market Yard',       '411048', 18.461, 73.888, 10, 4,    NOW(6) - INTERVAL 20 DAY, NOW(6) - INTERVAL 14 DAY, NOW(6) - INTERVAL 14 DAY),
  (9,  'Aggressive stray dogs near park',              'A pack of aggressive stray dogs near the park is frightening morning walkers and children.',                    'STRAY_ANIMALS', 'REJECTED',     'LOW',      2, 'Ward 1 — Kothrud',     'near Temple Road',         '411038', 18.505, 73.809, 7,  NULL, NOW(6) - INTERVAL 15 DAY, NOW(6) - INTERVAL 12 DAY, NULL),
  (10, 'Loud construction noise late at night',        'Construction work opposite the petrol pump continues late at night, disturbing residents.',                    'NOISE',         'ASSIGNED',     'MEDIUM',   2, 'Ward 2 — Karve Nagar', 'opposite Petrol Pump',     '411052', 18.500, 73.818, 8,  3,    NOW(6) - INTERVAL 5 DAY,  NOW(6) - INTERVAL 3 DAY,  NULL);

-- ---------------------------------------------------------------------
--  Complaint timeline (audit trail)
-- ---------------------------------------------------------------------
INSERT INTO complaint_updates (complaint_id, from_status, to_status, remark, by_user_id, by_name, by_role, created_at) VALUES
  -- #1 pothole → RESOLVED
  (1, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           7, 'Suyog Shelke',         'CITIZEN', NOW(6) - INTERVAL 30 DAY),
  (1, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 28 DAY),
  (1, 'UNDER_REVIEW','ASSIGNED',     'Complaint assigned to the field officer for inspection.',                   2, 'Rahul Deshmukh',       'OFFICER', NOW(6) - INTERVAL 26 DAY),
  (1, 'ASSIGNED',    'IN_PROGRESS',  'Site inspection completed. Repair work has commenced.',                     2, 'Rahul Deshmukh',       'OFFICER', NOW(6) - INTERVAL 24 DAY),
  (1, 'IN_PROGRESS', 'RESOLVED',     'Work completed and verified on site. Issue has been resolved.',             2, 'Rahul Deshmukh',       'OFFICER', NOW(6) - INTERVAL 21 DAY),
  -- #2 garbage → IN_PROGRESS
  (2, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           8, 'Soham Shelke',         'CITIZEN', NOW(6) - INTERVAL 12 DAY),
  (2, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 10 DAY),
  (2, 'UNDER_REVIEW','ASSIGNED',     'Complaint assigned to the field officer for inspection.',                   3, 'Kavita Patil',         'OFFICER', NOW(6) - INTERVAL 7 DAY),
  (2, 'ASSIGNED',    'IN_PROGRESS',  'Site inspection completed. Repair work has commenced.',                     3, 'Kavita Patil',         'OFFICER', NOW(6) - INTERVAL 3 DAY),
  -- #3 water leakage → ASSIGNED
  (3, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           9, 'Meera Nair',           'CITIZEN', NOW(6) - INTERVAL 6 DAY),
  (3, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 5 DAY),
  (3, 'UNDER_REVIEW','ASSIGNED',     'Complaint assigned to the field officer for inspection.',                   4, 'Amit Joshi',           'OFFICER', NOW(6) - INTERVAL 4 DAY),
  -- #4 drainage → UNDER_REVIEW
  (4, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           10,'Imran Shaikh',         'CITIZEN', NOW(6) - INTERVAL 8 DAY),
  (4, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 6 DAY),
  -- #5 electricity → SUBMITTED
  (5, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           7, 'Suyog Shelke',         'CITIZEN', NOW(6) - INTERVAL 2 DAY),
  -- #6 streetlight → CLOSED
  (6, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           8, 'Soham Shelke',         'CITIZEN', NOW(6) - INTERVAL 45 DAY),
  (6, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 43 DAY),
  (6, 'UNDER_REVIEW','ASSIGNED',     'Complaint assigned to the field officer for inspection.',                   6, 'Priya Rane',           'OFFICER', NOW(6) - INTERVAL 41 DAY),
  (6, 'ASSIGNED',    'IN_PROGRESS',  'Site inspection completed. Repair work has commenced.',                     6, 'Priya Rane',           'OFFICER', NOW(6) - INTERVAL 38 DAY),
  (6, 'IN_PROGRESS', 'RESOLVED',     'Work completed and verified on site. Issue has been resolved.',             6, 'Priya Rane',           'OFFICER', NOW(6) - INTERVAL 34 DAY),
  (6, 'RESOLVED',    'CLOSED',       'Complaint closed after citizen confirmation.',                              6, 'Priya Rane',           'OFFICER', NOW(6) - INTERVAL 33 DAY),
  -- #7 traffic → SUBMITTED
  (7, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           9, 'Meera Nair',           'CITIZEN', NOW(6) - INTERVAL 3 DAY),
  -- #8 water supply → RESOLVED
  (8, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           10,'Imran Shaikh',         'CITIZEN', NOW(6) - INTERVAL 20 DAY),
  (8, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 18 DAY),
  (8, 'UNDER_REVIEW','ASSIGNED',     'Complaint assigned to the field officer for inspection.',                   4, 'Amit Joshi',           'OFFICER', NOW(6) - INTERVAL 17 DAY),
  (8, 'ASSIGNED',    'IN_PROGRESS',  'Site inspection completed. Repair work has commenced.',                     4, 'Amit Joshi',           'OFFICER', NOW(6) - INTERVAL 16 DAY),
  (8, 'IN_PROGRESS', 'RESOLVED',     'Work completed and verified on site. Issue has been resolved.',             4, 'Amit Joshi',           'OFFICER', NOW(6) - INTERVAL 14 DAY),
  -- #9 stray animals → REJECTED
  (9, NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           7, 'Suyog Shelke',         'CITIZEN', NOW(6) - INTERVAL 15 DAY),
  (9, 'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 13 DAY),
  (9, 'UNDER_REVIEW','REJECTED',     'Complaint could not be validated — insufficient or duplicate information.', 1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 12 DAY),
  -- #10 noise → ASSIGNED
  (10,NULL,          'SUBMITTED',    'Complaint submitted by citizen.',                                           8, 'Soham Shelke',         'CITIZEN', NOW(6) - INTERVAL 5 DAY),
  (10,'SUBMITTED',   'UNDER_REVIEW', 'Complaint reviewed and verified. Forwarding to the concerned department.',  1, 'System Administrator', 'ADMIN',   NOW(6) - INTERVAL 4 DAY),
  (10,'UNDER_REVIEW','ASSIGNED',     'Complaint assigned to the field officer for inspection.',                   3, 'Kavita Patil',         'OFFICER', NOW(6) - INTERVAL 3 DAY);

-- ---------------------------------------------------------------------
--  Feedback (on resolved / closed complaints)
-- ---------------------------------------------------------------------
INSERT INTO feedback (complaint_id, citizen_id, citizen_name, rating, comment, created_at, updated_at) VALUES
  (1, 7,  'Suyog Shelke', 5, 'Quick and satisfactory resolution. Thank you!',            NOW(6) - INTERVAL 20 DAY, NOW(6) - INTERVAL 20 DAY),
  (6, 8,  'Soham Shelke', 4, 'Resolved properly. Hope it stays fixed.',                  NOW(6) - INTERVAL 33 DAY, NOW(6) - INTERVAL 33 DAY),
  (8, 10, 'Imran Shaikh', 4, 'Issue was resolved well, though it took a little time.',   NOW(6) - INTERVAL 13 DAY, NOW(6) - INTERVAL 13 DAY);
