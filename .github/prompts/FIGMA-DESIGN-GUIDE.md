# 🎨 FIGMA DESIGN GUIDE - Enterprise CMS Portal UI

**Goal**: Create all 9 high-fidelity UI pages in Figma with design system, components, and responsive variants.

**Output**: Figma file ready for developer handoff → Code generation

---

## 📋 QUICK SETUP

### Before You Start
1. Open Figma (figma.com)
2. Create new file: "CMS Portal - UI Design"
3. Follow this structure

### Time Estimate
- Design system & components: 1-2 hours
- All 9 pages: 3-4 hours
- **Total: 4-6 hours** for complete design

---

## 🎨 PART 1: DESIGN SYSTEM SETUP

### Step 1: Create Color System

In Figma, create a **Colors** page with these swatches:

**Primary Colors**:
- `Primary-900`: #0A0E27 (Dark blue, buttons, headers)
- `Primary-700`: #1F2E47
- `Primary-500`: #003D82 (Main blue)
- `Primary-300`: #3B82F6 (Light blue)
- `Primary-100`: #DBEAFE (Very light)

**Status Colors** (use in badges):
- `Status-Open`: #3B82F6 (Blue)
- `Status-Pending`: #F59E0B (Orange)
- `Status-Approved`: #10B981 (Green)
- `Status-Declined`: #EF4444 (Red)
- `Status-Completed`: #6B7280 (Gray)

**Priority Colors** (use in badges):
- `Priority-High`: #DC2626 (Bold red)
- `Priority-Medium`: #F59E0B (Orange)
- `Priority-Low`: #3B82F6 (Blue)

**Neutral Colors** (text, backgrounds):
- `Neutral-900`: #111827 (Text, darkest)
- `Neutral-700`: #374151 (Secondary text)
- `Neutral-500`: #6B7280 (Disabled text)
- `Neutral-300`: #D1D5DB (Borders)
- `Neutral-100`: #F3F4F6 (Background)
- `Neutral-50`: #F9FAFB (Lightest background)
- `White`: #FFFFFF

**Semantic Colors**:
- `Success`: #10B981
- `Warning`: #F59E0B
- `Error`: #EF4444
- `Info`: #3B82F6

---

### Step 2: Typography System

Create a **Typography** page with text styles:

**Display/Headings**:
- `H1`: Font: Poppins | Size: 32px | Weight: Bold (700) | Line: 1.2 | Color: Neutral-900
- `H2`: Font: Poppins | Size: 24px | Weight: Bold (700) | Line: 1.3 | Color: Neutral-900
- `H3`: Font: Poppins | Size: 20px | Weight: Semi-bold (600) | Line: 1.4 | Color: Neutral-900
- `H4`: Font: Poppins | Size: 18px | Weight: Semi-bold (600) | Line: 1.4 | Color: Neutral-900

**Body Text**:
- `Body-Large`: Font: Inter | Size: 16px | Weight: Regular (400) | Line: 1.5 | Color: Neutral-900
- `Body-Regular`: Font: Inter | Size: 14px | Weight: Regular (400) | Line: 1.5 | Color: Neutral-700
- `Body-Small`: Font: Inter | Size: 12px | Weight: Regular (400) | Line: 1.4 | Color: Neutral-500

**Links**:
- `Link`: Font: Inter | Size: 14px | Weight: Regular (400) | Decoration: Underline | Color: Primary-500

**Buttons**:
- `Button-Large`: Font: Inter | Size: 16px | Weight: Semi-bold (600) | Line: 1.5 | Color: White
- `Button-Medium`: Font: Inter | Size: 14px | Weight: Semi-bold (600) | Line: 1.5 | Color: White
- `Button-Small`: Font: Inter | Size: 12px | Weight: Semi-bold (600) | Line: 1.4 | Color: White

---

### Step 3: Spacing & Layout Grid

Create a **Layout** page showing:

**8px Grid System**:
- Spacing: 8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px
- Use for: padding, margins, gaps between components

**Responsive Breakpoints**:
- Desktop: 1440px (artboard width)
- Tablet Large: 1024px
- Tablet: 768px
- Mobile: 390px

**Component Padding** (consistent across all components):
- Card padding: 24px
- Button padding: 12px 16px (height 40px)
- Input padding: 10px 12px (height 40px)
- Modal padding: 32px

---

### Step 4: Shadows & Borders

**Shadows**:
- `Elevation-1`: 0 1px 2px rgba(0,0,0,0.05)
- `Elevation-2`: 0 4px 6px rgba(0,0,0,0.1)
- `Elevation-3`: 0 10px 15px rgba(0,0,0,0.1)
- `Elevation-4`: 0 20px 25px rgba(0,0,0,0.1)

**Border Radius**:
- Small: 4px (inputs, buttons)
- Medium: 8px (cards, modals)
- Large: 12px (sections)
- Round: 50% (avatars)

**Borders**:
- Color: Neutral-300
- Width: 1px (standard borders)
- Width: 2px (focus states, active borders)

---

## 🧩 PART 2: REUSABLE COMPONENTS

Create a **Components** page with these base components. Use **Figma Components** feature to make them reusable.

### Button Component

