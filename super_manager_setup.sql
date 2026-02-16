-- ============================================================================
-- SUPER MANAGER ROLE & TASK ANALYTICS - DATABASE SETUP QUERIES
-- ============================================================================
-- This file contains SQL queries to set up and manage the Super Manager role
-- and Task Analytics feature in your Supabase/PostgreSQL database.
-- ============================================================================

-- ============================================================================
-- 1. VERIFY TODOS TABLE STRUCTURE
-- ============================================================================
-- Ensure the todos table has all required columns for task statistics

-- Check if todos table exists and has required columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;

-- If any columns are missing, add them:
-- (Uncomment and run only if needed)

-- ALTER TABLE todos 
-- ADD COLUMN IF NOT EXISTS username TEXT,
-- ADD COLUMN IF NOT EXISTS assigned_to TEXT,
-- ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
-- ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
-- ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ============================================================================
-- 2. VERIFY USERS TABLE STRUCTURE
-- ============================================================================
-- Ensure the users table has role and department columns

-- Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- If role or department columns are missing, add them:
-- (Uncomment and run only if needed)

-- ALTER TABLE users 
-- ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'User',
-- ADD COLUMN IF NOT EXISTS department TEXT;

-- ============================================================================
-- 2b. ADD MANAGER_ID COLUMN TO USERS TABLE (CRITICAL FOR TASK VISIBILITY)
-- ============================================================================
-- The manager_id column links a user to their manager.
-- This is REQUIRED for the task visibility logic to work correctly.
-- When a user creates a task, their manager (manager_id) will see it in their To-Do list.

-- Check if manager_id exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'manager_id';

-- Add manager_id column if missing (RUN THIS!)
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);

-- Example: Set manager for a user
-- UPDATE users SET manager_id = 'Ammar Jameel' WHERE username = 'Rohan Aslam';
-- UPDATE users SET manager_id = 'Ammar Jameel' WHERE username = 'Ahmad Qayyum';
-- UPDATE users SET manager_id = 'Ammar Jameel' WHERE username = 'Ahsan';
-- UPDATE users SET manager_id = 'Ammar Jameel' WHERE username = 'Usama Elahi';

-- View all users and their managers
-- SELECT username, role, manager_id FROM users ORDER BY manager_id, username;

-- ============================================================================
-- 2c. ADD MANAGER_ID COLUMN TO TODOS TABLE
-- ============================================================================
-- The manager_id on todos stores the assignee's manager at task creation time.
-- This ensures the manager can see tasks assigned to their team members.

ALTER TABLE todos ADD COLUMN IF NOT EXISTS manager_id TEXT;
CREATE INDEX IF NOT EXISTS idx_todos_manager_id ON todos(manager_id);

-- ============================================================================
-- 3. UPDATE USER TO SUPER MANAGER ROLE
-- ============================================================================
-- Set a user's role to "Super Manager"

-- Example: Update a specific user to Super Manager
-- UPDATE users 
-- SET role = 'Super Manager'
-- WHERE username = 'your_username_here';

-- View all users and their roles
SELECT username, role, department, email
FROM users
ORDER BY role, username;

-- ============================================================================
-- 4. TASK STATISTICS QUERIES (Manual Queries)
-- ============================================================================
-- These queries replicate what the Task Analytics dashboard shows

