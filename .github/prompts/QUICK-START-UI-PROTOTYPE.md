# 🚀 UI PROTOTYPE - QUICK START GUIDE

**Goal**: Generate all 9 UI page prototypes locally in VS Code using Copilot Chat.

**Time**: 2-3 hours total | No external tools needed

---

## ⚡ 30-SECOND QUICK START

1. **Open Copilot Chat**: Press `Ctrl+Shift+I`
2. **Copy this prompt**:
```
Generate a comprehensive React Tasks page with:
- Table view with columns: Title, Assigned To, Department, Priority, Status, Due Date, Actions
- Filter bar with Status, Priority, Department dropdowns
- Create Task button → modal
- Tabs: All Tasks, Assigned to Me, Created by Me, Awaiting Approval
- Task modal with 5 tabs: Details, Approval, Attachments, Comments, History
- Approve/Decline buttons with modals
- File upload with drag-drop
- Comment thread with Edit/Delete/Reply
- Permission-based visibility (show buttons only for managers)
- Loading states, empty states, error states, success toasts
- Mobile responsive (bottom sheet modal on 390px)
- Tailwind CSS + shadcn/ui components
- TypeScript with proper types
- Mock data with 8 realistic tasks
```
3. **Wait 30 seconds** → Code appears
4. **Save to file**: `src/components/pages/TasksPage.tsx`
5. **Done!**

---

## 📋 FULL WORKFLOW

### Hour 1: Generate Pages 1-3

**Page 1: LOGIN (15 min)**
```
Copilot Prompt:
"Generate a login page with:
- Centered card with username/password inputs
- Show password toggle
- Google email verification indicator
- Login button with loading state
- Error message display
- Remember me checkbox
- Responsive (mobile + desktop)
- Tailwind + shadcn/ui"

Save to: src/components/pages/LoginPage.tsx
```

**Page 2: DASHBOARD (15 min)**
```
Copilot Prompt:
"Generate a dashboard with:
- Grid of 4 stat cards (Accounts, Campaigns, Tasks, Workflows)
- User profile card (avatar, name, role, department)
- Recent activity feed (6 items)
- Quick action buttons to main modules
- Loading skeleton state
- Responsive grid
- Tailwind + shadcn/ui"

Save to: src/components/pages/DashboardPage.tsx
```

**Page 3: USERS (15 min)**
```
Copilot Prompt:
"Generate a users management page with:
- Searchable, filterable table (columns: Username, Email, Name, Role, Department, Status)
- Search bar
- Filters: Role, Department, Active/Inactive
- Add User button → modal
- Edit/Delete actions per row
- Bulk select checkbox
- Pagination (25, 50, 100 rows)
- Loading state
- Empty state
- Success toasts
- Responsive table (scrolls on mobile)
- Tailwind + shadcn/ui"

Save to: src/components/pages/UsersPage.tsx
```

---

### Hour 2: Generate Pages 4-6

**Page 4: ACCOUNTS (15 min)**
```
Copilot Prompt:
"Generate a Google Ads accounts page with:
- Card layout (3 cols on desktop) OR table view toggle
- Cards show: Customer ID, Account Name, Status badge, Workflow, Google Sheet link
- Search by customer ID
- Filters: Status, Assigned Workflow, Manager
- Add Account button → modal
- Edit/Delete actions
- Batch enable/disable
- Loading state
- Empty state
- View toggle between cards and table
- Mobile: stacked cards
- Tailwind + shadcn/ui"

Save to: src/components/pages/AccountsPage.tsx
```

**Page 5: CAMPAIGNS (20 min)**
```
Copilot Prompt:
"Generate a campaigns page with:
- Account selector dropdown
- Sync from Google Sheet button + progress indicator
- Campaign table (Name, Customer ID, Condition Count, Status, Last Updated)
- Status toggle per campaign
- Edit campaign modal with condition builder
- Condition builder shows: list of conditions, add condition button, remove condition (X)
- Batch select campaigns → enable/disable
- Search by campaign name
- Filters: Status, Has Conditions
- Loading state
- Empty state
- Success toasts
- Responsive
- Tailwind + shadcn/ui"

Save to: src/components/pages/CampaignsPage.tsx
```

