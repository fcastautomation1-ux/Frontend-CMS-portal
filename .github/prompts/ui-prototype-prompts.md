# UI Prototype Prompts for Enterprise CMS Portal

**Purpose**: Generate high-fidelity React + Tailwind prototypes for all 9 pages locally in VS Code using Copilot Chat.

**Design Direction**: Modern enterprise UI with clean typography, intentional spacing, accessible interactions, and consistent component library.

**Project Context** (Reference for all pages):

## ENTERPRISE CMS PORTAL OVERVIEW

**Current System Being Migrated**:
- Google Apps Script (GAS) monolithic application
- 10,195-line HTML frontend (ugly, unresponsive, desktop-only)
- Google Sheets backend via Supabase PostgreSQL
- 5 user roles with RBAC (Admin, Super Manager, Manager, Supervisor, User)
- 8 main modules: Users, Accounts, Campaigns, Drive, Reports, Tasks, Settings, Dashboard
- Multi-department structure with hierarchical workflows
- Integration with Google APIs (Drive, Sheets, Ads)

**New Stack** (Next.js 14 + Tailwind):
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL (no schema changes)
- **Hosting**: Vercel (free tier)
- **Cost**: $0/month
- **Timeline**: 1-2 weeks MVP
- **Scope**: 100% feature parity + modern UI only (no new features)

**User Roles & Permissions** (implement visibility in all pages):
1. **Admin**: Full access to all modules, user management, settings, impersonation
2. **Super Manager**: Manage multiple departments, override approvals, view reports
3. **Manager**: Team management, task approvals, campaign configuration
4. **Supervisor**: Team oversight, basic approvals, read-only reports
5. **User**: Create tasks, submit campaigns, view own data

**Department Structure**:
- Users belong to 1+ departments
- Task approval chains are department-based
- File access is department-based
- Reports filtered by department