-- Get task statistics for all users (Super Manager view)
SELECT 
    u.username,
    u.role,
    COALESCE(u.department, 'N/A') as department,
    -- Tasks created by user
    COUNT(DISTINCT CASE WHEN t.username = u.username THEN t.id END) as total_created,
    COUNT(DISTINCT CASE WHEN t.username = u.username AND t.completed = true THEN t.id END) as completed_created,
    COUNT(DISTINCT CASE WHEN t.username = u.username AND t.completed = false THEN t.id END) as pending_created,
    -- Tasks assigned to user
    COUNT(DISTINCT CASE WHEN t.assigned_to = u.username THEN t.id END) as total_assigned,
    COUNT(DISTINCT CASE WHEN t.assigned_to = u.username AND t.completed = true THEN t.id END) as completed_assigned,
    COUNT(DISTINCT CASE WHEN t.assigned_to = u.username AND t.completed = false THEN t.id END) as pending_assigned,
    -- Completion rates
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN t.username = u.username THEN t.id END) > 0 
        THEN ROUND(
            (COUNT(DISTINCT CASE WHEN t.username = u.username AND t.completed = true THEN t.id END)::NUMERIC / 
             COUNT(DISTINCT CASE WHEN t.username = u.username THEN t.id END)::NUMERIC) * 100
        )
        ELSE 0 
    END as completion_rate_created,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN t.assigned_to = u.username THEN t.id END) > 0 
        THEN ROUND(
            (COUNT(DISTINCT CASE WHEN t.assigned_to = u.username AND t.completed = true THEN t.id END)::NUMERIC / 
             COUNT(DISTINCT CASE WHEN t.assigned_to = u.username THEN t.id END)::NUMERIC) * 100
        )
        ELSE 0 
    END as completion_rate_assigned
FROM users u
LEFT JOIN todos t ON (t.username = u.username OR t.assigned_to = u.username)
GROUP BY u.username, u.role, u.department
ORDER BY (
    COUNT(DISTINCT CASE WHEN t.username = u.username THEN t.id END) + 
    COUNT(DISTINCT CASE WHEN t.assigned_to = u.username THEN t.id END)
) DESC;

-- ============================================================================
-- 5. QUICK STATISTICS QUERIES
-- ============================================================================

-- Total tasks in system
SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE completed = true) as completed_tasks,
    COUNT(*) FILTER (WHERE completed = false) as pending_tasks,
    ROUND(
        (COUNT(*) FILTER (WHERE completed = true)::NUMERIC / 
         NULLIF(COUNT(*), 0)::NUMERIC) * 100, 
        2
    ) as overall_completion_rate
FROM todos;

-- Tasks by user (created)
SELECT 
    username,
    COUNT(*) as total_created,
    COUNT(*) FILTER (WHERE completed = true) as completed,
    COUNT(*) FILTER (WHERE completed = false) as pending
FROM todos
WHERE username IS NOT NULL
GROUP BY username
ORDER BY total_created DESC;

-- Tasks by user (assigned)
SELECT 
    assigned_to as username,
    COUNT(*) as total_assigned,
    COUNT(*) FILTER (WHERE completed = true) as completed,
    COUNT(*) FILTER (WHERE completed = false) as pending
FROM todos
WHERE assigned_to IS NOT NULL
GROUP BY assigned_to
ORDER BY total_assigned DESC;

-- Tasks by department
SELECT 
    COALESCE(u.department, 'N/A') as department,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.completed = true) as completed_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.completed = false) as pending_tasks
FROM todos t
LEFT JOIN users u ON (t.username = u.username OR t.assigned_to = u.username)
GROUP BY u.department
ORDER BY total_tasks DESC;

-- ============================================================================
-- 6. USER ROLE MANAGEMENT
-- ============================================================================

-- List all Super Managers
SELECT username, email, role, department, last_login
FROM users
WHERE role = 'Super Manager'
ORDER BY username;

-- List all Managers (including Super Managers)
SELECT username, email, role, department, last_login
FROM users
WHERE role IN ('Manager', 'Super Manager')
ORDER BY role, username;

-- Count users by role
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- ============================================================================
-- 7. DATA VALIDATION QUERIES
-- ============================================================================

-- Check for tasks with missing usernames
SELECT COUNT(*) as tasks_without_creator
FROM todos
WHERE username IS NULL OR username = '';

-- Check for tasks with invalid assigned users
SELECT t.id, t.assigned_to
FROM todos t
LEFT JOIN users u ON t.assigned_to = u.username
WHERE t.assigned_to IS NOT NULL 
  AND t.assigned_to != ''
  AND u.username IS NULL;

