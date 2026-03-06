# 🎨 FUNSOL CMS PORTAL - COMPLETE DESIGN SYSTEM & SPECIFICATIONS

**Design Brief**: Professional & Corporate UI for Enterprise CMS Portal  
**Company**: Funsol  
**Primary Color**: Blue (#003D82)  
**Typography**: Inter (body), Roboto or Poppins (headers)  
**Modes**: Light + Dark  
**Breakpoints**: Desktop (1440px), Tablet (1024px), Mobile (390px)

---

## BRAND IDENTITY

### Logo Design
```
FUNSOL LOGO (AI Generated)
┌─────────────────────────────────┐
│  Funsol CMS Portal              │
│                                 │
│  [F] in circle (blue #003D82)   │
│   "FUNSOL" text in Roboto Bold  │
│   Subtitle: "Enterprise CMS"    │
│                                 │
│  48px for top nav               │
│  128px for login page           │
│  32px for sidebar               │
└─────────────────────────────────┘

Style: Minimalist, modern lettermark
Circle with "F" icon in white on blue background
Company name in dark text below
```

### Color Palette

**Primary (Blue)**:
- `Primary-900`: #0A0E27 (Almost black, used for dark backgrounds)
- `Primary-800`: #1F2E47 (Sidebar, headers, buttons)
- `Primary-700`: #2D3E5F (Hover states)
- `Primary-500`: #003D82 (Main brand blue, buttons, accents)
- `Primary-300`: #3B82F6 (Light blue, secondary buttons)
- `Primary-100`: #DBEAFE (Very light, backgrounds)

**Status Colors**:
- `Status-Open`: #3B82F6 (Blue - Open tasks)
- `Status-Pending`: #F59E0B (Orange - Awaiting approval)
- `Status-Approved`: #10B981 (Green - Approved)
- `Status-Declined`: #EF4444 (Red - Declined)
- `Status-Completed`: #6B7280 (Gray - Completed)

**Priority Colors**:
- `Priority-High`: #DC2626 (Red)
- `Priority-Medium`: #F59E0B (Orange)
- `Priority-Low`: #3B82F6 (Blue)

**Neutral (Gray Scale)**:
- `Neutral-900`: #111827 (Text, darkest)
- `Neutral-800`: #1F2937 (Secondary text)
- `Neutral-700`: #374151 (Placeholder text)
- `Neutral-500`: #6B7280 (Disabled text)
- `Neutral-300`: #D1D5DB (Borders, dividers)
- `Neutral-200`: #E5E7EB (Light backgrounds, hover)
- `Neutral-100`: #F3F4F6 (Light gray background)
- `Neutral-50`: #F9FAFB (Lightest background)
- `White`: #FFFFFF (Card backgrounds, clean areas)

**Semantic**:
- `Success`: #10B981
- `Warning`: #F59E0B
- `Error`: #EF4444
- `Info`: #3B82F6

**Dark Mode (Inverted)**:
- Background: #0F1419 (dark, almost black)
- Surface: #1A1D24 (cards, panels)
- Text-Primary: #F3F4F6 (light text)
- Text-Secondary: #D1D5DB (muted text)
- Border: #2D3139 (dark borders)

---

## TYPOGRAPHY SYSTEM

### Font Families
- **Headings**: Roboto Bold (700) or Poppins Bold (700)
- **Body**: Inter Regular (400)
- **Buttons**: Inter Semi-bold (600)
- **Code**: Monospace (optional, for tech content)

### Text Styles

**Display**:
- `Display-Large`: 40px, Bold, Line-height 1.2
- `Display-Medium`: 32px, Bold, Line-height 1.2

**Headings**:
- `H1`: 32px, Bold, Line-height 1.2, Color: Neutral-900
- `H2`: 24px, Bold, Line-height 1.3, Color: Neutral-900
- `H3`: 20px, Semi-bold (600), Line-height 1.4, Color: Neutral-900
- `H4`: 18px, Semi-bold (600), Line-height 1.4, Color: Neutral-900

**Body**:
- `Body-Large`: 16px, Regular (400), Line-height 1.5, Color: Neutral-900
- `Body-Regular`: 14px, Regular (400), Line-height 1.5, Color: Neutral-700
- `Body-Small`: 12px, Regular (400), Line-height 1.4, Color: Neutral-500

**Labels & Captions**:
- `Label`: 12px, Semi-bold (600), Line-height 1.4, Color: Neutral-700
- `Caption`: 11px, Regular (400), Line-height 1.4, Color: Neutral-500

**Buttons**:
- `Button-Large`: 16px, Semi-bold (600), Line-height 1.5
- `Button-Medium`: 14px, Semi-bold (600), Line-height 1.5
- `Button-Small`: 12px, Semi-bold (600), Line-height 1.4

---

## SPACING & LAYOUT GRID

**Base Unit**: 8px

**Spacing Scale**:
- `xs`: 4px (minimal spacing)
- `sm`: 8px (small spacing)
- `md`: 16px (standard spacing)
- `lg`: 24px (large spacing)
- `xl`: 32px (extra large)
- `2xl`: 48px (section spacing)
- `3xl`: 64px (major sections)

**Responsive Breakpoints**:
- Desktop: 1440px (full layout)
- Tablet Large: 1024px (adjusted grid)
- Tablet: 768px (2-col to 1-col)
- Mobile: 390px (single column, stacked)

**Component Sizing**:
- Button Height: 40px (medium, standard)
- Input Height: 40px (consistent with buttons)
- Card Padding: 24px (comfortable spacing)
- Modal Padding: 32px (breathing room)
- Sidebar Width: 280px (desktop), 60px (collapsed), hidden < 768px

---

## ELEVATION & SHADOWS

**Shadows** (for depth):
- `Elevation-1`: 0 1px 3px rgba(0, 0, 0, 0.1) (subtle)
- `Elevation-2`: 0 4px 6px rgba(0, 0, 0, 0.1) (cards, buttons)
- `Elevation-3`: 0 10px 15px rgba(0, 0, 0, 0.1) (modals, hover)
- `Elevation-4`: 0 20px 25px rgba(0, 0, 0, 0.15) (emphasis)
- `Elevation-5`: 0 25px 50px rgba(0, 0, 0, 0.25) (dropdowns, top layers)

**Dark Mode Shadows**:
- Same elevation levels, slightly different opacity

---

## CORNER RADIUS

- `xs`: 2px (minimal rounding)
- `sm`: 4px (inputs, buttons, small elements)
- `md`: 8px (cards, modals, medium elements)
- `lg`: 12px (large containers)
- `round`: 50% (avatars, circles)

---

## COMPONENT LIBRARY SPECIFICATIONS

### Button Component

**Sizing**:
- `Small`: 36px height, 8px padding, 12px font
- `Medium`: 40px height (default), 12px padding, 14px font
- `Large`: 44px height, 16px padding, 16px font

**Variants**:
1. **Primary** (Brand Blue)
   - Background: Primary-500 (#003D82)
   - Text: White
   - Border: None
   - Hover: Primary-700 (#2D3E5F), shadow lift
   - Active: Primary-800 (#1F2E47)
   - Disabled: Neutral-300, 50% opacity

2. **Secondary** (Outline)
   - Background: White
   - Text: Primary-500
   - Border: 1px Primary-500
   - Hover: Primary-100 bg, Primary-700 text
   - Disabled: Neutral-300, 50% opacity

3. **Success** (Green)
   - Background: Status-Approved (#10B981)
   - Text: White
   - Hover: darker green
   - Used for: Approve, Save, Complete

4. **Danger** (Red)
   - Background: Status-Declined (#EF4444)
   - Text: White
   - Hover: darker red
   - Used for: Delete, Decline, Remove

5. **Ghost** (Transparent)
   - Background: Transparent
   - Text: Primary-500
   - Border: None
   - Hover: Primary-100 bg
   - Used for: Light actions, secondary options

**States**:
- Default (as above)
- Hover (shadow Elevation-2, color shift)
- Active (color intensity +10%)
- Disabled (opacity 50%, no hover)
- Loading (spinner inside, text hidden)
- Focus (2px outline, Primary-300)

**Icon Buttons**:
- Icon only, no text
- Same sizing as text buttons
- Square shape (so equal width/height)

---

### Input Component

**Sizing**:
- Height: 40px (standard)
- Padding: 10px 12px (horizontal-vertical)
- Placeholder text color: Neutral-500
- Text color: Neutral-900

**Types**:
1. **Text Input**
   - Border: 1px Neutral-300
   - Border Radius: 4px
   - Background: White (light), #1A1D24 (dark mode)
   - Focus: 2px blue border (Primary-500), shadow Elevation-1
   - Error: Red border (Status-Declined), error message below in red

2. **Password Input**
   - Symbol: ••••••••
   - Show/Hide toggle icon on right
   - Icons: Eye (show), Eye-slash (hide)

3. **Email Input**
   - Specific keyboard on mobile (@, .com suggestions)

4. **Textarea**
   - Min height: 100px
   - Can be resized (allow user resize)
   - Same border/padding as text input
   - Scrollbar (styled)

5. **Number Input**
   - Plus/minus buttons on right (optional)
   - Or just standard number input

6. **Date Input**
   - Calendar icon on right
   - Click opens date picker
   - Format: MM/DD/YYYY

**States**:
- Default (empty)
- Focused (blue border + shadow)
- Filled (with value)
- Error (red border + error text)
- Disabled (gray background, 50% opacity)
- Read-only (no border, gray background)

---

### Select/Dropdown Component

**Sizing**:
- Height: 40px
- Same padding as inputs (10px 12px)
- Border: 1px Neutral-300
- Border Radius: 4px

**Parts**:
- Selected value text (Body-Regular, 14px)
- Chevron icon on right (rotate on open)
- Dropdown menu (appears below)

**Dropdown Menu**:
- Position: Below select, full width or more
- Background: White (light), #1A1D24 (dark)
- Shadow: Elevation-5
- Border: 1px Neutral-300

**Options in Dropdown**:
- Padding: 10px 12px per option
- Height: 36px per option
- Hover: Neutral-100 background
- Selected: Primary-100 background, blue checkmark
- Separator: 1px Neutral-300 (optional)

**States**:
- Closed (shows selected value)
- Open (menu expands)
- Hover (light blue bg)
- Focused (2px blue border)
- Disabled (gray, no interaction)

---

### Badge Component

**Sizing & Padding**:
- Padding: 6px 12px
- Border Radius: 4px
- Height: ~24px total
- Font: Caption (12px, regular or semi-bold)

**Status Badges**:
- Open: Background Primary-100, Text Primary-800
- Pending: Background #FEF3C7, Text #92400E
- Approved: Background #ECFDF5, Text #065F46
- Declined: Background #FEE2E2, Text #7F1D1D
- Completed: Background #F3F4F6, Text #1F2937

**Priority Badges**:
- High: Background #FEE2E2, Text #DC2626
- Medium: Background #FEF3C7, Text #92400E
- Low: Background #DBEAFE, Text #003F87

**Variants**:
- Solid (colored background + darker text)
- Outline (transparent bg, colored border, colored text)
- Ghost (no border, colored text only)

---

### Card Component

**Design**:
- Background: White (light), #1A1D24 (dark mode)
- Border: 1px Neutral-300 (light), #2D3139 (dark)
- Border Radius: 8px
- Padding: 24px
- Shadow: Elevation-2 (always)
- Hover: Shadow Elevation-3, border color → Primary-500

**Variants**:
- Standard (padding 24px)
- Compact (padding 16px, smaller text)
- Borderless (no border, shadow only)

---

### Modal/Dialog Component

**Design**:
- Background: White (light), #1A1D24 (dark)
- Border Radius: 12px
- Padding: 32px
- Shadow: Elevation-5 (max elevation for focus)
- Max Width: 600px (desktop), 95% (mobile < 768px)
- Overlay: Black 50% opacity (slightly transparent)

**Structure**:
1. **Header**:
   - H2 title on left
   - Close button (X icon) on right (16px size)
   - Border-bottom: 1px Neutral-300
   - Padding-bottom: 16px

2. **Body**:
   - Content area (form fields, text, etc.)
   - Padding: 24px (top/bottom)
   - Max height: 70vh (scrollable if too long)

3. **Footer**:
   - Border-top: 1px Neutral-300
   - Padding-top: 16px
   - Action buttons right-aligned
   - Usually: Cancel (Secondary) + Primary Action (Primary)
   - Spacing between buttons: 12px

**Mobile (< 768px)**:
- Opens as bottom sheet (drawer from bottom)
- Full width minus 16px margin on sides
- Rounded top corners only (12px)
- Drag handle at top (visual indicator)
- Swipe down to close

---

### Table Component

**Design**:
- Background: White (light), #1A1D24 (dark)
- Border/Dividers: 1px Neutral-300

**Header Row**:
- Background: Primary-900 (dark blue) or Primary-100 (light)
- Text: White or Primary-800
- Font: Body-Regular, Semi-bold (600)
- Padding: 16px per cell
- Height: 44px
- Sortable columns: Show up/down arrows on hover

**Data Rows**:
- Height: 48px
- Padding: 16px per cell
- Border-bottom: 1px Neutral-300
- Hover: Background Neutral-100 (light), darker shade (dark)
- Selected: Background Primary-100, 2px left border Primary-500

**Cells**:
- Text color: Neutral-900
- Align: Left (text), Center (numbers), Right (actions)
- Vertical align: Middle

**Actions Column**:
- 3 dots menu (⋮) or inline buttons
- Buttons: Edit, Delete, View, etc.
- Hover: Show/highlight buttons

**Checkboxes** (left column):
- Checkbox for bulk select per row
- Header checkbox for "Select All"
- Indeterminate state if partially selected

**Pagination** (below table):
- Text: "Showing 1-25 of 100 items"
- Prev/Next buttons (disabled if at start/end)
- Page numbers (current page highlighted)
- Rows per page dropdown: 10, 25, 50, 100

---

### Avatar Component

**Sizing**:
- Small: 32px (in tables, lists)
- Medium: 40px (in cards)
- Large: 48px (in modals, profiles)
- Extra Large: 64px (profile page)

**Design**:
- Border Radius: 50% (perfect circle)
- Border: 2px White
- Background: Primary-500 (blue default)
- Text: White initials (H3 size for large, Body-Small for small)
- Shadow: Elevation-1 (subtle depth)

**States**:
- With image: Show profile photo instead of initials
- With status icon: Small green dot (online), gray (offline) in bottom-right corner
- Tooltip on hover: Show full name

---

### Toast/Notification Component

**Positioning**:
- Top-right corner (fixed)
- Margin: 16px from top and right
- Z-index: Always on top

**Sizing**:
- Width: 340px (desktop), 90% (mobile)
- Padding: 16px
- Border Radius: 8px
- Shadow: Elevation-4

**Types**:
1. **Success** (Green)
   - Background: #ECFDF5
   - Text: #065F46
   - Border-left: 4px #10B981
   - Icon: ✓ checkmark (green)

2. **Error** (Red)
   - Background: #FEE2E2
   - Text: #7F1D1D
   - Border-left: 4px #EF4444
   - Icon: ⚠ warning (red)

3. **Info** (Blue)
   - Background: #DBEAFE
   - Text: #003F87
   - Border-left: 4px #3B82F6
   - Icon: ℹ info (blue)

4. **Warning** (Orange)
   - Background: #FEF3C7
   - Text: #92400E
   - Border-left: 4px #F59E0B
   - Icon: ⚠ warning (orange)

**Features**:
- Auto-dismiss after 5 seconds (slide out)
- Close button (X) on right
- Animation: Slide in from right, slide out to right
- Multiple toasts: Stack vertically

**Content**:
- Title (optional): Bold, Body-Large
- Message: Body-Regular
- Action button (optional): Secondary style

---

## LAYOUT COMPONENTS

### Top Navigation Bar (Persistent)

**Sizing**:
- Height: 60px
- Position: Fixed at top
- Z-index: 100 (above content)
- Shadow: Elevation-2

**Light Mode**:
- Background: Primary-900 (#0A0E27)
- Text: White

**Dark Mode**:
- Background: #0F1419 (slightly lighter than Primary-900)
- Text: White

**Content Layout**:

**Left Section** (Logo & Nav Toggle):
- Menu icon (☰) - visible < 1024px (tablet), hidden on desktop
- Logo/Text: 48px icon + "FUNSOL" text
- Font: H3, bold, white
- Click logo → goes to Dashboard

**Center Section** (Search - hidden < 768px):
- Search input: 240px wide
- Placeholder: "Search tasks, accounts, campaigns..."
- Icon: 🔍 on left
- Background: Neutral-700
- Text: White
- Border: 1px Neutral-600
- Border Radius: 4px
- Padding: 8px 12px

**Right Section** (User & Notifications):
- Notification bell icon (🔔)
  - Click shows notification dropdown (not main focus)
- User avatar (32px) + dropdown menu
  - Menu options:
    - "Profile"
    - "Settings"
    - "Logout"

**Spacing**:
- Left to Logo: 16px
- Logo to Search: 32px
- Search to Notifications: 32px
- Notifications to Avatar: 16px
- Right edge: 16px

---

### Sidebar Navigation (Persistent)

**Sizing**:
- Desktop: 280px wide
- Tablet (768px-1024px): 60px (compact, icons only)
- Mobile (< 768px): Hidden (becomes drawer)

**Styling**:
- Background: Primary-900 (#0A0E27)
- Position: Fixed or sticky left
- Height: Full viewport (below top nav)
- Shadow: Elevation-2 (on right edge)

**Navigation Items**:
- Items: Dashboard, Users, Accounts, Campaigns, Drive, Reports, Tasks, Settings
- Height: 48px per item (clickable area)
- Padding: 12px 16px
- Icon (24px) + Text (14px) on desktop
- Icon only on tablet
- Text: White, Body-Regular

**Item States**:
- Default: Text gray-ish white
- Hover: Background Primary-700 (#2D3E5F), text white
- Active/Current Page: Background Primary-500 (#003D82), text white, left border 4px Primary-300

**Icon Design**:
- Dashboard: 🏠 (home)
- Users: 👥 (people)
- Accounts: 💼 (briefcase)
- Campaigns: 📋 (clipboard)
- Drive: 📁 (folder)
- Reports: 📊 (chart)
- Tasks: ✓ (checkmark) or 📝 (notes)
- Settings: ⚙️ (gear)

**Mobile Drawer** (< 768px):
- Slide-out from left when menu (☰) clicked
- Full-width drawer with items stacked vertically
- Close button (X) at top
- Semi-transparent overlay behind drawer

---

### Page Header

**Sizing**:
- Height: 80px
- Position: Below top nav
- Background: White (light), #1A1D24 (dark)
- Border-bottom: 1px Neutral-300
- Padding: 16px 24px

**Content Layout**:

**Left Side**:
1. **Breadcrumb** (above):
   - Text: "Home > Section > Current Page"
   - Font: Body-Small, gray
   - Separator: " > "
   - Links: Clickable (hover underline)

2. **Page Title** (below breadcrumb):
   - Font: H2 (24px), bold
   - Color: Neutral-900
   - Example: "Tasks"

3. **Subtitle** (optional, under title):
   - Font: Body-Regular, gray
   - Example: "Create and manage tasks with approval workflows"

**Right Side**:
1. **Primary Action Button**:
   - Font: Button-Medium
   - Size: Medium
   - Color: Primary (blue)
   - Text: "[+ New Task]", "[+ Add User]", etc.
   - Position: Top-right of header

2. **More Menu** (⋮):
   - Dropdown with additional actions
   - Options: Bulk Edit, Export CSV, Print, Help, etc.
   - Icon-only button (3 vertical dots)

**Spacing**:
- Between breadcrumb & title: 8px
- Between elements: 16px
- Right edge: 24px

---

## DARK MODE SPECIFICATIONS

**Light Mode (Default)**:
- Page background: #F9FAFB (Neutral-50)
- Card background: White
- Text: Neutral-900
- Borders: Neutral-300

**Dark Mode** (toggle in settings):
- Page background: #0F1419 (very dark blue-gray)
- Card background: #1A1D24
- Text: #F3F4F6 (light gray)
- Borders: #2D3139

**Color Adjustments**:
- Badges: Slightly more saturated (for visibility)
- Shadows: Slightly stronger (to show elevation)
- Icons: Light-color versions
- Images: Optional overlay or grayscale reduction

**Dark Mode Toggle**:
- Located in Settings page
- Or quick toggle in Top Nav (optional)
- Preference saved in localStorage/DB

---

## RESPONSIVE DESIGN SPECIFICATIONS

### Desktop Layout (1440px+)
- Sidebar: 280px visible
- Main content: 1160px wide
- 2-3 column grids for cards
- Full table functionality (all columns visible)
- Modals: Center-aligned, 600px max-width

### Tablet Large Layout (1024px)
- Sidebar: 60px (icons only)
- Main content: 964px wide
- 2 column grids
- Some table columns hidden (show in expandable row)
- Modals: Full-width minus 32px margin

### Tablet Layout (768px)
- Sidebar: Hidden (becomes hamburger drawer)
- Main content: Full width minus 16px padding
- 1 column grid (cards stack)
- Table: Scrollable, or card view
- Modals: Bottom sheet (drawer from bottom)

### Mobile Layout (390px)
- Sidebar: Hidden drawer (swipe from left)
- Main content: Full width minus 16px padding
- All cards: Full width, stacked
- Table: Card view or scrollable
- Modals: Bottom sheet (full height - 60px top nav)
- Buttons: Full-width or larger touch targets (44px min)
- Font sizes: Minimum 16px (to avoid zoom on focus)

---

## INTERACTION & ANIMATION SPECIFICATIONS

**Button Interactions**:
- Hover: Shadow increase (Elevation-2 → Elevation-3)
- Click: Quick scale animation (98% → 100%, 150ms)
- Disabled: No interactions (cursor: not-allowed)

**Form Focus**:
- Input focus: Blue border (2px), shadow Elevation-1
- Duration: Instant (0ms)
- Color: Primary-500 (#003D82)

**Modal Open/Close**:
- Open: Fade in overlay (0-300ms), scale up modal (90% → 100%)
- Close: Fade out overlay, scale down modal
- Duration: 300ms (smooth but snappy)

**Dropdown Open/Close**:
- Open: Dropdown slides down, chevron rotates 180°
- Duration: 200ms

**Toast Appear/Disappear**:
- Appear: Slide in from right (300ms)
- Stay: 5 seconds
- Disappear: Slide out to right (300ms)

**Loading Animations**:
- Skeleton screens: Pulse effect (opacity 0.5 → 1 → 0.5, 1.5s loop)
- Spinner: Rotating circle (1 rotation per 1s)

**Transitions**:
- Color changes: 200ms transition
- Position changes: 300ms transition
- Shadow changes: 200ms transition

---

## COMPONENT ACCESSIBILITY

**WCAG AA Compliance**:
- Contrast ratio: 4.5:1 for text on background
- Button size: Minimum 44px height (mobile touch target)
- Focus visible: 2px outline
- Skip links: "Skip to main content" at top
- Keyboard navigation: Tab order logical, Enter to submit

**Color**:
- Never use color alone to convey meaning
- Use text labels + color
- Status badges have text labels (not just color)

**Typography**:
- Minimum font size: 12px (body text should be 14px+)
- Line height: Minimum 1.4
- Letter spacing: Not too tight
- Font weights: Sufficient contrast

**Icons**:
- Icon buttons have labels or title attributes
- Icons paired with text where needed
- Icon colors meet contrast requirements

---

## PAGE-BY-PAGE DESIGN SPECIFICATIONS

### PAGE 1: LOGIN

**Layout**: Centered card or split hero + form

**Option A: Centered Card (Recommended)**
```
Light Mode:
┌─────────────────────────────────────┐
│                                     │
│  White background (full screen)     │
│                                     │
│      ┌─────────────────────────┐   │
│      │     FUNSOL LOGO (128px) │   │
│      │                         │   │
│      │   Sign In To CMS        │   │
│      │   "Access your account" │   │
│      │                         │   │
│      │  [Username input]       │   │
│      │  [Password input + 👁]  │   │
│      │  ☑ Remember me          │   │
│      │                         │   │
│      │  [Login Button - Blue]  │   │
│      │                         │   │
│      │  Forgot password?       │   │
│      │                         │   │
│      │ "You're signed in with" │   │
│      │ "john@funsol.com"       │   │
│      │ (Google email check)    │   │
│      │                         │   │
│      └─────────────────────────┘   │
│                                     │
│  © 2024 Funsol. All rights...      │
│                                     │
└─────────────────────────────────────┘

Dark Mode:
- Dark blue-gray background
- Card still white (or slightly darker)
- Text clear contrast
```

**Components Used**:
- Input (username) - text input
- Input (password) - password type with show/hide
- Checkbox (remember me)
- Button (login) - Primary, large, full-width  
- Link (forgot password) - Ghost/text link
- Text (Google email verification status)

**Responsive**:
- Desktop: 500px card width, centered
- Tablet: 90% width with margin
- Mobile: Full screen, card padding reduced

---

### PAGE 2: DASHBOARD

**Layout**: 2-column (sidebar + content)

```
┌──────────────────────────────────────────────────────┐
│ [Top Nav - Funsol CMS Portal]                        │
├─────────┬────────────────────────────────────────────┤
│         │ Dashboard                                  │
│ Sidebar │ ┌────────────────────────────────────────┐│
│         │ │ Welcome, John Doe                      │││
│ [Items] │ │ Role: Manager | Department: Marketing ││
│         │ └────────────────────────────────────────┘│
│         │                                            │
│         │ ┌──────┬──────┐ ┌──────┬──────┐          │
│         │ │Stats │Stats │ │Stats │Stats │          │
│         │ │  42  │  8   │ │  12  │  24  │          │
│         │ │Total │Active│ │  New │ In   │          │
│         │ │Accts │Accts │ │Camps │Prog  │          │
│         │ │      │      │ │Tasks │Tasks │          │
│         │ └──────┴──────┘ └──────┴──────┘          │
│         │                                            │
│         │ Recent Activity                            │
│         │ ┌──────────────────────────────────────┐ │
│         │ │ Item 1: Action | 2 hours ago         │ │
│         │ │ Item 2: Action | Yesterday           │ │
│         │ │ Item 3: Action | 2 days ago          │ │
│         │ │ Item 4: Action | 1 week ago          │ │
│         │ └──────────────────────────────────────┘ │
│         │                                            │
│         │ Quick Navigation                           │
│         │ [Users][Accounts][Campaigns][Drive]       │
│         │ [Reports][Tasks][Settings]                │
│         │                                            │
└─────────┴────────────────────────────────────────────┘
```

**Components**:
- User Profile Card (avatar 48px, name, role, dept)
- Stat Cards (4 cards: blue icon, large number, gray label)
- Activity Feed (timeline, icon + description + timestamp)
- Quick Link Buttons (grid, medium size)

**Cards Styling**:
- White cards with Elevation-2 shadow
- Icon on left or top
- Number: H2 (32px), bold
- Label: Body-Small, gray
- Hover: Shadow lift to Elevation-3

---

### PAGE 3: USERS

**Layout**: Sidebar + main content

**Header**:
- Title: "Users"
- Subtitle: "Manage user accounts and roles"
- Button: `[+ Add User]`

**Filter Bar**:
- Row 1: `[Role ▼]` `[Department ▼]` `[Status ▼]`
- Row 2: Search input (placeholder: "Search by name or email...")
- Button: `[Clear All]` (Secondary, small)

**User Table**:
- Columns: ☐ | Username | Email | Name | Role | Department | Status | Actions
- Rows: 8 users (sample data)
- Status badge: Green (Active), Gray (Inactive)
- Actions per row: Edit (pencil icon), Delete (trash icon)

**Pagination**:
- Bottom: "[← Prev] [1] [2] [3] [Next →]"
- Text: "Showing 1-25 of 127 users"
- Dropdown: "[25 ▼]" (10, 25, 50, 100 options)

**Modal: Add User** (on `[+ Add User]` click):
- Form fields:
  - Username (input)
  - Email (input)
  - First Name (input)
  - Last Name (input)
  - Role (select dropdown)
  - Department (multi-select)
  - Password (input, password type)
  - Confirm Password (input)
- Buttons: `[Cancel]` `[Add User]` (Primary blue)

---

### PAGE 4: ACCOUNTS

**Layout**: Sidebar + main content

**Header**:
- Title: "Accounts"
- Subtitle: "Google Ads account management"  
- Button: `[+ Add Account]`
- View toggle: `[≢ Cards]` `[≣ Table]` (cards selected)

**Filter Bar**:
- Row 1: `[Status ▼]` `[Workflow ▼]` `[Manager ▼]`
- Row 2: Search input
- Button: `[Clear All]`

**Account Cards** (3 columns desktop, 2 tablet, 1 mobile):
- Card size: 320px × 240px
- Layout:
  ```
  ╔════════════════════════════╗
  ║ ID: 1234567890             ║
  ║ Account Name               ║
  ║                            ║
  ║ Status: [Pending Badge]    ║
  ║ Workflow: [Workflow-1]     ║
  ║ Sheet: 🔗 google-sheet-url ║
  ║                            ║
  ║ [Edit] [View] [Delete]     ║
  ╚════════════════════════════╝
  ```
- Badges: Status (orange/green/blue), Workflow (blue)
- Icons: Edit, Delete, View

---

### PAGE 5: CAMPAIGNS

**Layout**: Sidebar + main content

**Header**:
- Title: "Campaigns"
- Subtitle: "Campaign configuration and conditions"
- Button: `[🔄 Sync from Sheet]`

**Account Selector** (top):
- Dropdown: "Select Account: [Account Name ▼]"

**Sync Progress** (when syncing):
- Text: "Syncing: 45 of 100 campaigns..."
- Progress bar: [████████░░] 45%

**Campaign Table**:
- Columns: ☐ | Campaign Name | Conditions | Status | Last Updated | Actions
- Rows: 8 campaigns
- Conditions: Badge showing count (e.g., "[3]")
- Status: Toggle button (on/off)
- Actions: Edit, Delete

**Bulk Actions Toolbar** (appears when checkbox selected):
- Text: "3 campaigns selected"
- Buttons: `[Bulk Enable]` `[Bulk Disable]` `[Delete Selected]`

**Modal: Edit Campaign**:
- Title: Campaign name (read-only)
- Section: Condition Builder
  - `[+ Add Condition]` button
  - List of current conditions (removable pills):
    - `[X Condition 1]` `[X Condition 2]`
  - Dropdown: "Select condition template..."
- Status toggle
- Buttons: `[Cancel]` `[Save]`

---

### PAGE 6: DRIVE MANAGER

**Layout**: Sidebar + main content

**Header**:
- Breadcrumb: "Home > Projects > Marketing > Q1"
- Title: "Drive Manager"

**Top Actions**:
- Create menu: `[+ Create ▼]`
  - Options: New Folder, New Sheet, New Doc, New Slides
- Search: Input with placeholder "Search files..."
- Sync button: `[🔄 Sync]`

**Upload Zone**:
- Dashed border rectangle (500px w × 160px h)
- Icon: Cloud upload (48px, blue)
- Text: "Drag files here or click to upload"
- Subtext: "Supported: PDF, XLS, XLSX, DOC, DOCX, PNG, JPG, GIF (Max 10MB each)"

**File List** (table view):
- Columns: Icon | Name | Type | Size | Owner | Last Modified | Actions
- Rows: 8 files/folders
- Icons: 📁 (folder), 📄 (doc), 📊 (sheet), 📷 (image)
- Actions per row: Download, Share, Delete
- Folders are clickable (navigate into)

**Upload Progress** (if uploading):
- File name | [██████░░░░] 60% | [Cancel]

---

### PAGE 7: LOOKER REPORTS

**Layout**: Sidebar + main content

**Header**:
- Title: "Reports"
- Subtitle: "Analytics and business intelligence"

**Filter Bar**:
- Search: "Search reports..."
- Dropdown: `[Category ▼]`
- Dropdown: `[Date Range ▼]`

**Report Cards** (2-3 columns):
- Card size: 320px × 280px
- Layout:
  ```
  ╔════════════════════════════╗
  ║ Report Title (H3)          ║
  ║                            ║
  ║ Description text in small  ║
  ║ gray font...               ║
  ║                            ║
  ║ [Placeholder chart/graph]  ║
  ║ (colored bars or line)     ║
  ║                            ║
  ║ Updated: 2 days ago        ║
  ║ [View Full Report →]       ║
  ╚════════════════════════════╝
  ```
- Shadow: Elevation-2
- Hover: Shadow Elevation-3

**Responsive**:
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column (full width)

---

### PAGE 8: TASKS ⭐ (MOST DETAILED)

**Layout**: Sidebar + main content

**Header**:
- Title: "Tasks"
- Subtitle: "Create and manage tasks with approval workflows"
- Button: `[+ New Task]`
- More menu: `[⋮]` (Bulk Edit, Export, Help)

**Tab Navigation**:
- `[All Tasks (42)]` `[Assigned to Me (8)]` `[Created by Me (15)]` `[Awaiting Approval (3)]`

**Filter Bar**:
- Row 1: `[Status ▼]` `[Priority ▼]` `[My Tasks]` (toggle) `[Awaiting Approval]` (toggle)
- Row 2: `[Department ▼]` `[Due Date ▼]` `[Assigned To ▼]` `[Clear All]`
- Row 3: Search input

**Task Table**:
- Columns: ☐ | Title | Assigned To | Department | Priority | Status | Due Date | Actions
- Rows: 8 tasks (sample)
- Checkbox for bulk select
- Avatar for assigned user (32px)
- Priority: Badge (High=red, Medium=orange, Low=blue)
- Status: Badge (Open=blue, Pending=orange, Approved=green, Declined=red, Completed=gray)
- Actions per row: Edit, Approve (if manager), Decline (if manager), Download, View, Delete

**Row Example**:
```
☐ | Q1 Marketing Plan | [Avatar] John Doe | Marketing | [HIGH] | [Pending] | Jan 15 | [Edit] [Approve] [Decline]
```

**Pagination**:
- "[← Prev] [1] [2] [3] [Next →]" + "Showing 1-25 of 127"
- Dropdown: "[25 ▼]"

---

### TASK MODAL (DETAILED)

**Size**: 600px × 800px (desktop), bottom sheet (mobile)

**Header**:
- Title: "Task Details" (H2)
- Close button: X (top right)

**Tab Navigation**:
- `[Details]` `[Approval]` `[Attachments]` `[Comments]` `[History]`

**TAB 1: DETAILS**

```
Title *
[Q1 Marketing Plan............................]

Description
[Multi-line textarea........................]
[.......................................]
[.......................................]

Priority *           Status *
[High ▼]            [Open ▼]

Assigned To *        Department *
[John Doe ▼]        [Marketing ▼]

Due Date *                    Workflow
[📅 Jan 15, 2024]            [Workflow-1 ▼]

Tags
[+ Add Tag] [x urgent] [x marketing]

Share With
[+ Add Users]
[x John Smith] [x Sarah Jones]

────────────────────────────────
[Cancel] [💾 Save Task] [🗑️ Delete]
```

**TAB 2: APPROVAL**

```
Approval Chain

    John (Creator)
           ↓
    ✓ Sarah (Manager) - Approved Jan 10, 2:30 PM
           ↓
    ○ Mike (Director) - Pending
           ↓
    ○ Lisa (CFO) - Will review after

Approval History
┌────────────────────────────────────────┐
│ Approver │ Action  │ Date/Time          │
├──────────┼─────────┼────────────────────┤
│ Sarah    │ Approved│ Jan 10, 2:30 PM   │
│ John     │ Created │ Jan 9, 10:00 AM   │
└────────────────────────────────────────┘

[Approve] [Decline] [Request More Info]
```

**TAB 3: ATTACHMENTS**

```
Attached Files

┌──────────────────────────────────────┐
│ 📄 proposal.pdf (2.4 MB)              │
│ Uploaded Jan 9 by John                │
│ [⬇️ Download] [👁️ Preview] [🗑️ Remove]│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📊 data.xlsx (1.1 MB)                 │
│ Uploaded Jan 10 by Sarah              │
│ [⬇️ Download] [👁️ Preview] [🗑️ Remove]│
└──────────────────────────────────────┘

Upload Files

╔══════════════════════════════════════╗
║ Drag files here or click to upload   ║
║ Supported: PDF, XLS, DOCX, PNG, JPG │
║ Max 10MB each                        ║
╚══════════════════════════════════════╝

[+ Add More] [Download All] [Clear All]
```

**TAB 4: COMMENTS**

```
Comments

John (Creator) - Jan 9, 10:00 AM
────────────────────────────────────
Here's the task. Please review.
[Edit] [Delete] [Reply]

Sarah (Manager) - Jan 10, 2:30 PM
────────────────────────────────────
Clarification needed on section 3.
[Edit] [Delete] [Reply]

  ↳ John (Creator) - Jan 10, 3:45 PM
     Added details in attachment.
     [Edit] [Delete]

────────────────────────────────────

Add Comment

[👤 You]
[Type comment here....]
[Attach] [@ Mention] [Format ▼]
[Send] [Cancel]
```

**TAB 5: HISTORY**

```
Activity Log

┌──────────────────────────────────────────┐
│ Time          │ User  │ Action          │
├───────────────┼───────┼─────────────────┤
│Jan 10, 5:00PM │ Sarah │ Approved        │
│Jan 10, 3:45PM │ John  │ Updated         │
│Jan 10, 3:45PM │ John  │ Uploaded        │
│Jan 10, 2:30PM │ Sarah │ Commented       │
│Jan 9, 10:00AM │ John  │ Created         │
└───────────────┴───────┴─────────────────┘

[⬇️ Export Log]
```

---

### MODAL: DECLINE REASON

```
╔═══════════════════════════════════════╗
║ Decline Task                    [X]   ║
╠═══════════════════════════════════════╣
║                                       ║
║ Task: "Q1 Marketing Plan"            ║
║                                       ║
║ Why are you declining?                ║
║ [Incomplete details    ▼]            ║
║  - More information needed            ║
║  - Needs revision                     ║
║  - Not aligned with goals             ║
║  - Other                              ║
║                                       ║
║ Additional Notes                      ║
║ [...................................] ║
║                                       ║
║ [Cancel] [✕ Decline Task]             ║
╚═══════════════════════════════════════╝
```

---

### MODAL: DELETE CONFIRMATION

```
╔═══════════════════════════════════════╗
║ Delete Task?                    [X]   ║
╠═══════════════════════════════════════╣
║                                       ║
║ Are you sure you want to delete this  ║
║ task?                                 ║
║                                       ║
║ "Q1 Marketing Plan"                   ║
║                                       ║
║ ⚠️ This action cannot be undone.      ║
║ ⚠️ Comments and attachments deleted.  ║
║                                       ║
║ [Cancel] [🗑️ Delete Task]             ║
╚═══════════════════════════════════════╝
```

---

### PAGE 9: SETTINGS

**Layout**: Sidebar + main content

**Header**:
- Title: "Settings"
- Subtitle: "Manage your account and preferences"

**Tab Navigation**:
- `[Profile]` `[Password]` `[Notifications]` `[Sessions]` `[Department]`

**TAB 1: PROFILE**

```
Profile Picture

[🖼️  Profile Photo] [+] (Upload button)
Avatar 128px circle with initials

Personal Information

Name
[John Doe........................]

Email
[john@funsol.com................]

Username
john_doe (read-only)

Account Info
Created: January 1, 2024
Last Login: Today at 2:30 PM

────────────────────────────────
[Cancel] [💾 Save Changes]
```

**TAB 2: PASSWORD**

```
Security

Current Password *
[••••••••••••••] 👁️

New Password *
[••••••••••••••] 👁️
Strength: Strong ▪▪▪▪▪

Confirm Password *
[••••••••••••••] 👁️

────────────────────────────────
[Cancel] [Change Password]
```

**TAB 3: NOTIFICATIONS**

```
Desktop Notifications

🔔 Enable Desktop Notifications
[Toggle: ON]
"Get notified of important events"

Notification Types

☑ Task Approvals
☑ Task Assignments
☑ Workflow Status Updates
☑ System Alerts

[🔔 Send Test Notification]

────────────────────────────────
[Save Preferences]
```

**TAB 4: SESSIONS**

```
Active Sessions

Device          Location        Last Active  Action
─────────────────────────────────────────────────────
Chrome, MacOS   New York, NY    2 hours ago  [Logout]
Safari, iPhone  New York, NY    30 min ago   [Logout]
Firefox, Linux  San Francisco   1 week ago   [Logout]

[⚠️ Log out from all other devices]
```

**TAB 5: DEPARTMENT**

```
Your Departments

☑ Marketing (Primary)
☐ Operations

────────────────────────────────
[Save]
```

---

## DESIGN HANDOFF SPECIFICATIONS

**For Developers**:
1. Export all components as Figma library
2. Provide color tokens as CSS variables
3. Document all spacing in 8px units
4. Share typography styles
5. Create component inventory (all UI elements)
6. Provide responsive layout guidelines

**For Designers**:
1. Use this as master design spec
2. Create all 9 pages in Figma
3. Export responsive variants (1440px and 390px)
4. Create design specifications document
5. Document all interactions and animations

---

## SUMMARY

- **29 unique UI components** (buttons, inputs, tables, cards, modals, etc.)
- **9 complete page designs** (1440px + 390px responsive variants)
- **Light + Dark modes**
- **Brand standards** (Funsol identity)
- **Design tokens** (colors, typography, spacing, shadows)
- **Accessibility** (WCAG AA compliance)
- **Interactive specifications** (animations, transitions, states)

**Total components to design**: 50+ (including variants and states)

**Ready for**: Figma design, code implementation, or developer handoff.