**States**:
- Default (Primary): Blue background, white text
- Hover: Darker blue
- Active: Even darker
- Disabled: Gray background, 50% opacity
- Loading: Gray background + spinner icon

**Sizes**:
- Small: 40px height, 12px padding
- Medium: 44px height, 16px padding (default)
- Large: 48px height, 20px padding

**Variants**:
- Primary (blue)
- Secondary (white background, blue border, blue text)
- Danger (red)
- Success (green)

**Example buttons to create**:
- `[+ New Task]` (Primary, Medium)
- `[Approve]` (Success, Medium)
- `[Decline]` (Danger, Medium)
- `[Edit]` (Secondary, Medium)
- `[Delete]` (Danger, Small)
- `[Cancel]` (Secondary, Medium)
- `[Save]` (Primary, Medium)

---

### Input Component

**States**:
- Default (empty)
- Focused (blue border, 2px)
- Filled (value entered)
- Error (red border + red error text below)
- Disabled (gray background, 50% opacity)

**Types**:
- Text input
- Password input (with show/hide toggle)
- Email input
- Textarea (multi-line)
- Number input

**Height**: 40px
**Padding**: 10px 12px
**Border**: 1px Neutral-300
**Border radius**: 4px

---

### Select/Dropdown Component

**States**:
- Default (closed)
- Focused (blue border)
- Open (dropdown visible)
- Disabled

**Design**:
- Height: 40px
- Arrow icon on right (chevron down)
- Dropdown menu below with options
- Option hover state (light blue background)

**Example selects**:
- `[Status ▼: All]`
- `[Priority ▼: High]`
- `[Department ▼: Marketing]`

---

### Badge Component

**Status badges**:
- Open: Blue background, blue text (light)
- Pending: Orange background, orange text (light)
- Approved: Green background, white text
- Declined: Red background, white text
- Completed: Gray background, white text

**Priority badges**:
- High: Red
- Medium: Orange
- Low: Blue

**Size**: Padding 6px 12px, border radius 4px, font size 12px

---

### Card Component

**Design**:
- Background: White
- Border: 1px Neutral-300
- Border radius: 8px
- Padding: 24px
- Shadow: Elevation-2
- Hover: Slight shadow lift (Elevation-3), border color darker

---

### Modal Component

**Design**:
- Background: White
- Border radius: 12px
- Padding: 32px
- Shadow: Elevation-4
- Max width: 600px (desktop), full width minus 16px margin (mobile)
- Overlay: Black 50% opacity

**Header**:
- H2 title
- Close button (X) in top right

**Footer**:
- 2-3 buttons (usually Cancel + Primary action)
- Buttons right-aligned

---

### Table Component

