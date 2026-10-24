-- Drop strict foreign key constraints that prevent historical legacy records from loading
ALTER TABLE student_ef_list DROP CONSTRAINT IF EXISTS student_ef_list_course_id_fkey;
ALTER TABLE fees DROP CONSTRAINT IF EXISTS fees_course_id_fkey;
ALTER TABLE student_ef_list DROP CONSTRAINT IF EXISTS student_ef_list_student_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_ef_id_fkey;