**Page 6: DRIVE MANAGER (20 min)**
```
Copilot Prompt:
"Generate a Google Drive file browser with:
- Breadcrumb navigation (Home > Folder > Subfolder)
- Create menu: New Folder, New Sheet, New Doc, New Slides
- Upload zone (click or drag-drop)
- File list (icon, name, type, size, last modified, owner)
- File actions: Download, Share, Move, Delete
- Search by file name
- Current folder path
- Load more / pagination
- Upload progress bar
- Loading state
- Empty state (folder is empty)
- Permission sync status
- React to file uploads with toast
- Responsive (table on desktop, cards on mobile)
- Tailwind + shadcn/ui"

Save to: src/components/pages/DriveManagerPage.tsx
```

---

### Hour 3: Generate Pages 7-9

**Page 7: LOOKER REPORTS (15 min)**
```
Copilot Prompt:
"Generate a Looker reports page with:
- Report grid (2-3 cols on desktop, 1 col mobile)
- Reports as cards with: title, description, last updated, embedded iframe
- Search reports by name
- Filter: Category, Date range
- View Full Report button
- Loading skeleton for each report card
- Empty state when no reports
- Error state with Retry button
- No horizontal scroll on mobile
- Tailwind + shadcn/ui"

Save to: src/components/pages/ReportsPage.tsx
```

**Page 8: TASKS ⭐ STAR (30 min) - MOST DETAILED**
```
SEE THE COMPREHENSIVE SPECIFICATION ABOVE IN THE FILE:
/.github/prompts/ui-prototype-prompts.md

Copy the entire "Page 8: TASKS / TODOS (COMPREHENSIVE SPECIFICATION)" section
Paste into Copilot Chat
Ask for React component with all requirements
This is the most complex page - it has:
- Task table with filters, search, pagination
- Multiple tabs (All, Assigned, Created, Awaiting Approval)
- Modals for: Create/Edit, Decline Reason, Delete Confirmation
- Task modal with 5 tabs (Details, Approval, Attachments, Comments, History)
- Approval chain visualization
- File attachment management
- Comment thread with Edit/Delete/Reply
- Permission-based buttons (Approve/Decline only for managers)

Save to: src/components/pages/TasksPage.tsx
```

**Page 9: SETTINGS (15 min)**
```
Copilot Prompt:
"Generate a user settings page with tabs:
- Profile: Avatar upload, Name, Email, Username (readonly), Created date, Last login
- Password: Current password, New password, Confirm password, Password strength indicator
- Notifications: Desktop Notifications toggle, Notification preferences (Tasks, Approvals, Workflows), Test Notification button
- Sessions: Active sessions list (device, location, time), Logout from other devices
- Department: List departments, Request to join
- Save/Cancel buttons per section
- Form validation with error messages
- Success toast on save
- Loading state
- Responsive (mobile: stacked sections, desktop: tab layout)
- Tailwind + shadcn/ui"

Save to: src/components/pages/SettingsPage.tsx
```

---

## 📁 PROJECT STRUCTURE (After All Pages Generated)

```
/workspaces/Frontend-CMS-portal/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx          ✅ Generated
│   │   │   ├── DashboardPage.tsx      ✅ Generated
│   │   │   ├── UsersPage.tsx          ✅ Generated
│   │   │   ├── AccountsPage.tsx       ✅ Generated
│   │   │   ├── CampaignsPage.tsx      ✅ Generated
│   │   │   ├── DriveManagerPage.tsx   ✅ Generated
│   │   │   ├── ReportsPage.tsx        ✅ Generated
│   │   │   ├── TasksPage.tsx          ✅ Generated (MOST DETAILED)
│   │   │   └── SettingsPage.tsx       ✅ Generated
│   │   │
│   │   ├── ui/               (To be extracted from pages)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ... (other shadcn/ui components)
│   │   │
│   │   └── layout/          (To be created)
│   │       ├── Sidebar.tsx
│   │       └── TopNav.tsx
│   │
│   ├── lib/
│   │   ├── auth/           (API integration)
│   │   ├── api/            (API routes)
│   │   └── types/          (TypeScript types)
│   │
│   └── app/                (Next.js app router)
│       ├── layout.tsx
│       ├── page.tsx
│       ├── login/
│       ├── dashboard/
│       └── ... (all routes)
└── ...
```

---

## 🎯 STEP-BY-STEP EXAMPLE

### Example: Generate Tasks Page Right Now

1. **Open Copilot Chat**:
   ```
   Press Ctrl+Shift+I in VS Code
   ```

