-- Create student_login_otps table for real-time mobile app login
CREATE TABLE IF NOT EXISTS student_login_otps (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(id) ON DELETE CASCADE,
    ef_id INT REFERENCES student_ef_list(id) ON DELETE CASCADE,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_otps ON student_login_otps(student_id, otp);
