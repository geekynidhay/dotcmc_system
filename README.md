# DOT-CMC Next-Gen Management System

Comprehensive, high-performance center management platform with:
- **Cloud Database & Auth**: Supabase (PostgreSQL) - Zero cost, high concurrency.
- **Mobile App**: Flutter app for students (Fee checks, UPI Payments, Attendance, Study Materials & Notices).
- **Admin Dashboard**: Center Web Portal for notices, attendance management, course & fee tracking.
- **Automated WhatsApp**: Self-hosted OpenWA integration.
- **Zero-Fee UPI Gateway**: YouPI-PG integration.

---

## Architecture & Folders

- `supabase/`: Database schemas, real data migration scripts, and Row Level Security (RLS) policies.
- `mobile_app/`: Flutter mobile application for students.
- `admin_dashboard/`: Web administration dashboard.
- `integrations/`: OpenWA WhatsApp bot and YouPI-PG payment gateway configs.

---

## Database Setup (Supabase)

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project (e.g. `dotcmc-fees`).
3. Open the **SQL Editor** in Supabase and run:
   - `supabase/01_schema.sql` (Creates all tables, attendance, updates, UPI transactions)
   - `supabase/02_real_data.sql` (Imports real student, fee, and course data)