-- Check for users without tasks
SELECT u.username, u.role, u.department
FROM users u
LEFT JOIN todos t ON (t.username = u.username OR t.assigned_to = u.username)
WHERE t.id IS NULL
ORDER BY u.username;

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE (Optional but Recommended)
-- ============================================================================
-- These indexes will improve query performance for task statistics

-- Index on todos.username for faster lookups
CREATE INDEX IF NOT EXISTS idx_todos_username ON todos(username);

-- Index on todos.assigned_to for faster lookups
CREATE INDEX IF NOT EXISTS idx_todos_assigned_to ON todos(assigned_to);

-- Index on todos.completed for filtering
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

-- Index on users.role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index on users.department for department-based queries
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_todos_user_completed ON todos(username, completed);
CREATE INDEX IF NOT EXISTS idx_todos_assigned_completed ON todos(assigned_to, completed);

-- ============================================================================
-- 9. EXAMPLE: SETUP A SUPER MANAGER
-- ============================================================================
-- Replace 'admin' with the actual username you want to make a Super Manager

-- UPDATE users 
-- SET role = 'Super Manager'
-- WHERE username = 'admin';

-- Verify the change
-- SELECT username, role, email 
-- FROM users 
-- WHERE username = 'admin';

-- ============================================================================
-- END OF SQL QUERIES
-- ============================================================================

-- ============================================================================
-- 10. TASK COMPLETION APPROVAL COLUMNS
-- ============================================================================
-- These columns support the task completion approval workflow:
-- When a non-creator completes a task, it goes to the creator for approval.
-- Only after the creator approves, the task is marked as completed.

ALTER TABLE todos
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS completed_by TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS declined_by TEXT,
ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Index for approval status filtering
CREATE INDEX IF NOT EXISTS idx_todos_approval_status ON todos(approval_status);

-- Set existing tasks to 'approved' status if null
UPDATE todos SET approval_status = 'approved' WHERE approval_status IS NULL;

-- ============================================================================
-- 11. TASK STATUS COLUMN FOR KANBAN BOARD
-- ============================================================================
-- The task_status column supports the 4-column Kanban board:
-- - 'backlog': Tasks that are waiting to be started
-- - 'todo': Tasks ready to be worked on
-- - 'in_progress': Tasks currently being worked on
-- - 'done': Completed tasks
-- This is separate from the 'completed' boolean for more granular workflow tracking.

ALTER TABLE todos
ADD COLUMN IF NOT EXISTS task_status TEXT DEFAULT 'todo';

-- Create index for faster Kanban filtering
CREATE INDEX IF NOT EXISTS idx_todos_task_status ON todos(task_status);

-- Migrate existing data: set task_status based on completed flag
UPDATE todos SET task_status = 'done' WHERE completed = true AND (task_status IS NULL OR task_status = 'todo');
UPDATE todos SET task_status = 'todo' WHERE completed = false AND (task_status IS NULL OR task_status = '');

-- View task status distribution
SELECT task_status, COUNT(*) as count 
FROM todos 
GROUP BY task_status 
ORDER BY task_status;

-- ============================================================================
-- 12. PACKAGE MANAGEMENT TABLES
-- ============================================================================
-- Packages feature allows managers to create package names and assign them
-- to users. When creating tasks, users can select from their assigned packages.

-- Packages table: stores all package names
CREATE TABLE IF NOT EXISTS packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- User-Package assignments: maps users to their assigned packages
CREATE TABLE IF NOT EXISTS user_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by TEXT,
    UNIQUE(username, package_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_user_packages_username ON user_packages(username);
CREATE INDEX IF NOT EXISTS idx_user_packages_package_id ON user_packages(package_id);

-- Add package_name column to todos table for task-level tracking
ALTER TABLE todos ADD COLUMN IF NOT EXISTS package_name TEXT;
CREATE INDEX IF NOT EXISTS idx_todos_package_name ON todos(package_name);

-- View all packages
-- SELECT * FROM packages ORDER BY name;

-- View user-package assignments with package names
-- SELECT up.username, p.name as package_name, up.assigned_at
-- FROM user_packages up
-- JOIN packages p ON up.package_id = p.id
-- ORDER BY up.username, p.name;