2. **Copy Tasks Specification**:
   Open: `/.github/prompts/ui-prototype-prompts.md`
   Find: "## ✅ Page 8: TASKS / TODOS (COMPREHENSIVE SPECIFICATION)"
   Copy: Everything from the header to the end of the section

3. **Paste into Copilot Chat**:
   ```
   [Ctrl+V to paste the entire Tasks section]
   ```

4. **Ask Copilot to Generate**:
   ```
   "Generate this as a React component with Tailwind CSS and shadcn/ui.
   Include TypeScript types, mock data, all modals and drawers, and responsive layout."
   ```

5. **Wait 30-60 seconds**:
   Copilot generates full TasksPage.tsx component

6. **Copy Generated Code**:
   ```
   [Ctrl+A on Copilot response to select all]
   [Ctrl+C to copy]
   ```

7. **Create New File**:
   ```
   Right-click src/components/pages/
   Select "New File"
   Name it: TasksPage.tsx
   ```

8. **Paste Code**:
   ```
   [Ctrl+V inside new TasksPage.tsx file]
   [Ctrl+S to save]
   ```

9. **Review in VS Code**:
   - Check all buttons are present
   - Verify modals and tabs work syntactically
   - Look for shadcn/ui component usage
   - Review mock data

10. **Iterate if Needed**:
    ```
    Copilot Chat:
    "Make the approval buttons green instead of blue"
    "Add sorting arrows to table headers"
    "Increase modal width on desktop"
    ```

11. **Repeat for Other 8 Pages** (same process)

---

## ✅ QUALITY CHECKLIST

For **each page**, before moving to the next:

- [ ] All button text matches specification
- [ ] Responsive at: 1440px, 1024px, 768px, 390px
- [ ] Loading state (skeleton screens)
- [ ] Empty state (when no data)
- [ ] Error state (with recovery action)
- [ ] Success toast (after actions)
- [ ] Modals/drawers functional
- [ ] Permission-based visibility (buttons hidden for non-managers)
- [ ] Search/filter logic clear
- [ ] Sample mock data (5-10 items min)
- [ ] No hardcoded API calls
- [ ] Uses shadcn/ui components
- [ ] TypeScript types defined
- [ ] Mobile layout no horizontal scroll

---

## 🚀 NEXT AFTER PROTOTYPING (Not Now)

Once all 9 pages are generated:

1. **Extract reusable components** → Create `src/components/ui/`
2. **Create layout components** → Create `src/components/layout/`
3. **Initialize Next.js 14 project** with proper structure
4. **Connect API routes** to pages
5. **Add Supabase client** for database
6. **Implement authentication** (NextAuth)
7. **Test all pages** with real data
8. **Deploy to Vercel**

---

## 📞 COPILOT CHAT TIPS

**For faster iterations, use these follow-up prompts**:

```
"Add a loading spinner to the approve button"
"Change the status badge colors to: Blue=Open, Orange=Pending, Green=Approved, Red=Declined"
"Make the table columns sortable"
"Move the approval chain to a sidebar instead of tabs"
"Add keyboard shortcuts (N for new, E for edit, A for approve)"
"Show a confirmation dialog before deleting tasks"
```

---

## ⏱️ TIME BREAKDOWN

| Phase | Time | Tasks |
|-------|------|-------|
| **Setup** | 5 min | Read this guide, open Copilot |
| **Pages 1-3** | 45 min | Login, Dashboard, Users |
| **Pages 4-6** | 1 hour | Accounts, Campaigns, Drive |
| **Pages 7-9** | 1 hour | Reports, **Tasks** (30 min), Settings |
| **Extract Components** | 30 min | Reusable UI library |
| **Total** | ~3 hours | ✅ All 9 pages + component library |

---

## 🎁 WHAT YOU'LL HAVE

After completing this guide:

✅ **9 production-grade UI pages** (fully interactive prototypes)
✅ **Responsive layout** (mobile + tablet + desktop)
✅ **All buttons & interactions** specified in detail
✅ **Reusable component library** (extract from pages)
✅ **Mock data** with realistic samples
✅ **Loading/empty/error states** on every page
✅ **Ready for API integration** (next phase)

---

## 🏁 START NOW

```
1. Press: Ctrl+Shift+I (open Copilot Chat)
2. Ask: "Generate a dashboard page with 4 stat cards and an activity feed"
3. Copy output → Create src/components/pages/DashboardPage.tsx
4. Paste → Done!
5. Repeat for 8 more pages
```

**Let's go! 🚀**
