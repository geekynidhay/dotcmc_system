-- Supabase PostgreSQL Schema for DOT-CMC System
-- Cleaned and migrated from sfps_db.sql

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    level VARCHAR(150) DEFAULT '',
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fees Breakdown Structure
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 3. Student Table
CREATE TABLE IF NOT EXISTS student (
    id SERIAL PRIMARY KEY,
    id_no VARCHAR(100) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    contact VARCHAR(100) DEFAULT '',
    address TEXT DEFAULT '',
    email VARCHAR(200) DEFAULT '',
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Student Enrollment / Fee Ledger (student_ef_list)
CREATE TABLE IF NOT EXISTS student_ef_list (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(id) ON DELETE CASCADE,
    ef_no VARCHAR(200) NOT NULL UNIQUE,
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    total_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payments History
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    ef_id INT REFERENCES student_ef_list(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    remarks TEXT DEFAULT '',
    mode VARCHAR(50) DEFAULT 'Cash',
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(200) DEFAULT '',
    contact VARCHAR(20) DEFAULT '',
    cover_img TEXT DEFAULT '',
    about_content TEXT DEFAULT ''
);

-- 7. Admin / Staff Users
CREATE TABLE IF NOT EXISTS center_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    username VARCHAR(200) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    type SMALLINT DEFAULT 1 -- 1=Admin, 2=Staff
);

-- 8. NEW: Attendance Tracking
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Present', -- Present, Absent, Late
    remarks TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date)
);

-- 9. NEW: Notices, Updates, YouTube Videos & Study Material
CREATE TABLE IF NOT EXISTS updates_and_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'notice', -- 'notice', 'youtube_video', 'study_material', 'assignment'
    description TEXT DEFAULT '',
    url TEXT DEFAULT '', -- YouTube link or storage document URL
    file_type VARCHAR(20) DEFAULT '', -- 'pdf', 'video', 'link'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. NEW: Online UPI Transactions (YouPI-PG integration log)
CREATE TABLE IF NOT EXISTS upi_transactions (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(id) ON DELETE SET NULL,
    ef_id INT REFERENCES student_ef_list(id) ON DELETE SET NULL,
    txn_ref_id VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payer_upi VARCHAR(100) DEFAULT '',
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