**Design**:
- Header row: Dark blue background (#1F2E47), white text
- Data rows: White background, Neutral-300 borders between rows
- Hover row: Light gray background (Neutral-100)
- Selected row: Light blue background
- Padding: 16px per cell
- Checkbox on left (for bulk select)

**Columns example** (for Tasks):
- Checkbox | Title | Assigned To | Department | Priority | Status | Due Date | Actions

---

### Avatar Component

**Design**:
- Circular (border radius 50%)
- Size: 32px (small), 40px (medium), 48px (large)
- Background: Blue (Primary-500)
- Text: Initials in white, H3 font size
- Border: 2px white
- Optional: Image instead of initials

---

### Notification/Toast Component

**Design**:
- Position: Top right
- Background: Based on type (green for success, red for error, blue for info)
- Padding: 16px
- Border radius: 8px
- Text: White
- Close button (X)
- Auto-dismiss after 5 seconds (note in design)

**Types**:
- Success (green): "✓ Task created successfully"
- Error (red): "⚠️ Failed to save task"
- Info (blue): "ℹ️ Processing..."
- Warning (orange): "⚠️ This action cannot be undone"

---

### Skeleton/Loading Component

**Design** (for table rows, cards):
- Gray placeholder bars (Neutral-200)
- Height matching content
- Animated pulse effect (opacity 0.5 → 1 → 0.5 loop)
- Border radius matching content

---

## 📱 PART 3: LAYOUT COMPONENTS

### Top Navigation Bar

**Height**: 60px
**Background**: Primary-900 (#0A0E27)
**Padding**: 12px 24px
**Shadow**: Elevation-2

**Left side**:
- Menu icon (☰) on mobile only (hidden on desktop)
- Logo/Text "CMS PORTAL" in white

**Right side**:
- Search bar (light gray background, 200px wide)
- Bell icon (notifications)
- User avatar + dropdown

**Mobile (390px)**:
- Search hidden (show search icon)
- Simpler layout

---

### Sidebar Navigation

**Width**: 280px (desktop), collapsed to 60px (hamburger mode)
**Height**: Full viewport (minus top nav)
**Background**: Primary-900 (#0A0E27)
**Text**: White

**Structure**:
- Navigation items (list):
  - Dashboard (icon + text)
  - Users (icon + text)
  - Accounts (icon + text)
  - Campaigns (icon + text)
  - Drive (icon + text)
  - Reports (icon + text)
  - Tasks (icon + text)
  - Settings (icon + text)

- Active item: Blue background (Primary-500), white text
- Hover item: Darker background (Primary-700)
- Icon + text on desktop, icon only on mobile < 768px

**Mobile (390px)**:
- Slide-out drawer from left
- Full-width items when open

---

### Page Header

**Height**: 80px
**Background**: White
**Border-bottom**: 1px Neutral-300
**Padding**: 16px 24px

**Left side**:
- Breadcrumb: Dashboard > Tasks > Task Details
- Page title: H2 "Tasks"
- Subtitle (optional): Body-Small gray text

**Right side**:
- Primary action button: `[+ New Task]`
- More menu (⋮): Bulk Edit, Export, Help

---

## 📄 PART 4: PAGE DESIGNS

### Page 1: LOGIN

**Artboard size**: 1440px × 900px
**Background**: White OR light gradient
**Layout**: Centered card OR split hero + form

**Design Option A (Centered Card)**:
```
┌─────────────────────────────────────┐
│                                     │
│        CMS PORTAL LOGO (48px)      │
│                                     │
│     [Username input]                │
│     [Password input + show toggle]  │
│     [Remember me checkbox]          │
│                                     │
│     [Login button - Primary]        │
│                                     │
│     Powered by [Company]            │
│                                     │
└─────────────────────────────────────┘
```

**Design Option B (Split Hero + Form)**:
```
┌──────────────────┬──────────────────┐
│                  │                  │
│  Hero Image      │  Login Form      │
│  + Tagline       │  - Logo          │
│                  │  - Username      │
│  "Modern CMS"    │  - Password      │
│  "Secure & Fast" │  - Remember me   │
│  "Enterprise     │  - Login button  │
│  Solutions"      │                  │
│                  │                  │
└──────────────────┴──────────────────┘
```

**Components to include**:
- Logo (128px)
- H1 "Welcome Back" (32px)
- Body-Large "Sign in to your account"
- Input: Username (placeholder: "username@email.com")
- Input: Password (placeholder: "••••••••", show toggle)
- Checkbox: "Remember me"
- Button: `[Login]` (Primary, Large, full width)
- Link: "Forgot password?"
- Text: Google email verification status (small gray)
- Error message area (red text)

**Responsive**:
- Desktop (1440px): Centered card, 500px wide
- Tablet (768px): Full-width card with side padding
- Mobile (390px): Full-width card, full height

---

### Page 2: DASHBOARD

**Artboard size**: 1440px × 1200px
**Sidebar**: 280px
**Main content**: 1160px

**Layout**:
```
┌────────────────────────────────────────────┐
│  [Top Nav - 60px]                          │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Dashboard                      │
│ 280px    │ ┌──────────────────────────┐  │
│          │ │ User Profile Card (320)  │  │
│          │ │ - Avatar (48px)          │  │
│          │ │ - Name: John Doe         │  │
│          │ │ - Role: Manager          │  │
│          │ │ - Dept: Marketing        │  │
│          │ └──────────────────────────┘  │
│          │                                │
│          │ ┌──────┬──────┬──────┬──────┐ │
│          │ │Stats │Stats │Stats │Stats │ │
│          │ │ All  │ Acct │ Camp │ Task │ │
│          │ │42    │8     │12    │24   │ │
│          │ └──────┴──────┴──────┴──────┘ │
│          │                                │
│          │ Recent Activity                │
│          │ ┌────────────────────────────┐│
│          │ │ Item 1                     ││
│          │ │ Item 2                     ││
│          │ │ Item 3                     ││
│          │ │ Item 4                     ││
│          │ │ Item 5                     ││
│          │ │ Item 6                     ││
│          │ └────────────────────────────┘│
│          │                                │
│          │ Quick Links                    │
│          │ [Users] [Accounts] [Campaigns]│
│          │ [Drive] [Reports] [Tasks]     │
│          │ [Settings]                     │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Components**:
- Top Nav (persistent)
- Sidebar (persistent)
- Page Header: "Dashboard" + breadcrumb
- User Profile Card (H3 title, avatar, 3 text lines)
- 4 Stat Cards (number + label, card layout)
  - Stat-1: Cards with icons (yellow, blue, red, green)
  - Title: 32px number, 14px gray label
  - Icon: 24px on left/right
- Activity Feed (6 rows, timeline style with icons)
  - Icon | Action Description | Timestamp
  - e.g., "📁 John uploaded file.pdf" | "2 hours ago"
- Quick Action Buttons (grid: 3 columns)

**Colors**:
- Stat card 1: Background light yellow, icon yellow
- Stat card 2: Background light blue, icon blue
- Stat card 3: Background light red, icon red
- Stat card 4: Background light green, icon green

---

### Page 3: USERS

**Artboard size**: 1440px × 1400px

**Layout**:
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Users                          │
│          │ ┌────────────────────────────┐ │
│          │ │ Filters & Search           │ │
│          │ │ [Role ▼] [Dept ▼] [Status] │ │
│          │ │ [Search...] [← Prev][1][2] │ │
│          │ └────────────────────────────┘ │
│          │ ┌────────────────────────────┐ │
│          │ │ ADD USER [+]               │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌────────────────────────────┐ │
│          │ │ TABLE HEADER               │ │
│          │ ├────────────────────────────┤ │
│          │ │ Row 1: User data           │ │
│          │ │ Row 2: User data           │ │
│          │ │ Row 3: User data           │ │
│          │ │ Row 4: User data           │ │
│          │ │ Row 5: User data           │ │
│          │ │ Row 6: User data           │ │
│          │ │ Row 7: User data           │ │
│          │ │ Row 8: User data           │ │
│          │ └────────────────────────────┘ │
│          │ [Prev] [1] [2] [3] [Next]     │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Filter Bar**:
- Search input (300px wide): placeholder "Search by name or email..."
- Dropdown: `[Role ▼]` with options: All, Admin, Manager, Supervisor, User
- Dropdown: `[Department ▼]` with all departments
- Toggle: `Active/Inactive`
- Button: `[Clear All]` (Secondary, Small)

**Add User Button**:
- `[+ Add User]` (Primary, Medium)
- Opens modal with form:
  - Username input
  - Email input
  - Name input
  - Role dropdown
  - Department multi-select
  - Password input
  - `[Cancel]` `[Add User]`

**Table**:
- Columns: ☐ | Username | Email | Name | Role | Department | Status | Actions
- Checkbox on left (for bulk select)
- Rows: 8 sample users with various roles
- Status badges: Green (Active), Gray (Inactive)
- Actions per row: `[Edit]` `[Delete]` (icons or text)

**Table Row example**:
```
☐ | john.smith   | john@email.com | John Smith | Manager | Marketing | ✓ Active | [Edit] [Delete]
☐ | sarah.jones  | sarah@email.com| Sarah J.   | Supervisor | Sales | ✓ Active | [Edit] [Delete]
☐ | mike.brown   | mike@email.com | Mike Brown | User | Marketing | ⭕ Inactive | [Edit] [Delete]
```

**Pagination** (bottom):
- `[← Prev]` `[1]` `[2]` `[3]` `[4]` `[Next →]`
- Text: "Showing 1-25 of 127 users"
- Rows per page dropdown: `[25 ▼]` (10, 25, 50, 100)

---

### Page 4: ACCOUNTS

**Artboard size**: 1440px × 1400px

**Layout** (Card View Option):
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Accounts                       │
│          │ ┌────────────────────────────┐ │
│          │ │ [+ Add Account] [View ▼]   │ │
│          │ │ [Search...] [Filters...]   │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌──────────┐ ┌──────────┐     │
│          │ │ Account  │ │ Account  │    │
│          │ │ ID: 1234 │ │ ID: 5678 │    │
│          │ │ Name: A  │ │ Name: B  │    │
│          │ │ Status   │ │ Status   │    │
│          │ │ Pending  │ │ Active   │    │
│          │ │ Workflow │ │ Workflow │    │
│          │ │ [Edit]   │ │ [Edit]   │    │
│          │ └──────────┘ └──────────┘    │
│          │ ┌──────────┐ ┌──────────┐     │
│          │ │ Account  │ │ Account  │    │
│          │ │ ...      │ │ ...      │    │
│          │ └──────────┘ └──────────┘    │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Card Component** (290px × 240px):
- Background: White, Shadow Elevation-2
- Border: 1px Neutral-300
- Padding: 20px
- Style:
```
╔═══════════════════════════════════╗
║ ID: 1234567890                    ║
║ Account Name                      ║
║                                   ║
║ Status: [Pending badge]           ║
║ Workflow: [Workflow-1 badge]      ║
║ Sheet: [Link icon] google-sheet   ║
║                                   ║
║ [Edit] [Delete] [View]            ║
╚═══════════════════════════════════╝
```

**Filters**:
- Search: "Search by ID or name..."
- Dropdown: `[Status ▼]` (All, Pending, Active)
- Dropdown: `[Workflow ▼]` (All, Workflow-1, 2, 3, Default)
- Dropdown: `[Manager ▼]` (All managers)

**View Toggle** (top right):
- `[≢ Cards]` `[≣ Table]` buttons (only Cards shown for this design)

---

### Page 5: CAMPAIGNS

**Artboard size**: 1440px × 1400px

**Layout**:
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Campaigns                      │
│          │ ┌────────────────────────────┐ │
│          │ │ Select Account: [Google #] │ │
│          │ │ [🔄 Sync from Sheet]       │ │
│          │ │ Search... [Filters...]     │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌────────────────────────────┐ │
│          │ │ Syncing: 45/100 campaigns  │ │
│          │ │ [████████░░░░░░░░] 45%     │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌────────────────────────────┐ │
│          │ │ Campaign Table             │ │
│          │ │ [Checkbox header]          │ │
│          │ │ ├─────────────────────────┤│
│          │ │ │ ☐ Campaign Name | Conds││
│          │ │ │ ☐ Campaign Name | Conds││
│          │ │ │ ☐ Campaign Name | Conds││
│          │ │ │ [Select all] [Enable...]││
│          │ │ └────────────────────────┘│
│          │ └────────────────────────────┘ │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Account Selector** (top section):
- Dropdown with account list
- Shows: "ID: 1234567 | Account Name"

**Sync Button**:
- `[🔄 Sync from Google Sheet]` (Primary, Medium)
- When clicked: show progress bar
- Progress bar: "Synced 45 of 100 campaigns"

**Campaign Table**:
- Columns: ☐ | Campaign Name | Conditions | Status | Last Updated | Actions
- Rows: 8 campaigns
- Status: Toggle button (on/off)
- Conditions: Badge showing count (e.g., "3 conditions")
- Actions: `[Edit]` `[Delete]`

**Bulk Actions**:
- Bottom of table after select-all checkbox
- `[Bulk Edit]` `[Bulk Enable]` `[Bulk Disable]` `[Delete Selected]`

**Edit Campaign Modal** (on `[Edit]` click):
- Modal with card design (600px)
- Title: Campaign name (read-only)
- Section: Conditions Builder
  - `[+ Add Condition]` button
  - List of current conditions (removable pills)
    - `[X Condition-1]` `[X Condition-2]`
  - Condition template dropdown
- `[Cancel]` `[Save]` buttons

---

### Page 6: DRIVE MANAGER

**Artboard size**: 1440px × 1400px

**Layout**:
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Drive Manager                  │
│          │ ┌────────────────────────────┐ │
│          │ │ Home > Folder > Subfolder  │ │
│          │ │ [+ New] [Sync] [Search...] │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌────────────────────────────┐ │
│          │ │ Drag files here or click   │ │
│          │ │ [Click to upload]          │ │
│          │ │ Max 10MB per file          │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌────────────────────────────┐ │
│          │ │ Files/Folders List         │ │
│          │ │ ┌──────────────────────┐   │ │
│          │ │ │📁 Folder-1       →    │  │
│          │ │ │📄 file-1.pdf (2MB)   │  │
│          │ │ │📊 sheet-1.xlsx (1MB) │  │
│          │ │ │📄 file-2.doc (800KB) │  │
│          │ │ │📁 Subfolder      →    │  │
│          │ │ │📷 image.png (3MB)    │  │
│          │ │ │📄 file-3.pdf (1.5MB) │  │
│          │ │ │📄 file-4.docx (600KB)│  │
│          │ │ └──────────────────────┘   │
│          │ └────────────────────────────┘ │
│          │ [← Prev] [1] [2] [Next →]     │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Breadcrumb**:
- Home > Projects > Marketing > Q1 Plans
- Click each to navigate back

**Create Menu** (top right):
- `[+ Create ▼]` button
- Dropdown options:
  - New Folder
  - New Google Sheet
  - New Google Doc
  - New Google Slides

**Upload Zone**:
- Dashed border rectangle (500px × 160px)
- Text: "Drag files here or click to upload"
- Subtext: "Supported: PDF, XLS, XLSX, DOC, DOCX, PNG, JPG, GIF (Max 10MB each)"
- Icon: Cloud upload (48px)

**File List** (Table or Card view):
- Icon | Name | Type | Size | Owner | Last Modified | Actions
- Icons: 📁 (folder), 📄 (doc), 📊 (sheet), 📷 (image)
- Actions per row: `[Download]` `[Share]` `[Delete]`

**Upload Progress**:
- While uploading: Progress bar with filename
- Example: `[file.pdf ▓▓▓▓░░░░░ 40%] [Cancel]`

---

### Page 7: LOOKER REPORTS

**Artboard size**: 1440px × 1200px

**Layout**:
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Reports                        │
│          │ ┌────────────────────────────┐ │
│          │ │ Search... [Category ▼]     │ │
│          │ │ [Date Range ▼]             │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌──────────┐ ┌──────────────┐ │
│          │ │ Report   │ │ Report Title │ │
│          │ │ Title    │ │ Description  │ │
│          │ │          │ │              │ │
│          │ │ [Chart   │ │ Last Updated │ │
│          │ │  preview]│ │ 2 days ago   │ │
│          │ │          │ │              │ │
│          │ │[View Full]│ │ [View Full] │ │
│          │ └──────────┘ └──────────────┘ │
│          │                                │
│          │ ┌──────────┐ ┌──────────────┐ │
│          │ │ Report   │ │ Report Title │ │
│          │ │ ...      │ │ ...          │ │
│          │ └──────────┘ └──────────────┘ │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Report Card** (320px × 280px):
- Background: White, Shadow Elevation-2
- Title: H3 (18px, dark)
- Description: Body-Regular (14px, gray)
- Chart preview: Placeholder rectangle (colored bars or line chart)
- Last Updated: Body-Small (12px, gray)
- Button: `[View Full Report]` (Secondary, Small)

**Filter Section**:
- Search: "Search reports..."
- Dropdown: `[Category ▼]` (Financial, HR, Marketing, etc.)
- Dropdown: `[Date Range ▼]` (Last 30 days, Last 90 days, YTD, Custom)

---

### Page 8: TASKS ⭐ (MOST DETAILED)

**Artboard size**: 1440px × 1800px

**Overview**:
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Tasks                          │
│          │ ┌────────────────────────────┐ │
│          │ │ Filters, Search, [+ New]   │ │
│          │ │ [Tab Bar: All | Assigned..] │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ ┌────────────────────────────┐ │
│          │ │ Tasks Table (many rows)    │ │
│          │ │ - Checkboxes on left       │ │
│          │ │ - Title, Assigned, Dept    │ │
│          │ │ - Priority, Status, Due    │ │
│          │ │ - Action buttons per row   │ │
│          │ │ - [Edit] [Approve][Decline]│ │
│          │ │ - [Download] [View] [Delete]│ │
│          │ └────────────────────────────┘ │
│          │ [Pagination]                   │
│          │                                │
│          │ [TASK MODAL OVERLAY]           │
│          │ ┌─────────────────────────┐   │
│          │ │ Task Details      [X]   │   │
│          │ │ ────────────────────────│   │
│          │ │ [Details|Approval|...]  │   │
│          │ │                         │   │
│          │ │ Tab content area        │   │
│          │ │                         │   │
│          │ │ [Cancel] [Save] [Delete]│   │
│          │ └─────────────────────────┘   │
│          │                                │
└──────────┴────────────────────────────────┘
```

#### Tasks Table Design:

**Columns** (left to right):
1. Checkbox (for bulk select)
2. Title (text, bold)
3. Assigned To (user avatar + name)
4. Department (text)
5. Priority (badge: High/Medium/Low)
6. Status (badge: Open/Pending/Approved/Declined/Completed)
7. Due Date (text, gray)
8. Actions (button group or menu)

**Sample Row**:
```
☐ | Q1 Marketing Plan | 👤 John Doe | Marketing | [HIGH] | [Pending Approval] | Jan 15 | [Edit] [Approve] [Decline]
☐ | Q1 Budget Review  | 👤 Sarah J  | Finance   | [MED]  | [Open]             | Jan 20 | [Edit] [Complete] [Delete]
```

**Status Badge Colors**:
- Open: Blue (#3B82F6)
- Pending Approval: Orange (#F59E0B)
- Approved: Green (#10B981)
- Declined: Red (#EF4444)
- Completed: Gray (#6B7280)

**Priority Badge Colors**:
- High: Red (#DC2626)
- Medium: Orange (#F59E0B)
- Low: Blue (#3B82F6)

#### Filter Bar:

**Row 1**:
- `[Status ▼: All]` (dropdown)
- `[Priority ▼: All]` (dropdown)
- `[My Tasks]` (toggle button)
- `[Awaiting Approval]` (toggle button)

**Row 2**:
- `[Department ▼: All]`
- `[Due Date ▼: All]`
- `[Assigned To ▼: All]`
- `[Clear All Filters]` (reset button)

**Search**:
- Search bar: "Search by title or description..."

#### Tabs:

- `[All Tasks (42)]`
- `[Assigned to Me (8)]`
- `[Created by Me (15)]`
- `[Awaiting My Approval (3)]`

#### Task Modal Dialog (600px × 800px):

**Design**:
```
╔════════════════════════════════════════════════╗
║ Task Details                            [X]    ║
╟────────────────────────────────────────────────╢
║ [Details] [Approval] [Attachments] [Comments] ║
║ [History]                                      ║
╟────────────────────────────────────────────────╢
║                                                ║
║ TAB 1: DETAILS                                 ║
║ ───────────────────────────────────────────── ║
║ Title *                                        ║
║ [Q1 Marketing Plan........................]     ║
║                                                ║
║ Description                                    ║
║ [Multi-line text area.....................]    ║
║ [.........................................]    ║
║                                                ║
║ Priority *                     [High ▼]       ║
║ Status *                       [Open ▼]       ║
║ Assigned To *                  [John Doe ▼]  ║
║ Department *                   [Marketing ▼] ║
║ Due Date *                     [📅 Jan 15]   ║
║ Workflow                       [Workflow-1▼] ║
║                                                ║
║ Tags                                           ║
║ [+ Add Tag] [x marketing] [x urgent]          ║
║                                                ║
║ Share With                                     ║
║ [+ Add Users]                                  ║
║ [x John Smith] [x Sarah Jones]                ║
║                                                ║
╠════════════════════════════════════════════════╣
║ [Cancel] [💾 Save] [🗑️ Delete]               ║
╚════════════════════════════════════════════════╝
```

**TAB 2: APPROVAL**:
```
╔════════════════════════════════════════════════╗
║ [Details] [Approval] [Attachments]...         ║
╟────────────────────────────────────────────────╢
║                                                ║
║ Approval Chain                                 ║
║                                                ║
║     John (Creator)                             ║
║            ↓                                    ║
║    ✓ Sarah (Manager) - Approved Jan 10 2:30pm ║
║            ↓                                    ║
║    ○ Mike (Director) - Pending                ║
║            ↓                                    ║
║    ○ Lisa (CFO) - Will review after Mike      ║
║                                                ║
║ APPROVAL HISTORY                              ║
║ ┌──────────────────────────────────────────┐ ║
║ │ Approver │ Action   │ Date/Time          │ ║
║ ├──────────┼──────────┼────────────────────┤ ║
║ │ Sarah    │ Approved │ Jan 10, 2:30 PM   │ ║
║ │ John     │ Created  │ Jan 9, 10:00 AM   │ ║
║ └──────────┴──────────┴────────────────────┘ ║
║                                                ║
║ [Approve] [Decline] [Request More Info]       ║
║                                                ║
╚════════════════════════════════════════════════╝
```

**TAB 3: ATTACHMENTS**:
```
╔════════════════════════════════════════════════╗
║ [Details] [Approval] [Attachments]...         ║
╟────────────────────────────────────────────────╢
║                                                ║
║ ATTACHED FILES                                 ║
║ ┌────────────────────────────────────────────┐║
║ │ 📄 proposal.pdf (2.4 MB)                   ││
║ │ Uploaded Jan 9 by John                     ││
║ │ [⬇️ Download] [👁️ Preview] [🗑️ Remove]    ││
║ └────────────────────────────────────────────┘║
║                                                ║
║ ┌────────────────────────────────────────────┐║
║ │ 📊 data.xlsx (1.1 MB)                      ││
║ │ Uploaded Jan 10 by Sarah                   ││
║ │ [⬇️ Download] [👁️ Preview] [🗑️ Remove]    ││
║ └────────────────────────────────────────────┘║
║                                                ║
║ UPLOAD SECTION                                 ║
║ ╔════════════════════════════════════════════╗║
║ ║ Drag files here or click to upload         ║║
║ ║ Supported: PDF, XLS, DOCX, PNG, JPG       ║║
║ ║ Max 10MB each                              ║║
║ ╚════════════════════════════════════════════╝║
║                                                ║
║ [+ Add More Files] [Download All] [Clear All] ║
║                                                ║
╚════════════════════════════════════════════════╝
```

**TAB 4: COMMENTS**:
```
╔════════════════════════════════════════════════╗
║ [Details] [Approval] [Attachments]...         ║
╟────────────────────────────────────────────────╢
║                                                ║
║ COMMENTS                                       ║
║                                                ║
║ John (Creator) - Jan 9, 10:00 AM              ║
║ ────────────────────────────────────────────  ║
║ Here's the task. Please review and approve.   ║
║ [Edit] [Delete] [Reply]                       ║
║                                                ║
║ Sarah (Manager) - Jan 10, 2:30 PM             ║
║ ────────────────────────────────────────────  ║
║ One more clarification needed on section 3.   ║
║ [Edit] [Delete] [Reply]                       ║
║                                                ║
║   ↳ John (Creator) - Jan 10, 3:45 PM         ║
║     ──────────────────────────────            ║
║     Added more details in attachment.         ║
║     [Edit] [Delete]                           ║
║                                                ║
║ ADD COMMENT                                    ║
║ ┌────────────────────────────────────────────┐║
║ │ [👤 You]                                   ││
║ │ [Your comment here.........................]││
║ │ [Attach] [@ Mention] [Format ▼]           ││
║ │ [Send] [Cancel]                            ││
║ └────────────────────────────────────────────┘║
║                                                ║
╚════════════════════════════════════════════════╝
```

**TAB 5: HISTORY**:
```
╔════════════════════════════════════════════════╗
║ [Details] [Approval] [Attachments]...         ║
╟────────────────────────────────────────────────╢
║ ACTIVITY LOG                                   ║
║ ┌──────────────────────────────────────────┐ ║
║ │ Time            │ User   │ Action        │ ║
║ ├──────────────────┼────────┼──────────────┤ ║
║ │ Jan 10, 5:00 PM │ Sarah  │ Approved     │ ║
║ │ Jan 10, 3:45 PM │ John   │ Updated      │ ║
║ │ Jan 10, 3:45 PM │ John   │ Uploaded     │ ║
║ │ Jan 10, 2:30 PM │ Sarah  │ Commented    │ ║
║ │ Jan 10, 2:30 PM │ Sarah  │ Status Changed│ ║
║ │ Jan 9, 10:00 AM │ John   │ Created      │ ║
║ └──────────────────┴────────┴──────────────┘ ║
║                                                ║
║ [⬇️ Export Log]                                ║
║                                                ║
╚════════════════════════════════════════════════╝
```

#### Decline Reason Modal (400px × 300px):

```
╔════════════════════════════════════════════════╗
║ Decline Task                            [X]    ║
╟────────────────────────────────────────────────╢
║ Task: "Q1 Marketing Plan"                      ║
║                                                ║
║ Why are you declining?                         ║
║ ┌────────────────────────────────────────────┐║
║ │ Incomplete details              ▼           ││
║ │ Options:                                    ││
║ │ - More information needed                  ││
║ │ - Needs revision                           ││
║ │ - Not aligned with goals                   ││
║ │ - Other                                    ││
║ └────────────────────────────────────────────┘║
║                                                ║
║ Additional Notes                               ║
║ ┌────────────────────────────────────────────┐║
║ │ [Please provide more context...]           ││
║ │ [......................................]   ││
║ └────────────────────────────────────────────┘║
║                                                ║
║ [Cancel] [✕ Decline Task]                     ║
╚════════════════════════════════════════════════╝
```

#### Delete Confirmation Modal (400px × 200px):

```
╔════════════════════════════════════════════════╗
║ Delete Task?                            [X]    ║
╟────────────────────────────────────────────────╢
║ Are you sure you want to delete this task?    ║
║                                                ║
║ "Q1 Marketing Plan"                            ║
║                                                ║
║ ⚠️ This action cannot be undone.              ║
║ ⚠️ Comments and attachments will be deleted.  ║
║                                                ║
║ [Cancel] [🗑️ Delete Task]                     ║
╚════════════════════════════════════════════════╝
```

#### Mobile Version (390px):

**Modal becomes a bottom sheet**:
```
┌──────────────────────┐
│ 🔽 Close             │  ← Drag handle
├──────────────────────┤
│ [Details][Approval..]│
│                      │
│ Form fields (full w) │
│                      │
│ Tab content area     │
│                      │
│                      │
│ [Cancel] [💾 Save]   │
└──────────────────────┘
```

---

### Page 9: SETTINGS

**Artboard size**: 1440px × 1400px

**Layout** (Tabbed):
```
┌────────────────────────────────────────────┐
│  [Top Nav]                                 │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Settings                       │
│          │ ┌────────────────────────────┐ │
│          │ │ [Profile] [Password] [...]│ │
│          │ │ [Notifications] [Sessions] │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ PROFILE TAB                    │
│          │ ┌────────────────────────────┐ │
│          │ │ Avatar Upload              │ │
│          │ │ [🖼️ Profile Picture] [+]   │ │
│          │ │                            │ │
│          │ │ Name: [John Doe........]   │ │
│          │ │ Email: [john@email.com...] │ │
│          │ │ Username: john_doe (R/O)   │ │
│          │ │ Created: Jan 1, 2024       │ │
│          │ │ Last Login: Today 2:30 PM  │ │
│          │ │                            │ │
│          │ │ [Save] [Cancel]            │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ PASSWORD TAB                   │
│          │ ┌────────────────────────────┐ │
│          │ │ Current Password:          │ │
│          │ │ [••••••••••••...] 👁️      │ │
│          │ │                            │ │
│          │ │ New Password:              │ │
│          │ │ [••••••••••••...] 👁️      │ │
│          │ │ Strength: Strong ▪▪▪▪▪   │ │
│          │ │                            │ │
│          │ │ Confirm Password:          │ │
│          │ │ [••••••••••••...] 👁️      │ │
│          │ │                            │ │
│          │ │ [Change Password]          │ │
│          │ └────────────────────────────┘ │
│          │                                │
│          │ NOTIFICATIONS TAB              │
│          │ ┌────────────────────────────┐ │
│          │ │ 🔔 Desktop Notifications   │ │
│          │ │ [Toggle: ON]               │ │
│          │ │                            │ │
│          │ │ Notification Types:        │ │
│          │ │ ☑ Task Approvals           │ │
│          │ │ ☑ Task Assignments        │ │
│          │ │ ☑ Workflow Updates        │ │
│          │ │ ☑ System Alerts           │ │
│          │ │                            │ │
│          │ │ [🔔 Send Test Notification] │ │
│          │ │ [Save]                     │ │
│          │ └────────────────────────────┘ │
│          │                                │
└──────────┴────────────────────────────────┘
```

**Profile Section**:
- Avatar upload with preview (128px circle)
- Edit icon on avatar
- Name field (input)
- Email field (input, can be read-only)
- Username (read-only)
- Account created date
- Last login date/time

**Password Section**:
- Current password input + show toggle
- New password input + show toggle
- Strength indicator (color + bar)
- Confirm password input + show toggle
- `[Change Password]` button

**Notification Preferences**:
- Toggle: Desktop Notifications (ON/OFF)
- Checkboxes:
  - ☑ Task Approvals
  - ☑ Task Assignments  
  - ☑ Workflow Status Updates
  - ☑ System Alerts
- Button: `[🔔 Send Test Notification]`

**Sessions Section** (optional):
- List of active sessions
- Device | Location | Last Active | Logout
- Example: "Chrome on MacOS | New York, NY | 2 hours ago | [Logout]"
- Button: `[Log out from all other devices]`

---

## 🎯 DESIGN TOKENS SUMMARY

Create a **Design Tokens** page in Figma documenting:

**Colors**:
- Primary: #003D82
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Text: #111827
- Border: #D1D5DB

**Typography**:
- Display: Poppins Bold 32px
- Heading: Poppins Semi-bold 20-24px
- Body: Inter Regular 14-16px

**Spacing**: 8px grid base unit

**Border Radius**: 4px (small), 8px (medium), 12px (large)

**Shadows**: 4 elevation levels

---

## 📤 DEVELOPER HANDOFF

After designing all 9 pages:

1. **Export Assets**:
   - All component variants
   - Color swatches
   - Typography styles
   - Icon set

2. **Create Spec Document**:
   - Copy all page designs to spec
   - Add measurements/spacing annotations
   - Note responsive breakpoints
   - Document interaction states

3. **Hand off to Code**:
   - Share Figma link with developers
   - Export React Component code from Figma (if using Figma to Code)
   - Developers create code from designs

---

## ✅ NEXT STEPS

1. **Create Figma file** with clear naming: "CMS Portal - UI Design"
2. **Setup design system first** (colors, typography, spacing)
3. **Create reusable components** (Button, Input, Modal, Table, etc.)
4. **Design all 9 pages** using components library
5. **Ensure responsive design** (show 1440px + 390px variants)
6. **Create spec document** with all measurements
7. **Export & hand off to developers**

---

**Total Figma Design Time: 4-6 hours for all 9 pages**

Once designs are complete, we'll generate code from them or hand off to developers for implementation.
