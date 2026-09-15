-- =====================================================================
--  Civic-Pulse — Smart Civic Issue Resolution & Monitoring System
--  MySQL 8.x schema (reference DDL)
-- ---------------------------------------------------------------------
--  The Spring Boot application runs with `spring.jpa.hibernate.ddl-auto=update`,
--  so Hibernate creates and evolves these tables automatically on start-up —
--  you normally do NOT need to run this file.
--
--  It is provided for:
--    * documenting the physical data model (for the project report / synopsis),
--    * DBAs who prefer to create the schema manually (set ddl-auto=none/validate),
--    * quick inspection of columns, keys and indexes.
--
--  Column names use Hibernate's default snake_case mapping.
--  Booleans are stored as TINYINT(1); Instant timestamps as DATETIME(6).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS civicpulse
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civicpulse;

-- Drop in reverse dependency order (safe re-run)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS complaint_updates;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
--  departments — civic departments complaints are routed to
-- ---------------------------------------------------------------------
CREATE TABLE departments (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    head        VARCHAR(255) NULL,
    email       VARCHAR(255) NULL,
    phone       VARCHAR(255) NULL,
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_departments_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  users — one table backs all three roles (ADMIN / OFFICER / CITIZEN)
--          role-specific columns are simply left NULL where unused
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    role           VARCHAR(20)  NOT NULL,               -- ADMIN | OFFICER | CITIZEN
    full_name      VARCHAR(255) NOT NULL,
    email          VARCHAR(255) NOT NULL,
    phone          VARCHAR(15)  NULL,
    password_hash  VARCHAR(255) NOT NULL,               -- BCrypt hash
    ward           VARCHAR(255) NULL,                   -- citizen / admin
    address        VARCHAR(255) NULL,                   -- citizen / admin
    pincode        VARCHAR(255) NULL,                   -- citizen / admin
    designation    VARCHAR(255) NULL,                   -- officer
    department_id  BIGINT       NULL,                   -- officer
    active         TINYINT(1)   NOT NULL DEFAULT 1,
    created_at     DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_role (role),
    KEY idx_users_department (department_id),
    CONSTRAINT fk_users_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  complaints — the aggregate root; children live in their own tables
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    title                VARCHAR(150) NOT NULL,
    description          TEXT         NOT NULL,
    category             VARCHAR(30)  NOT NULL,          -- see Category enum
    status               VARCHAR(20)  NOT NULL,          -- see ComplaintStatus enum
    priority             VARCHAR(20)  NOT NULL,          -- LOW | MEDIUM | HIGH | CRITICAL
    department_id        BIGINT       NULL,
    ward                 VARCHAR(255) NOT NULL,
    landmark             VARCHAR(255) NULL,
    pincode              VARCHAR(255) NULL,
    latitude             DOUBLE       NULL,
    longitude            DOUBLE       NULL,
    citizen_id           BIGINT       NOT NULL,
    assigned_officer_id  BIGINT       NULL,
    created_at           DATETIME(6)  NULL,
    updated_at           DATETIME(6)  NULL,
    resolved_at          DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_complaints_status (status),
    KEY idx_complaints_category (category),
    KEY idx_complaints_priority (priority),
    KEY idx_complaints_ward (ward),
    KEY idx_complaints_department (department_id),
    KEY idx_complaints_citizen (citizen_id),
    KEY idx_complaints_officer (assigned_officer_id),
    KEY idx_complaints_created (created_at),
    CONSTRAINT fk_complaints_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_citizen FOREIGN KEY (citizen_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaints_officer FOREIGN KEY (assigned_officer_id)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  attachments — evidence photos (problem + resolution)
-- ---------------------------------------------------------------------
CREATE TABLE attachments (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    complaint_id  BIGINT       NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    content_type  VARCHAR(255) NULL,
    size          BIGINT       NULL,
    url           VARCHAR(255) NOT NULL,
    resolution    TINYINT(1)   NOT NULL DEFAULT 0,       -- 1 = resolution photo
    created_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_attachments_complaint (complaint_id),
    CONSTRAINT fk_attachments_complaint FOREIGN KEY (complaint_id)
        REFERENCES complaints (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  complaint_updates — the audit trail / status timeline
--                      actor name & role are denormalised for stability
-- ---------------------------------------------------------------------
CREATE TABLE complaint_updates (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    complaint_id  BIGINT       NOT NULL,
    from_status   VARCHAR(20)  NULL,
    to_status     VARCHAR(20)  NULL,
    remark        TEXT         NULL,
    by_user_id    BIGINT       NULL,
    by_name       VARCHAR(255) NULL,
    by_role       VARCHAR(20)  NULL,
    created_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_updates_complaint (complaint_id),
    CONSTRAINT fk_updates_complaint FOREIGN KEY (complaint_id)
        REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_updates_user FOREIGN KEY (by_user_id)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  feedback — one satisfaction rating per resolved complaint
-- ---------------------------------------------------------------------
CREATE TABLE feedback (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    complaint_id  BIGINT       NOT NULL,
    citizen_id    BIGINT       NOT NULL,
    citizen_name  VARCHAR(255) NULL,
    rating        INT          NOT NULL,                 -- 1..5
    comment       TEXT         NULL,
    created_at    DATETIME(6)  NULL,
    updated_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_feedback_complaint (complaint_id),
    KEY idx_feedback_citizen (citizen_id),
    CONSTRAINT fk_feedback_complaint FOREIGN KEY (complaint_id)
        REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_citizen FOREIGN KEY (citizen_id)
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