**Key Business Rules** (enforce in UI):
- No user registration (login only)
- Login: username/password + Google email verification (check user's logged-in email)
- Tasks require approval chain before completion
- Files auto-archived after 14 days (old to MinIO, new to Supabase)
- Desktop notifications only (no email system)
- Campaign sync from Google Sheets (batch operation)
- Drive operations: browse, create (Sheet/Doc/Slides), upload, share

**Key Rules**:
- ✅ Same functionality as current system (no features added/removed)
- ✅ Responsive (desktop 1440px + mobile 390px)
- ✅ Accessible (WCAG AA contrast, keyboard navigation, screen readers)
- ✅ Component-reusable (extract shadcn/ui patterns for library)
- ✅ Sample realistic data included (at least 5-10 rows/items per section)
- ✅ All user states (loading skeletal, empty, error, success toast)
- ✅ Permission-based visibility (show/hide based on user role)
- ✅ Mobile-first responsive (works at 390px, 768px, 1024px, 1440px)
- ✅ Persistent sidebar + top nav on all pages
- ✅ Consistent design system (colors, typography, spacing, icons)

---

## 🎯 Master Brief (Use for ALL pages)

Copy this + append page-specific brief below:

```
Design a production-grade responsive UI prototype for an enterprise CMS portal.

CRITICAL CONSTRAINTS:
- Maintain 100% same functionality as existing system
- No new features, no registration flow
- Login: username/password only + Google email verification concept
- Modern, accessible UI design (WCAG AA)
- Desktop-first, fully mobile responsive
- Use React + Tailwind CSS + shadcn/ui patterns when relevant

VISUAL DIRECTION:
- Clean, professional typography (avoid Inter/Roboto/Arial)
- Distinctive color system with clear hierarchy
- Polished spacing and micro-interactions
- Data-heavy UX (tables, filters, forms work with 100+ rows)
- Dark mode optional but appreciated

REQUIRED ELEMENTS FOR EVERY PAGE:
- Persistent top navigation (logo, user menu, search)
- Sidebar navigation (collapsible for mobile)
- Page header with breadcrumbs and primary action
- Table, card, or form content (with sample realistic data)
- Loading state (skeleton screens or spinners)
- Empty state (when no data)
- Error state (with recovery action)
- Success state (toast feedback)
- Modal/drawer for create/edit actions where relevant
- Role-based visibility (show different content based on user role)

OUTPUT:
- Full working React component
- Reusable sub-components (Button, Input, Badge, etc.)
- Sample data included
- Responsive breakpoints (1440px, 1024px, 768px, 390px)
- Desktop + Mobile variant screenshots in comments
```

---

## 📄 Page 1: LOGIN

```
Design a login page for an enterprise CMS portal (production-grade).

CRITICAL CONSTRAINTS:
- Same login flow as current system: username/password only
- Google email verification (logged-in user's email check, no OAuth signup)
- No registration option anywhere
- Error messages for invalid credentials
- Show password toggle
- Remember me checkbox (optional)
- Loading state during login attempt

VISUAL DIRECTION:
- Centered card layout OR asymmetric hero + form split
- Distinctive, memorable design (avoid generic login look)
- High contrast for accessibility
- Smooth animations on focus/submit
- Clear error states in red

INCLUDE:
- Logo/branding
- Username input with validation
- Password input with show/hide toggle
- Google email verification indicator (small text explaining current user's email)
- "Login" button (disabled while loading)
- Error message component (for failed login)
- Success feedback (redirect to dashboard)
- Responsive: works at 390px (mobile) and 1440px (desktop)
- Skeleton state while checking credentials

OUTPUT:
- React component with form validation
- TypeScript types for form state
- Realistic error handling
- Mobile + Desktop layout
- No OAuth/signup elements
```

---

## 📊 Page 2: DASHBOARD

```
Design a dashboard page for an enterprise CMS portal (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- User info card (name, role, department)
- Quick stats (total accounts, active campaigns, pending tasks)
- Recent activity feed
- Navigation to all modules

VISUAL DIRECTION:
- Grid-based layout with polished cards
- Clear visual hierarchy (important data prominent)
- Icons + charts where relevant
- Status color codes (green/yellow/red)

INCLUDE:
- Top nav + sidebar (both persistent)
- Page header: "Dashboard"
- User profile section (avatar, name, role, department)
- Stats grid (4 cards: accounts, campaigns, tasks, workflows)
- Activity timeline or feed (recent changes, approvals, uploads)
- Quick-access buttons to main modules (Users, Accounts, Campaigns, Drive, etc.)
- Loading skeletal screens
- Empty state for new users
- Dark mode consideration

OUTPUT:
- React dashboard component
- Card sub-components reusable
- Sample user data + mock activity
- Responsive grid (4 cols → 2 cols → 1 col on mobile)
- Performance optimized (lazy-load activity feed)
```

---

## 👥 Page 3: USERS MODULE

```
Design a users management page (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- List all users in searchable, sortable table
- Filters: role, department, active/inactive
- Add user button (opens modal)
- Edit user (inline or modal)
- Delete user with confirmation
- Bulk actions (enable/disable multiple users)
- Only admins/managers can create/edit users

VISUAL DIRECTION:
- Data-heavy table with excellent readability
- Inline actions (edit, delete, view)
- Modal for create/edit forms
- Status badges (Active, Inactive)
- Clear role indicators

INCLUDE:
- Sidebar + top nav
- Page header: "Users"
- Search bar (search by name, email, username)
- Filters: Role dropdown, Department dropdown, Status toggle
- Table columns: Username, Email, Name, Role, Department, Status, Actions
- Row actions: Edit, Delete, View Details
- Add User button → modal with form
- Edit modal: Update role, department, email preferences, password
- Role-based visibility: Only show users current user can manage
- Bulk select checkbox (select all, bulk enable/disable)
- Loading state: skeleton rows
- Empty state: "No users found"
- Pagination: 25, 50, 100 rows per page
- Success toast: "User created/updated/deleted"
- Confirmation dialog on delete

OUTPUT:
- React table component (reusable)
- UserModal component for create/edit
- Search + filter logic
- Sample user data (realistic)
- Pagination component
- Mobile: table scrolls, dropdown on action menu
- Desktop: full inline actions
```

---

## 🏢 Page 4: ACCOUNTS MODULE

```
Design a Google Ads accounts management page (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- Display accounts as cards or table
- Show customer ID, status (Pending/Active), assigned workflow
- Add account button → modal
- Edit account: assign workflow, link Google Sheet
- Delete account with confirmation
- Batch enable/disable accounts
- Filter by status, workflow, manager
- Search accounts by ID or name

VISUAL DIRECTION:
- Card layout for desktop (3 cols) OR table view toggle
- Visual status indicators (green/yellow/red)
- Clear hierarchy (ID, status prominent)
- Workflow tag/badge

INCLUDE:
- Sidebar + top nav
- Page header: "Accounts"
- View toggle: Cards ↔ Table
- Add Account button → modal
- Search bar (search by customer ID, account name)
- Filters: Status (dropdown), Assigned Workflow, Manager
- Card layout (3 columns on desktop):
  - Customer ID
  - Account name
  - Status badge (Pending/Active)
  - Assigned workflow
  - Google Sheet link indicator
  - Menu: Edit, Delete, View Campaigns
- Table layout option:
  - Columns: ID, Name, Status, Workflow, Manager, Last Modified, Actions
- Edit modal: Account name, Workflow assignment, Google Sheet URL, status toggle
- Batch actions: Select multiple → Enable/Disable/Delete
- Loading state: skeleton cards/rows
- Empty state: "No accounts"
- Success toast: "Account created/updated"
- Confirmation on delete

OUTPUT:
- React AccountCard component (reusable)
- AccountTable component (reusable)
- AccountModal for create/edit
- View toggle logic
- Sample account data
- Mobile: cards stack, table scrolls
- Desktop: 3-col grid or table
```

---

## 📋 Page 5: CAMPAIGNS MODULE

```
Design a campaigns configuration page (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- Select account → shows campaigns for that account
- Campaign grid/table with conditions
- Edit removal conditions per campaign
- Batch save updated conditions
- Sync campaigns from Google Sheet
- Filter by campaign status, condition count
- Search campaigns by name

VISUAL DIRECTION:
- Campaign condition builder UI (not complex form, more visual)
- Condition pills/badges
- Clear add/remove actions
- Status indicators

INCLUDE:
- Sidebar + top nav
- Page header: "Campaigns"
- Account selector dropdown (shows accounts user has access to)
- Sync from Sheet button → shows sync status/progress
- Search bar (campaign name)
- Filters: Status, Has Conditions (yes/no)
- Table or grid view:
  - Campaign name
  - Customer ID
  - Condition count (badge)
  - Last updated date
  - Status (Enabled/Disabled toggle)
  - Actions (Edit, View)
- Edit campaign modal:
  - Campaign name (read-only)
  - Condition builder:
    - "Add Condition" button
    - List of current conditions (editable pills)
    - Condition template selector (dropdown with pre-built conditions)
    - Remove condition (X button on each)
  - Enable/Disable toggle
  - Save button
- Batch actions: Select multiple campaigns → Bulk enable/disable
- Loading state: skeleton rows
- Empty state: "Select an account or sync from Google Sheet"
- Sync progress indicator: "Synced 45 of 100 campaigns..."
- Success toast: "Conditions saved for 10 campaigns"
- Confirmation on bulk operations

OUTPUT:
- React CampaignTable component
- ConditionBuilder sub-component
- CampaignModal for editing
- Account selector logic
- Sync trigger + status tracking
- Sample campaign + condition data
- Mobile: table scrolls, condition builder in drawer
- Desktop: full inline editing or modal
```

---

## 📁 Page 6: DRIVE MANAGER

```
Design a Google Drive file browser + manager (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- Browse folder hierarchy
- Search files by name
- Upload files (drag-drop or click)
- Create new files (Sheets, Docs, Slides)
- View file metadata (size, date, owner)
- Open files in Google Drive
- Move files to task folders
- Sync permissions with user's Google account
- Breadcrumb navigation
- File icons by type

VISUAL DIRECTION:
- Clean file explorer UI
- File type icons
- Drag-drop zone
- Progress indicators for uploads
- Clear breadcrumb trail

INCLUDE:
- Sidebar + top nav
- Page header: "Drive Manager"
- Breadcrumb navigation: Home > Folder > Subfolder
- Create menu (dropdown):
  - New Folder
  - New Google Sheet
  - New Google Doc
  - New Google Slides
- Upload area (click or drag-drop)
- File list (table or grid):
  - File icon + name
  - Type (Folder, Sheet, Doc, etc.)
  - Size
  - Last modified
  - Owner
  - Actions: Download, Share, Move, Delete
- Search bar (file name search)
- Loading state: skeleton rows while fetching
- Empty state: "This folder is empty"
- Upload progress: file upload status bar
- Success toast: "File created / Uploaded"
- Confirmation on delete
- Permission sync status: "Synced with your Google account" or "Sync required"
- Mobile: card layout, actions in dropdown menu
- Desktop: table with inline actions

OUTPUT:
- React FileBrowser component
- FileList (table or grid) sub-component
- UploadZone component (drag-drop)
- BreadcrumbNav component
- Folder navigation logic
- Sample folder structure + files
- Pagination for large folders
- Error handling (permission errors, upload failures)
```

---

## 📊 Page 7: LOOKER REPORTS

```
Design a Looker Reports embedding page (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- List all available reports (user has access to)
- Embed reports as iframes
- Filter reports by category/name
- Report metadata (title, description, last updated)
- User-specific report access control

VISUAL DIRECTION:
- Report cards with embedded previews
- Clear metadata
- Loading state for embedded iframes
- Clean spacing between reports

INCLUDE:
- Sidebar + top nav
- Page header: "Reports"
- Search bar (report name)
- Filter: Category dropdown, Date range
- Report grid (2-3 cols on desktop):
  - Report title
  - Description
  - Last updated date
  - Embedded iframe (with loading skeleton)
  - View Full Report button (opens in new tab)
- Loading state: skeleton cards with embedded spinner
- Empty state: "No reports available for your role"
- Error state: "Failed to load report" + Retry button
- Access control: only show reports user has permission for
- Mobile: 1 col, full width reports
- Desktop: 2-3 col grid

OUTPUT:
- React ReportGrid component
- ReportCard sub-component with embedded iframe
- Search + filter logic
- Sample report data
- Error boundary around iframes
- Skeleton loading state
- Role-based report filtering
```

---

## ✅ Page 8: TASKS / TODOS (COMPREHENSIVE SPECIFICATION)

### 🎯 REQUIREMENTS OVERVIEW

**SAME FUNCTIONALITY AS CURRENT**:
- Create, edit, delete tasks
- Assign tasks to users/departments
- Multi-level approval workflows (approver chain)
- File attachments (upload, download, delete)
- Task sharing with other users
- Department-based task queues
- Status tracking (Open → Pending Approval → Approved/Declined → Completed)
- Comments/notes on tasks
- Due date tracking
- Priority levels (High, Medium, Low)
- Task search by title/description
- Filter by: Status, Priority, Assigned To, Created By, Department, Awaiting Approval
- Bulk actions (select multiple → Mark Complete, Assign, Delete)
- Task history (who created, edited, approved/declined with timestamps)

**USER ROLES & VISIBILITY**:
- **Regular User**: Create tasks, view assigned/shared tasks, add comments, upload files, complete tasks
- **Manager**: All regular + approve/decline tasks, view team tasks, reassign tasks
- **Admin**: All permissions, view all tasks, impersonate users
- Department hierarchy: Show only tasks for user's department + shared tasks

---

### 📱 PAGE STRUCTURE & COMPONENTS

```
LAYOUT:
┌─────────────────────────────────────────────────┐
│  [Logo] TASKS          [Search] [Profile] [ℹ]   │  ← Top Nav (persistent)
├────┬───────────────────────────────────────────┤
│    │  Filters              [+ New Task] [⋮]     │  ← Page Header (breadcrumb, actions)
│ S  │  ┌─────────────────────────────────────┐  │
│ I  │  │ [Status ▼] [Priority ▼] [My Tasks]  │  │  ← Filter Bar
│ D  │  │ [Department ▼] [Due ▼] [Clear All]  │  │
│ E  │  └─────────────────────────────────────┘  │
│ B  │                                            │
│ A  │  TASK LIST (Tabs: All / Assigned / Created) │
│ R  │  ┌─────────────────────────────────────┐  │
│    │  │ ☐ Task Title [HIGH] [Pending]        │◄─ Task Row (desktop)
│    │  │ Assigned to: John | Due: Jan 15      │
│    │  │ [Edit] [Approve] [Decline] [Delete]  │
│ P  │  └─────────────────────────────────────┘
│ A  │  ┌─────────────────────────────────────┐
│ G  │  │ ☐ Another Task [MED] [Open]          │
│ E  │  │ Assigned: Dept Marketing | Due: Jan 20│
│    │  │ [Edit] [Approve] [Decline] [Delete]  │
│    │  └─────────────────────────────────────┘
│    │
│    │  [← Previous] [1] [2] [3] [Next →]        │ ← Pagination
│    │                                            │
└────┴───────────────────────────────────────────┘
```

---

### 🎨 DETAILED COMPONENTS

#### 1️⃣ TOP NAV BAR (Persistent)
```
LEFT SIDE:
  [≡] Logo "CMS PORTAL" [⌄]
  
CENTER/RIGHT:
  [🔍 Search tasks...] [🔔] [👤 John Doe ⌄]
  
Dropdown (👤 John Doe ⌄):
  - My Profile
  - Settings
  - Logout
```
**Button Text**: 
- "Search tasks..." (placeholder)
- "My Profile"
- "Settings"
- "Logout"

---

#### 2️⃣ PAGE HEADER
```
BREADCRUMB: Dashboard > Tasks

TITLE: "Tasks"
SUBTITLE: "Manage your tasks and approvals"

ACTIONS (RIGHT SIDE):
  [+ New Task] / [⋮ More]
  
Dropdown (⋮ More):
  - Bulk Edit
  - Bulk Delete
  - Export CSV
  - Print
  - Help
```
**Button Text**:
- "+ New Task"
- "Bulk Edit"
- "Bulk Delete"
- "Export CSV"
- "Print"
- "Help"

---

#### 3️⃣ FILTER BAR (Below Header)
```
ROW 1:
  [Status ▼: All]
  [Priority ▼: All]
  [My Tasks (Toggle)]
  [Awaiting My Approval (Toggle)]

ROW 2:
  [Department ▼: All]
  [Due Date ▼: All]
  [Assigned To ▼: All]
  [Clear All Filters]

SEARCH (Integrated):
  [🔍 Search by title or description...]
```
**Button Text & Values**:
- "Status" options: "All", "Open", "Pending Approval", "Approved", "Declined", "Completed"
- "Priority" options: "All", "High", "Medium", "Low"
- "Department" options: "All", [list of depts]
- "Due Date" options: "All", "Today", "This Week", "This Month", "Overdue"
- "Assigned To" options: "All", [list of users]
- "My Tasks" toggle label
- "Awaiting My Approval" toggle label
- "Clear All Filters"
- Search placeholder: "Search by title or description..."

---

#### 4️⃣ TASK LIST (Table/Card View Toggle)
```
VIEW TOGGLE: [≣ Table] [≢ Cards]

TABLE COLUMNS (DESKTOP):
  ☐ | Title | Assigned To | Department | Priority | Status | Due Date | Actions

ROWS (SORTABLE BY CLICKING HEADERS):
  ☐ Task Title          John Doe     Marketing    HIGH    Pending  Jan 15   [⋮]
     
     Approval needed from: Sarah (Manager)
     
     [Edit] [Approve] [Decline] [Download Files] [View Details] [Delete]

CARD VIEW (MOBILE/TABLET):
  ┌─────────────────────┐
  │ Task Title [HIGH]   │
  │ Pending Approval    │
  │                     │
  │ Assigned: John Doe  │
  │ Department: Mkt     │
  │ Due: Jan 15         │
  │                     │
  │ Awaiting: Sarah     │
  │                     │
  │ [Edit] [View More]  │
  │ [Approve] [Decline] │
  │ [Delete]            │
  └─────────────────────┘
```
**Button Text & Labels**:
- Column headers: "Title", "Assigned To", "Department", "Priority", "Status", "Due Date"
- Status badges: "Open", "Pending Approval", "Approved", "Declined", "Completed"
- Priority badges: "HIGH", "MEDIUM", "LOW"
- Action buttons:
  - "[Edit]" - opens TaskModal
  - "[Approve]" - approve task (if user is approver)
  - "[Decline]" - decline with reason modal
  - "[Download Files]" - shows attachment download menu
  - "[View Details]" - full task modal
  - "[Delete]" - delete with confirmation
  - "[⋮]" - dropdown menu with all actions

**Hover/Active States**:
- Row background changes color on hover
- Buttons have subtle shadow lift on hover
- Selected rows (checkbox ☐) show blue background
- Status badges have distinct colors:
  - Open: Blue
  - Pending Approval: Yellow/Orange
  - Approved: Green
  - Declined: Red
  - Completed: Gray

---

#### 5️⃣ TABS (Below Header)
```
[All Tasks] [Assigned to Me] [Created by Me] [Awaiting My Approval]

Counts:
[All Tasks (42)] [Assigned to Me (8)] [Created by Me (15)] [Awaiting My Approval (3)]
```
**Tab Labels & Counts**:
- "All Tasks" → shows all
- "Assigned to Me" → filter by assigned_to = current_user
- "Created by Me" → filter by created_by = current_user
- "Awaiting My Approval" → filter by pending_approvals includes current_user

---

#### 6️⃣ PAGINATION
```
Showing 1-25 of 42 tasks

[← Prev] [1] [2] [3] [4] [Next →]

Rows per page: [25 ▼]
  Options: 10, 25, 50, 100
```
**Button Text**:
- "[← Prev]" - Previous page
- "[Next →]" - Next page
- Page numbers: "[1]", "[2]", etc.
- "Rows per page:" label + dropdown

---

### 📋 TASK MODAL (Create/Edit/View)

#### TABS INSIDE MODAL:
```
[Details] [Approval] [Attachments] [Comments] [History]
```

---

#### TAB 1: DETAILS

```
FORM FIELDS:

Title *
[________________________________]
Placeholder: "Enter task title..."

Description
[________________________________
 ________________________________
 ________________________________]
Placeholder: "Detailed task description..."

Priority *
[High ▼] (Medium, Low options)

Status *
[Open ▼] (Pending Approval, Approved, Declined, Completed)

Assigned To *
[Select user ▼]
Search: [🔍 ___________]

Department *
[Select department ▼]

Due Date *
[📅 Pick date]
Calendar picker

Approval Workflow
[Select workflow ▼] (Workflow 1, 2, 3, Default)
"This determines the approval chain"

Tags
[+ Add Tag] 
[X marketing] [X urgent] [+ Add more]

Share With
[+ Add Users]
Search: [🔍 ___________]
[X John (remove)] [X Sarah (remove)]

BUTTONS (BOTTOM):
[← Back / Cancel] [💾 Save Task] [🗑️ Delete] [📎 Attachments]
```
**Field Labels & Button Text**:
- "Title *" - required field
- "Description"
- "Priority *" - dropdown: High, Medium, Low
- "Status *" - dropdown: Open, Pending Approval, Approved, Declined, Completed
- "Assigned To *" - user selector with search
- "Department *" - department selector
- "Due Date *" - date picker
- "Approval Workflow" - dropdown with info text
- "Tags" - add/remove chips
- "Share With" - user adder with search
- Button: "[← Cancel]" - close modal without saving
- Button: "[💾 Save Task]" - save and show toast "Task saved successfully"
- Button: "[🗑️ Delete]" - delete with confirmation modal
- Button: "[📎 Attachments]" - go to Attachments tab

---

#### TAB 2: APPROVAL

```
APPROVAL CHAIN (Visual):

Current Status: [Pending Approval ●]

     John (Creator)
            ↓
    [✓ Sarah (Manager) - Approved on Jan 10, 2:30 PM]
            ↓
    [○ Mike (Director) - Awaiting response]
            ↓
    [○ Lisa (CFO) - Will review after Mike]

IF USER IS APPROVER:

    This task is awaiting YOUR approval.
    
    [Approve] [Decline] [Request More Info]
    
    Request More Info Modal:
    [Message: ________________________]
    [Send] [Cancel]

IF USER IS NOT APPROVER:

    Status: Approved ✓ on Jan 10, 2:30 PM
    No action needed.

APPROVAL HISTORY TABLE:
┌────────────────────────────────────┐
│ Approver  | Action    | Date/Time   │
├────────────────────────────────────┤
│ Sarah     | Approved  | Jan 10 2:30 │
│ John      | Created   | Jan 9 10:00 │
└────────────────────────────────────┘
```
**Button Text & Labels**:
- "[Approve]" - approve task
- "[Decline]" - decline task (opens reason modal)
- "[Request More Info]" - request additional info from creator
- Approval chain visualization with names, roles, timestamps
- Status indicators: ✓ (approved), ○ (pending), ✗ (declined)

---

#### TAB 3: ATTACHMENTS

```
ATTACHED FILES:

[📄 proposal.pdf] (2.4 MB) - Uploaded Jan 9 by John
  [⬇️ Download] [👁️ Preview] [🗑️ Remove]

[📊 data.xlsx] (1.1 MB) - Uploaded Jan 10 by Sarah
  [⬇️ Download] [👁️ Preview] [🗑️ Remove]

[📷 screenshot.png] (3.2 MB) - Uploaded Jan 10 by Sarah
  [⬇️ Download] [👁️ Preview] [🗑️ Remove]

UPLOAD SECTION:

[Drag files here or click to upload]

Supported: PDF, XLS, XLSX, DOC, DOCX, PNG, JPG, GIF (Max 10MB each)

Progress:
[file.pdf ▓▓▓▓░░░░░ 40%] [✕ Cancel]
[data.xlsx 100% ✓]

BUTTONS:
[+ Add More Files] [Download All (.zip)] [Clear All Attachments]
```
**Button Text**:
- "[⬇️ Download]" - download file
- "[👁️ Preview]" - preview file (PDF viewer, image lightbox, etc.)
- "[🗑️ Remove]" - remove attachment with confirmation
- "[+ Add More Files]" - upload more
- "[Download All (.zip)]" - download all as zip
- "[Clear All Attachments]" - remove all with confirmation
- File types support: "PDF, XLS, XLSX, DOC, DOCX, PNG, JPG, GIF"
- Max size: "Max 10MB each"

---

#### TAB 4: COMMENTS

```
COMMENT THREAD:

John (Creator) - Jan 9, 10:00 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Here's the task. Please review and approve.
[Edit] [Delete] [Reply]

Sarah (Manager) - Jan 10, 2:30 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
One more clarification needed on section 3.
[Edit] [Delete] [Reply]

  ↳ John (Creator) - Jan 10, 3:45 PM
  ━━━━━━━━━━━━━━━━━━━━━━━━━
  Added more details in attachment updated.pdf
  [Edit] [Delete]

Sarah (Manager) - Jan 10, 5:00 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Looks good! Approved ✓
[Edit] [Delete]

─────────────────────────────────────

ADD COMMENT: (Only if user has access to task)

[👤 You]

[Your comment here...                    ]

[Attach File] [@ Mention] [Format ▼]

[Send] [Cancel]
```
**Button Text**:
- "[Edit]" - edit comment
- "[Delete]" - delete comment with confirmation
- "[Reply]" - reply to comment (threads)
- "[Attach File]" - add attachment to comment
- "[@ Mention]" - mention user (@username)
- "[Format ▼]" - text formatting options (bold, italic, code, etc.)
- "[Send]" - post comment
- "[Cancel]" - discard comment

---

#### TAB 5: HISTORY

```
ACTIVITY LOG: (Chronological, newest first)

Time              User    Action                Details
─────────────────────────────────────────────────────────
Jan 10, 5:00 PM   Sarah   Approved              Approved for Publishing
Jan 10, 3:45 PM   John    Updated              Added details to Description
Jan 10, 3:45 PM   John    Uploaded             updated.pdf (2.4 MB)
Jan 10, 2:30 PM   Sarah   Commented            "One more clarification needed"
Jan 10, 2:30 PM   Sarah   Updated              Priority: High → Medium
Jan 9, 10:00 AM   John    Created              Task created
─────────────────────────────────────────────────────────

[⬇️ Export Log]
```
**Column Headers**: "Time", "User", "Action", "Details"
**Actions**: "Approved", "Declined", "Created", "Updated", "Uploaded", "Commented", "Assigned", "Status Changed"
**Button Text**: "[⬇️ Export Log]" - export as CSV

---

### 🔴 MODAL: DECLINE REASON

```
When user clicks [Decline]:

┌────────────────────────────────┐
│ Decline Task                   │
├────────────────────────────────┤
│ Task: "Q1 Marketing Plan"      │
│                                │
│ Why are you declining?         │
│ ═══════════════════════════════ │
│ [More information needed]  ▼   │
│ Options:                       │
│  - Incomplete details          │
│  - Needs revision              │
│  - Not aligned with goals      │
│  - Other                       │
│                                │
│ Additional Notes:              │
│ [_____________________________] │
│ [_____________________________] │
│                                │
│ [Cancel] [✕ Decline Task]      │
└────────────────────────────────┘
```
**Field Labels & Button Text**:
- Title: "Decline Task"
- "Task: [Task Title]"
- "Why are you declining?" with dropdown
- Options: "Incomplete details", "Needs revision", "Not aligned with goals", "Other"
- "Additional Notes:" - textarea with placeholder
- "[Cancel]" - close without declining
- "[✕ Decline Task]" - decline with reason (send notification to creator)

---

### 🟢 MODAL: CONFIRM DELETE TASK

```
┌────────────────────────────────┐
│ Delete Task?                   │
├────────────────────────────────┤
│ Are you sure you want to       │
│ delete "Q1 Marketing Plan"?    │
│                                │
│ This action cannot be undone.  │
│                                │
│ [⚠️ This will also delete all  │
│  comments and attachments.]    │
│                                │
│ [Cancel] [🗑️ Delete Task]      │
└────────────────────────────────┘
```
**Text & Button Text**:
- Title: "Delete Task?"
- Message: "Are you sure you want to delete [Task Title]?"
- Warning: "This action cannot be undone."
- Info: "⚠️ This will also delete all comments and attachments."
- "[Cancel]" - close without deleting
- "[🗑️ Delete Task]" - permanently delete

---

### 🔵 BOTTOM SHEET (MOBILE - Alternative to Modal)

```
When on mobile, Task Modal opens as bottom sheet:

┌──────────────────────┐
│ 🔽 Close             │  ← Drag handle
├──────────────────────┤
│ Task Details         │
│ ┌──────────────────┐ │
│ │ Title            │ │
│ │ [____________]   │ │
│ │ Description      │ │
│ │ [____________]   │ │
│ │ Priority [High▼] │ │
│ │ Assigned [User▼] │ │
│ │                  │ │
│ │[≣ Details]       │ │
│ │[≣ Approval]      │ │
│ │[≣ Attachments]   │ │
│ │[≣ Comments]      │ │
│ └──────────────────┘ │
│                      │
│ [Cancel] [💾 Save]   │
└──────────────────────┘
```

---

### 📊 EMPTY & ERROR STATES

#### EMPTY STATE:
```
┌──────────────────────────┐
│                          │
│      📋 No tasks yet     │
│                          │
│  You don't have any      │
│  tasks assigned yet.     │
│                          │
│  [+ Create Your First]   │
│  [Browse Other Tasks →]  │
│                          │
└──────────────────────────┘
```
**Button Text**:
- "[+ Create Your First]" - open create modal
- "[Browse Other Tasks →]" - clear filters, show all tasks

---

#### ERROR STATE:
```
┌──────────────────────────┐
│      ⚠️ Error            │
│                          │
│  Failed to load tasks.   │
│  Please try again.       │
│                          │
│  [🔄 Retry]              │
│  [Report Issue]          │
│                          │
└──────────────────────────┘
```
**Button Text**:
- "[🔄 Retry]" - reload tasks
- "[Report Issue]" - open support form

---

### 🔔 TOAST NOTIFICATIONS

After actions, show toast (top-right, auto-dismiss after 5s):

**Create Task**:
```
✓ Task "Q1 Plan" created successfully
  [Undo] [Dismiss]
```

**Approved**:
```
✓ Task approved
  Notification sent to assignee
```

**Declined**:
```
✓ Task declined
  Message sent to creator
```

**Updated**:
```
✓ Task updated successfully
```

**Deleted**:
```
✓ Task deleted
  [Undo] [Dismiss]
```

**Attachment Uploaded**:
```
✓ File "proposal.pdf" uploaded (2.4 MB)
```

**Approval Request Sent**:
```
✓ More info requested from John
```

---

### 🎯 KEYBOARD SHORTCUTS (Optional but nice)

```
?, H - Open Help
N - New Task
F - Focus Search
/ - Focus Task List
E - Edit Selected Task
A - Approve Selected
D - Decline Selected
✓ - Mark Complete
↑↓ - Navigate Tasks
```

---

### 📱 MOBILE LAYOUT DIFFERENCES

**Breakpoint: < 768px**

1. **List**: Switches to card layout (full-width stacked)
2. **Modal**: Opens as bottom sheet (drag handle, swipe to close)
3. **Table**: Becomes scrollable card grid
4. **Filter Bar**: Collapses into dropdown menu [≡ Filters]
5. **Action Buttons**: Move into dropdown menu [⋮ More]
6. **Tabs**: Horizontal scroll (swipeable)

---

### 🔐 PERMISSION-BASED VISIBILITY

**Regular User**:
- Can create tasks
- Can view assigned tasks + shared tasks
- Can edit own tasks before approval
- Can add comments
- Can upload files
- Cannot approve/decline
- Sees: [Edit] [Share] [Download Files] [Delete]

**Manager**:
- All regular user permissions
- Can approve/decline tasks (if in approval chain)
- Can view team tasks
- Can reassign tasks
- Can request more info
- Sees: [Edit] [Approve] [Decline] [Request Info] [Reassign] [Delete]

**Admin**:
- Full permissions on all tasks
- Can impersonate users
- Can view all tasks
- Can modify approval workflows
- Can bulk delete/archive
- Sees all buttons + admin-only actions

---

### 💾 LOADING STATES & SKELETONS

**Page Loading**:
```
[━━━━━] Skeleton Header
[━ ━ ━] Skeleton Filters
[━━━━━━━━━━━━━━━━]  ← Skeleton Row 1
[━━━━━━━━━━━━━━━━]  ← Skeleton Row 2
[━━━━━━━━━━━━━━━━]  ← Skeleton Row 3
```

**Modal Loading**:
```
[━━━━━━━] Title
[━ ━ ━ ━] Subtitle
[━━━━━━━━━━━━━━━━]
[━━━━━━━━━━━━━━━━]
```

**Button Loading**:
```
[💾 Save Task...] → [⏳ Saving...]
```

---

### 📐 RESPONSIVE BREAKPOINTS

```
Desktop (1440px):
- Table view with all columns visible
- Inline action buttons
- Side-by-side filters
- Full modals

Tablet (1024px):
- Table view with fewer columns
- Action buttons in dropdown menu
- Stacked filters
- Full modals

Mobile (768px):
- Card view
- Actions in dropdown menu
- Single column filters
- Bottom sheet modals
- Swipeable tabs

Small Mobile (390px):
- Card view (minimal padding)
- Large touch targets (44px min)
- Bottom sheet modals
- Collapsed filters
- Text at 16px+ (avoid zoom)
```

---

### 🎨 COLOR SCHEME

```
Status Badges:
- Open: #3B82F6 (Blue)
- Pending Approval: #F59E0B (Orange)
- Approved: #10B981 (Green)
- Declined: #EF4444 (Red)
- Completed: #6B7280 (Gray)

Priority Badges:
- High: #DC2626 (Red/Bold)
- Medium: #F59E0B (Orange)
- Low: #3B82F6 (Blue)

Button States:
- Primary: Blue with white text
- Hover: Darker blue, slight shadow lift
- Active: Even darker blue
- Disabled: Gray, 50% opacity
- Loading: Show spinner, text becomes "..."

Links:
- Default: Blue (#2563EB)
- Hover: Underline + darker
- Visited: Purple (#7C3AED)
```

---

OUTPUT:
React component structure:
- `TasksPage.tsx` - main page
- `TaskList.tsx` - table/card list with filtering
- `TaskModal.tsx` - create/edit/view modal with tabs
- `ApprovalChain.tsx` - visual approval flow
- `Comments.tsx` - comment thread
- `Attachments.tsx` - file management
- `TaskRow.tsx` / `TaskCard.tsx` - individual task display
- `DeclineReason.tsx` - decline modal
- `DeleteConfirm.tsx` - delete confirmation
- Sample task data with various states
- Permission logic for different user roles
- Fully responsive (390px - 1440px)
- Accessible (WCAG AA, keyboard nav, screen readers)
```

---

## ⚙️ Page 9: SETTINGS / USER PROFILE

```
Design a user settings page (production-grade).

SAME FUNCTIONALITY AS CURRENT:
- User profile info (name, email, avatar)
- Avatar upload
- Password change
- Email preferences (including desktop notifications toggle)
- Desktop notification settings (enable/disable, test notification)
- Department management (if user has multi-dept access)
- Session management (active sessions, logout other devices)

VISUAL DIRECTION:
- Clean, simple form layout
- Sections separated clearly
- Form validation feedback
- Success confirmations

INCLUDE:
- Sidebar + top nav
- Page header: "Settings"
- Tabs or sections:
  1. Profile
     - Avatar upload (drag-drop or click, with preview)
     - Name (text input)
     - Email (text input, read-only or editable)
     - Username (read-only)
     - Account created date
     - Last login date
  2. Password
     - Current password input
     - New password input (with strength indicator)
     - Confirm password input
     - Change Password button
     - Success message: "Password updated"
  3. Notifications
     - Desktop Notifications toggle
     - Notification preferences:
       - Task approvals (toggle)
       - Task assignments (toggle)
       - Workflow status updates (toggle)
       - System alerts (toggle)
     - Test Notification button (sends test notification)
     - Notification permission prompt (if not granted)
  4. Sessions / Security
     - Current session info (device, last active)
     - Active sessions list (location, device, time)
     - Logout from other devices button
     - Two-factor auth option (future)
  5. Department Management (if applicable)
     - List departments user belongs to
     - Request to join department (if available)
- Save/Cancel buttons on each section
- Loading state: skeleton inputs
- Error handling: validation errors, API errors
- Success toast: "Settings updated"
- Mobile: stacked sections, full-width inputs
- Desktop: side-by-side tabs + content

OUTPUT:
- React SettingsPage component
- Separate sub-components: ProfileSection, PasswordSection, NotificationsSection, SessionsSection
- Form validation + error display
- Avatar upload preview
- Password strength indicator
- Desktop notification trigger logic
- Sample user data
- Session mocking data
- Responsive design (mobile tabs as accordion or stacked)
```

---

## 🚀 HOW TO USE THESE PROMPTS (LOCAL PROTOTYPING)

### ⭐ RECOMMENDED: Copilot Chat in VS Code (Stay in Workspace)

```
1. Open VS Code (already in /workspaces/Frontend-CMS-portal)
2. Press Ctrl+Shift+I (open Copilot Chat)
3. Copy ONE page prompt below (e.g., "Page 2: DASHBOARD")
4. Paste into Copilot Chat input
5. Type: "Generate this React component with Tailwind CSS and shadcn/ui"
6. Wait 30 seconds → Copilot generates full component
7. Copy generated code
8. Create new file: src/components/pages/TasksPage.tsx
9. Paste component code
10. Review in VS Code editor
11. Iterate design if needed: "Make the approval buttons bigger", "Change status colors to match our brand"
12. Repeat for remaining 8 pages
```

**Why This Approach**:
- ✅ Stay in VS Code (don't go anywhere)
- ✅ Generated code is ready for your project
- ✅ Easy to iterate (just ask Copilot for changes)
- ✅ Can quickly spot issues in context
- ✅ No copy-paste from external sites
- ✅ All code in one place (your workspace)

**Copilot Chat Tips**:
- Ask specific: "Generate TasksPage with approval chain, attachments tab, and decline reason modal"
- Ask for variants: "Create a mobile-responsive version of this"
- Ask for exports: "Export this as TypeScript with proper types"
- Ask for fixes: "Add error boundary and loading skeleton states"
- Ask for subcomponents: "Extract the ApprovalChain as a separate reusable component"

---

### 📋 USING THIS FILE EFFECTIVELY

**Step 1: Read Full Tasks Spec**
- Understand all buttons, text, interactions
- Note permission rules
- Check mobile layout differences

**Step 2: Prepare Copilot Prompt**
- Copy "Page 8: TASKS / TODOS" section
- Paste into Copilot Chat
- Add context: "I'll use this for a CMS portal with role-based access and approval workflows"

**Step 3: Generate Component**
```
Copilot Chat Input:
─────────────────────────────────────────────────
[Page 8: TASKS / TODOS (COMPREHENSIVE SPECIFICATION)]
[All the button text, fields, modals, etc.]

Generate this React component with these requirements:
- React 18 + TypeScript
- Tailwind CSS for styling
- shadcn/ui components (Button, Input, Select, Modal, Badge, Table)
- Mock data with 8-10 sample tasks
- Responsive layout (desktop + mobile)
- Error states, loading states, empty states
- Permission-based button visibility
- All modals and drawers functional
```

**Step 4: Review Generated Code**
- Check if all buttons are present with correct text
- Verify responsive layout
- Look for shadcn/ui component usage
- Check mock data is realistic

**Step 5: Iterate in Copilot**
```
Copilot Chat:
"Change the approval buttons color from blue to green"
"Make the table columns sortable with small up/down arrows"
"Add a bulk select checkbox and bulk action toolbar"
"Move the attachment section to a dropdown instead of a tab"
```

**Step 6: Save to Project**
```
1. Create file: src/components/pages/TasksPage.tsx
2. Copy all generated code
3. Note dependencies needed
4. Repeat for other 8 pages
```

---

### 🎯 FULL WORKFLOW (Stay in VS Code)

```
Timeline: 2-3 hours for all 9 pages (15-20 minutes each)

Hour 1 (Pages 1-3):
  - 15 min: Login page (copy prompt → generate → save)
  - 15 min: Dashboard page 
  - 15 min: Users page
  - 15 min: Review consistency, extract Button/Input/Badge patterns

Hour 2 (Pages 4-6):
  - 15 min: Accounts page
  - 15 min: Campaigns page
  - 15 min: Drive page
  - 15 min: Extract Table, Modal, Card patterns

Hour 3 (Pages 7-9):
  - 15 min: Reports page
  - 30 min: Tasks page (most complex)
  - 15 min: Settings page
  - Final: Combine all patterns into reusable component library
```

**After Prototyping**:
1. Review all 9 pages in VS Code
2. Create `src/components/ui/` folder with reusable components
3. Create `src/components/layout/` folder with layout components
4. Move to Phase 1: API integration

---

### ❌ DON'T LEAVE WORKSPACE

**Don't use**:
- ❌ v0.dev (external site, requires context switching)
- ❌ Figma (different tool, not React)
- ❌ Claude web (external chat, can't integrate)
- ❌ ChatGPT (external site)

**Do use**:
- ✅ Copilot Chat in VS Code (already installed)
- ✅ Generate directly into your project
- ✅ Keep all code in one place
- ✅ No context switching

---

### 💎 EXAMPLE COPILOT CHAT INTERACTION

**Step 1: Open Copilot Chat**
```
Press: Ctrl+Shift+I
```

**Step 2: Copy & Paste Tasks Spec**
```
Copy the entire "Page 8: TASKS / TODOS" section from this file
Paste into Copilot Chat
```

**Step 3: Ask Copilot to Generate**
```
Copilot Chat Prompt:
"Generate a React component for this task management page.
Requirements:
- React 18 + TypeScript
- Tailwind CSS styling
- shadcn/ui components
- All buttons and modals from the spec
- Mobile responsive (390px to 1440px)
- Mock data with 8 sample tasks
- Error and empty states"
```

**Step 4: Copilot Generates Code**
```
[Copilot generates TasksPage.tsx with all requirements]
```

**Step 5: Copy & Save**
```
1. Select all Copilot response (Ctrl+A)
2. Copy
3. Create file: src/components/pages/TasksPage.tsx
4. Paste
5. Done!
```

**Step 6: Iterate as Needed**
```
Copilot Chat:
"Add a decline reason modal with textarea"
"Make status badges have better contrast"
"Show different buttons for admin vs regular users"
```

---

### 📊 PROJECT STRUCTURE AFTER PROTOTYPING

```
src/
  components/
    pages/
      LoginPage.tsx          ← Generated from prompt
      DashboardPage.tsx      ← Generated from prompt
      UsersPage.tsx          ← Generated from prompt
      AccountsPage.tsx       ← Generated from prompt
      CampaignsPage.tsx      ← Generated from prompt
      DriveManagerPage.tsx   ← Generated from prompt
      ReportsPage.tsx        ← Generated from prompt
      TasksPage.tsx          ← Generated from prompt (MOST DETAILED)
      SettingsPage.tsx       ← Generated from prompt
    
    ui/
      Button.tsx             ← Extract from pages
      Input.tsx              ← Extract from pages
      Select.tsx             ← Extract from pages
      Modal.tsx              ← Extract from pages
      Table.tsx              ← Extract from pages
      Badge.tsx              ← Extract from pages
      Card.tsx               ← Extract from pages
      ... (other reusable components)
    
    layout/
      Sidebar.tsx            ← Persistent navigation
      TopNav.tsx             ← Persistent header
```

---

## ✅ QUALITY CHECKLIST FOR EACH PAGE

Before moving to API integration:

- [ ] All button text matches spec exactly
- [ ] Responsive: 390px, 768px, 1024px, 1440px breakpoints
- [ ] Loading state (skeleton screens on page load)
- [ ] Empty state (when no data)
- [ ] Error state (with recovery button)
- [ ] Success toast (confirmation after action)
- [ ] Modals/drawers work as described
- [ ] Permissions: correct buttons shown per role
- [ ] Search/filter logic functional
- [ ] Pagination if needed
- [ ] Sidebar + top nav on every page
- [ ] Keyboard navigation works (Tab key)
- [ ] Color contrast WCAG AA
- [ ] Mobile: no horizontal scroll, readable text
- [ ] Components use shadcn/ui patterns
- [ ] Sample data is realistic (5-10 items min)
- [ ] No hardcoded API calls (mock data only)

---

## 📦 COMPONENT LIBRARY TO EXTRACT

As you generate pages, reuse these components:

- `Button` (primary, secondary, danger, loading state)
- `Input` (text, email, password, with validation)
- `Select` / `Dropdown` (single, multi-select)
- `Checkbox` / `Radio`
- `Badge` / `Pill` (status, priority, role)
- `Card` (container, shadow, hover state)
- `Table` (sortable, filterable, selectable rows)
- `Modal` / `Dialog` (form, confirmation, alert)
- `Drawer` / `Sidebar` (mobile navigation)
- `Toast` / `Alert` (success, error, warning)
- `Skeleton` (loading placeholders)
- `Pagination` (prev/next, page numbers)
- `Breadcrumb` (navigation trail)
- `Avatar` (user profile image)
- `Empty State` (icon + message)
- `Error Boundary` (error recovery UI)
- `Tab` / `Accordion` (grouped content)
- `Progress Bar` (upload, loading)
- `Tag` / `Chip` (removable tags)

---

## 🎨 DESIGN DIRECTION NOTES

### Typography
- **Display Font**: Choose ONE distinctive font (Poppins, IBM Plex Serif, Sohne, etc.)
- **Body Font**: Clean, readable (Fira Sans, Source Sans Pro, Open Sans, etc.)
- **Hierarchy**: H1 32px, H2 24px, Body 16px, Small 14px

### Colors
- **Primary**: Choose one bold color (not generic blue)
- **Secondary**: Complementary accent
- **Neutrals**: 5-6 shades of gray (for light/dark modes)
- **Status**: Green (success), Yellow/Orange (warning), Red (error), Blue (info)
- **Use CSS Variables**: `--color-primary`, `--color-accent`, etc.

### Spacing
- **Grid**: 8px base unit (8, 16, 24, 32, 40, 48px spacing)
- **Padding**: Consistent 16px-24px inside cards/containers
- **Margin**: Generous whitespace between sections

### Interactions
- **Hover States**: Subtle color change or shadow lift
- **Active States**: Bold color change
- **Focus States**: Visible outline (accessible)
- **Transitions**: 200-300ms for smooth feel
- **Loading**: Skeleton screens OR spinners (not both)

---

---

## 🚀 START HERE: IMMEDIATE ACTION ITEMS

### RIGHT NOW (5 minutes):
1. ✅ Read the "Page 8: TASKS / TODOS" section above (most detailed)
2. ✅ Understand all buttons, modals, tabs from the spec
3. ✅ Open Copilot Chat in VS Code (Ctrl+Shift+I)

### STEP 1: Generate Tasks Page (30 minutes)
```
1. Copy entire "Page 8: TASKS / TODOS" section
2. Paste into Copilot Chat
3. Ask: "Generate this React component with Tailwind CSS and shadcn/ui"
4. Wait 30 seconds
5. Copy all Copilot output
6. Create: src/components/pages/TasksPage.tsx
7. Paste code into new file
8. Review in VS Code
```

### STEP 2: Generate Other 8 Pages (2 hours)
```
For each page (Login, Dashboard, Users, Accounts, Campaigns, Drive, Reports, Settings):
1. Copy page-specific prompt below (Page 1-9)
2. Paste into Copilot Chat
3. Ask: "Generate this React component with Tailwind & shadcn/ui"
4. Copy output → Create new file → Paste
5. SAVE FILE in src/components/pages/

Timeline: ~15 min per page × 8 = 2 hours total
```

### STEP 3: Extract Reusable Components (30 minutes)
```
1. Review all 9 generated pages
2. Identify common patterns:
   - Button (primary, secondary, danger, loading)
   - Input fields
   - Tables
   - Modals/Dialogs
   - Badges/Pills
   - Cards
   - Dropdowns/Selects
3. Create src/components/ui/ folder
4. Ask Copilot: "Extract Button, Input, Select, Modal from these pages"
5. Create separate files for each
```

### STEP 4: Setup Layout Components (15 minutes)
```
1. Copilot: "Create a Sidebar component with navigation"
2. Copilot: "Create a TopNav component with logo and user menu"
3. Create src/components/layout/ folder
4. Save Sidebar.tsx and TopNav.tsx
```

### STEP 5: Ready for API Integration
```
✅ All 9 page prototypes complete
✅ Reusable component library extracted
✅ Layout components ready
🎯 NEXT: Initialize Next.js project & connect APIs
```

---

## 📋 ALL PAGES AT A GLANCE

| Page | Complexity | Est. Time | Key Features |
|------|-----------|-----------|------------|
| **Login** | Low | 15 min | Form, validation, error states |
| **Dashboard** | Low | 15 min | Stats cards, activity feed, quick links |
| **Users** | Medium | 20 min | Table, search, filters, add/edit modal |
| **Accounts** | Medium | 20 min | Cards/table toggle, workflow assignment |
| **Campaigns** | Medium | 20 min | Condition builder, Google Sheet sync |
| **Drive** | Medium | 20 min | File browser, drag-drop upload, permissions |
| **Reports** | Low | 15 min | Embedded report cards, access control |
| **Tasks** ⭐ | **HIGH** | **30 min** | Approval chains, attachments, comments, 5 tabs |
| **Settings** | Low | 15 min | Profile, password, notifications, sessions |

**Total Time**: ~2.5-3 hours for all 9 pages

---

## ✨ OUTCOME

After completing all steps:

```
✅ 9 fully designed UI pages
✅ Responsive layouts (390px - 1440px)
✅ All buttons, modals, interactions specified
✅ Reusable component library
✅ Mock data with realistic samples
✅ Loading, empty, error states
✅ Ready for API integration

SAVED IN: /workspaces/Frontend-CMS-portal/src/components/
```

---

## ⚡ QUICK START COMMAND

**Open Copilot Chat NOW**:
```
Press Ctrl+Shift+I
```

**Then paste this minimal prompt**:
```
Generate a React Dashboard page component with:
- Grid of 4 stats cards (accounts, campaigns, tasks, workflows)
- User profile section (avatar, name, role, department)
- Recent activity feed (6 items with timestamps)
- Quick navigation buttons to main modules
- Loading skeleton state
- Responsive (desktop + mobile)
- Tailwind CSS + shadcn/ui components
- TypeScript with proper types
- Mock data included
```

**Copy the output → save to `src/components/pages/DashboardPage.tsx` → Done!**

---

## 🎯 REMEMBER

- ✅ **Don't go anywhere** - stay in VS Code
- ✅ **Use Copilot Chat** - already installed
- ✅ **Copy prompts** - from this file
- ✅ **Generate locally** - code appears right in your workspace
- ✅ **Save as you go** - create src/components/pages/ files
- ✅ **Iterate quickly** - ask Copilot for changes
- ✅ **Then move to APIs** - after all prototypes are done

**Let's build! 🚀**
