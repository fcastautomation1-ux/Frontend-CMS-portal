# Legacy Task Module - Comprehensive Feature Inventory

## 1. UI PANELS & VIEWS

### Primary Task Views
- **List View** - Table/grid display of all tasks
- **Kanban View** - Drag-drop board with columns (Backlog, To Do, In Progress, Done)
- **Calendar View** - Timeline view of task due dates
- **Queue View** - Department queue management interface
- **Approval/Review Panel** - Tasks pending creator approval
- **Dashboard** - Overview with task statistics and quick access

### Sub-Views & Modals
- **Task Detail Modal** - Full task information display and editing
- **Quick Action Panel** - Inline actions without leaving list
- **Notification Center** - Real-time task alerts and updates
- **History/Activity Log** - Complete task event timeline
- **Assignment Chain View** - Visual representation of multi-step approvals
- **Multi-Assignment Interface** - Manage multiple concurrent assignees

---

## 2. TASK CREATION & EDITING FIELDS

### Basic Information
- Title (required)
- Description (rich text HTML support)
- Our Goal (HTML-enabled goal statement)
- Task Status (backlog, todo, in_progress, done)
- Priority (urgent, high, medium, low)

### Classification
- Department/Category (dropdown, searchable)
- KPI Type (required, dropdown)
- Package Name (associated app/product, searchable)
- App Name (auto-synced from package)
- Tags (custom user-defined tags)

### Assignment & Workflow
- Assigned To (single user or queue)
- Direct Manager ID (auto-populated from user profile)
- Routing Mode (self, manager, department, multi-assign)
- Approval Status (approved, pending_approval, declined)

### Dates & Timeline
- Expected Due Date (creator-set, visible to all)
- Actual Due Date (assignee personal deadline)
- Created At (auto-timestamp)
- Completed At (completion timestamp)
- Updated At (last modified timestamp)

### Advanced Fields
- Notes (additional context)
- Position (drag-drop ordering)
- Archived (soft-delete flag)
- Completed Flag (boolean)

---

## 3. FILTERING OPTIONS

### Quick Filters (Pre-built)
- My Created Tasks
- Assigned to Me
- Completed by Me
- Department Queue Tasks
- Managed Tasks (as manager)
- Team Tasks (creator's team)
- Chain Member Tasks (approval chain)
- Multi-Assigned Tasks
- Shared with Me
- Archived Tasks

### Smart Lists (Saved Filters)
- Overdue Tasks (past due date)
- Due Today
- Due This Week
- High Priority
- Pending Approval
- In Progress

### Advanced Filters
- By Priority (dropdown)
- By Department/Category (searchable)
- By KPI Type (dropdown)
- By Status (multi-select: backlog, todo, in_progress, done)
- By Assigned User (searchable)
- By Task Creator (searchable)
- By Approval Status (pending, approved, declined)
- By Completion Status (completed/pending)
- By Package/App Name (searchable)
- Date Range Filter (custom start/end dates)
- Team Member Filter (show team member tasks)

### Filter Persistence
- Save custom filter combinations
- Quick access to saved filters
- One-click filter reset

---

## 4. ROUTING MODES

### Self-Assigned (Creator Completes Own Task)
- Task created for self
- Creator is assignee
- Direct completion without multi-step approval
- Skip manager notification
- Auto-completion workflow

### Manager Routing
- Task routed to user's direct manager
- Manager's manager_id field lookup
- Manager receives approval responsibility
- Auto-populate manager_id on task

### Department Routing
- Queue task to entire department
- System auto-assigns to available member or queues
- Package-name matching for auto-assignment priority
- Department members can claim from queue
- Manager can manually assign from queue

### Multi-Assign Mode
- Enable multiple concurrent assignees
- Each assignee has own status (accepted/completed/pending)
- Top-level assignees can delegate to sub-assignees
- Delegation chain tracking (delegated_to array)
- Individual personal due dates for multi-assignees
- All must complete before task final approval

---

## 5. TASK ACTIONS

### Lifecycle Actions
- **Create Task** - New task initialization
- **Edit Task** - Update title, description, dates, classification
- **Start Work** - Move to in_progress (triggers acknowledgment if from backlog)
- **Acknowledge** - Accept task assignment (backlog → todo)
- **Submit for Completion** - Non-creator marks complete, awaits approval
- **Complete Task** - Creator or final approver marks done
- **Approve Completion** - Creator accepts work (only creator can do this)
- **Decline Completion** - Creator rejects with reason, returns to assignee
- **Reopen Task** - Creator can reopen completed tasks

### Assignment Actions
- **Assign to User** - Direct assignment by creator
- **Reassign** - Change current assignee
- **Share with User** - Share read-only or editable copy
- **Queue to Department** - Add to department work queue
- **Claim from Queue** - Department member self-assigns
- **Manually Assign from Queue** - Manager assigns queued task

### Workflow Actions
- **Pass to Next User** - Assignment chain progression
- **Request Feedback** - Ask question without completing
- **Delegate** - Multi-assign: assign to sub-assignee
- **Request Review** - Ask another party to review before completion

### Approval Chain Actions
- **Submit in Chain** - Pass to next approval level with notes
- **Complete & Assign** - Submit work + assign to next person
- **Complete & Final** - Submit work, final approval by creator
- **Add Assignment Chain Member** - Add to approval workflow

### Personal Actions
- **Update Personal Due Date** - Assignee can modify their deadline once
- **Add Comment** - Inline messaging on task
- **Mark Messages as Read** - Clear unread notification count
- **Add Attachment** - Upload supporting files

### Administrative Actions
- **Duplicate Task** - Create copy of existing task
- **Archive Task** - Hide completed task
- **Delete Task** - Remove pending task (not completed)
- **Set Task Position** - Manual ordering in list

---

## 6. WORKFLOW STATUSES & TRANSITIONS

### Task Status States
- **Backlog** → Todo (acknowledge)
- **Todo/Backlog** → In Progress (start work)
- **In Progress** → Pending Approval (submit for approval)
- **Pending Approval** → Done (creator approves)
- **Pending Approval** → In Progress (creator declines, returns to worker)
- **Done** → In Progress (creator reopens)

### Approval Status States
- **Approved** - Task passed all approval gates
- **Pending Approval** - Awaiting creator or chain reviewer
- **Declined** - Creator rejected completion with reason
- **Decline Reason** - Store reason text for rejection

### Queue Status States
- **Queued** - Waiting in department queue
- **Assigned** - Auto-assigned from queue
- **In Progress** - Team member working on queued task

### Multi-Assignment Status
- **Pending** - Assignee not yet responded
- **Accepted** - Assignee acknowledged task
- **Completed** - Assignee finished their portion
- **Rejected** - Assignee declined/rejected
- **Delegated** - Assignee delegated to sub-assignee

---

## 7. ASSIGNMENT CHAINS & MULTI-ASSIGNMENT FLOWS

### Single Assignment Chain
- Linear flow: Creator → Assignee → [Optional Manager Review] → Back to Creator
- Tracked in `assignment_chain` JSON array
- Each entry contains: user, action, feedback, timestamp, status

### Multi-Assignment Workflow
- **Setup**: Enable multi_assignment flag, add assignees array
- **Top-level Assignees**: Primary recipients of task
- **Sub-assignees (Delegated)**: Work delegated from top-level assignee
- **Status Tracking**: Each assignee/sub-assignee has status
- **Personal Due Dates**: Each multi-assignee can set own deadline once
- **Completion Flow**: All must complete before final approval
- **Delegation Depth**: Support for multi-level delegation chains

### Assignment Chain Data Structure
```
assignment_chain: [
  {
    user: "username",
    assigned_by: "creator",
    assigned_at: "timestamp",
    action: "reassigned|passed",
    feedback: "notes",
    review_status: "pending|approved|declined",
    reviewed_at: "timestamp"
  }
]
```

### Multi-Assignment Data Structure
```
multi_assignment: {
  enabled: true,
  assignees: [
    {
      username: "user1",
      status: "accepted|completed|pending|rejected",
      accepted_at: "timestamp",
      completed_at: "timestamp",
      actual_due_date: "timestamp",
      delegated_to: [
        {
          username: "delegate1",
          status: "completed",
          completed_at: "timestamp"
        }
      ]
    }
  ]
}
```

---

## 8. APPROVAL WORKFLOWS

### Simple Approval (Creator Approval)
- Non-creator completes task
- Task marked Pending Approval
- Creator receives notification
- Creator can Approve or Decline with reason
- Only creator can approve

### Manager Approval (If Applicable)
- Task auto-assigned to creator's manager
- Manager_id stored on task
- Manager receives completion notification
- Manager context in approval flow (optional)

### Chain-Based Approval
- Multiple reviewers in sequence
- Each reviewer: approve/decline
- Feedback collected at each step
- Failed approval returns to originating worker
- Success moves to next in chain

### Final Approval
- Last approver marks task complete
- Task moves to Done status
- All chain members notified
- Completion timestamp recorded

---

## 9. QUEUE MANAGEMENT

### Queue Setup
- **Queue Department**: Department field on task
- **Queue Status**: "queued" or "assigned"
- **Queued Tasks**: Unassigned or waiting assignment

### Queue Assignment Logic
1. If task has package_name:
   - Try assign to user with package assigned
   - If multiple users have package: assign to least-loaded
   - If no users have package: add to queue
2. If task has no package (Others):
   - Add to queue (no auto-assignment)
   - Manual assignment required

### Queue Operations
- **View Queue**: List tasks in department queue
- **Claim from Queue**: Department member self-assigns
- **Manual Assign**: Manager assigns queued task to member
- **Auto-Process**: After completion, auto-assign next queued task
- **Queue Priority**: FIFO (First In First Out)

### Next Task Auto-Assignment
- When assignee completes task: query queue for next task
- Match on: package_name, department
- Only auto-assign to users with packages assigned
- System processes queue automatically

---

## 10. TASK TEMPLATES & QUICK ACTIONS

### Template Features
- **Save as Template**: Create reusable task template
- **Template Fields**: Title, description, priority, category, due date pattern
- **Quick Create**: One-click task from template
- **Bulk Operations**: Create multiple tasks from template

### Quick Actions
- **Duplicate**: Copy existing task as new
- **Create Similar**: Based on task type/category
- **Batch Create**: From import list or bulk entry
- **Schedule Series**: Regular recurring tasks
- **Task Archival**: Hide completed tasks

### Preset Configurations
- **Default Priorities**: Quick-set priority templates
- **Reusable Descriptions**: Quick insert common descriptions
- **Auto-Assignment**: Smart routing presets
- **Approval Templates**: Pre-configured approval chains

---

## 11. COMMENTS, HISTORY & ATTACHMENTS

### Comments System
- **Add Comment**: Inline task messaging
- **Message Threads**: Reply to specific comments
- **Real-time Updates**: Live comment notifications
- **Unread Tracking**: Mark as read/unread
- **Comment History**: Full chronological log
- **@Mentions**: Notify specific users with @ symbol

### Task History
- **Activity Log**: All task events tracked
- **Event Types**:
  - Task created
  - Edited (what changed)
  - Status changed
  - Assigned to
  - Reassigned from/to
  - Completed by
  - Approval submitted
  - Approval decision (approved/declined)
  - Comment added
  - Due date changed
  - Attachment added/removed
  - Shared with user
  - Unshared from user
  - Queue events (added/auto-assigned/claimed)
  - Delegation events

### Event Details Captured
- User who took action
- Timestamp of action
- Type of action
- Change details (before/after where applicable)
- Icons/emojis for visual scanning
- Titles for quick understanding

### Attachment Management
- **Upload Files**: Add supporting documents/images
- **File Storage**: Google Drive integration
- **File Info**: Name, size, type, upload date
- **Download**: Direct access links
- **Delete**: Remove attachments (uploader only)
- **Notification**: Notify all task members of attachments
- **File History**: Track what files were added/removed
- **Drive Integration**: Files linked to Drive with sharing control

---

## 12. SHARING & PERMISSIONS

### Share Access Levels
- **View Only**: Read task details, can't modify
- **Can Edit**: Modify task, add comments, update status
- **Can Assign**: Handle task assignments
- **Owner/Creator**: Full control (creator only)

### Share Recipients
- **Individual Users**: Share with specific person
- **Shared by Task Creator**: Only creator initiates share
- **View in Personal List**: Shared tasks appear in my tasks
- **Notification**: Recipient gets notification

### Shared Task Visibility
- Task visible in recipient's task list
- Marked as "shared with me"
- Original creator maintains ownership
- Original assignee unchanged

### Permission Model
- **Creator**: Always can edit, approve, delete
- **Assignee**: Can edit progress, add comments, update due date (once)
- **Shared User (View)**: Can read, add comments, can't edit core fields
- **Shared User (Edit)**: Can modify content, update status
- **Managers**: Can view team member tasks, approve
- **Admins**: Full visibility and control

### Access Control Rules
- Creator/assignee can share
- Manager can see managed team tasks
- Admin can see all tasks
- Deny by default (explicit sharing required)

---

## 13. EXPORT/IMPORT OPTIONS

### Export Formats
- **CSV Export**: Task list with key fields
- **JSON Export**: Complete task data with full details
- **Excel-compatible**: CSV with formatting
- **PDF Report**: Formatted task summary (optional)

### Export Contents
- Title, Description, Our Goal
- Priority, Department, Status
- Due Date, Created Date, Completed Date
- Task Status, Approval Status
- Assigned To, Created By
- KPI Type, Package Name
- Custom formatting per format type

### Import Options
- **Bulk Import**: CSV of task definitions
- **Package Name Sync**: Auto-add packages from import
- **Mapping Configuration**: Field mapping for custom formats
- **Validation**: Check for required fields before import
- **Duplicate Detection**: Prevent duplicate imports

### Data Exchange
- **API Export**: JSON endpoint for integrations
- **Scheduled Exports**: Auto-generate reports
- **Email Export**: Send task list via email
- **Cloud Sync**: Backup to Google Drive

---

## 14. UNIQUE/ADVANCED FEATURES

### Task Analytics & Insights
- **Task Statistics**: Total, completed, pending, overdue, high-priority
- **Completion Rate**: % of assigned tasks completed
- **User Performance**: Completion stats per user
- **Team Metrics**: Department-level task metrics
- **Trend Analysis**: Tasks over time
- **Analytics Dashboard**: Visual representation

### Department Queue Intelligence
- **Auto Queue Processing**: Auto-assign when user available
- **Package Matching**: Match tasks to specialist users
- **Load Balancing**: Distribute tasks evenly
- **Queue Priority**: FIFO with package preference
- **Queue Health**: Monitor queue depth and age

### Historical Backfill/Migration
- **Multi-Assignment Chain Backfill**: Sync legacy chain status
- **Assignee Ownership Correction**: Fix legacy assignment issues
- **Data Migration**: Sync package names for existing tasks
- **One-time Corrections**: Admin-triggered historical fixes

### Real-time Collaboration Features
- **Live Sync**: Real-time task list updates
- **Presence Overlay**: See who's viewing task
- **Live Comments**: Real-time comment notifications
- **Conflict Resolution**: Handle concurrent edits

### Smart Notifications
- **Task Assignment**: Notify assignee
- **Creator Approval**: Notify creator for approval
- **Manager Update**: Notify manager of status
- **Team Updates**: Notify team of progress
- **Due Date Reminders**: Notify before due date
- **Overdue Alerts**: Escalating overdue warnings
- **Comment Mentions**: Notify @mentioned users
- **Unread Message Badge**: Counter on task

### Performance Optimization
- **Column Caching**: Prevent avatar data downloads (bandwidth)
- **Lazy Loading**: Load task details on demand
- **Parallel Queries**: Load multiple data sources simultaneously
- **Indexed Searches**: Fast filter/search across tasks
- **Pagination**: Handle large task lists

### User Interface Enhancements
- **Kanban Drag-Drop**: Visual task movement
- **Inline Editing**: Quick field updates without modal
- **Bulk Actions**: Multi-select and action on many tasks
- **Keyboard Shortcuts**: Power user commands
- **Mobile Responsive**: Works on all screen sizes
- **Dark Mode Support**: Eye-friendly dark theme (optional)
- **Accessibility**: Screen reader support, keyboard navigation

### Team Management
- **Team Member Lists**: View direct reports
- **Delegation Tracking**: Who delegated to whom
- **Manager Visibility**: See all team tasks
- **Subcontracting**: Pass work through chain
- **Performance Visibility**: Manager sees team metrics

### Date Handling
- **Expected Due Date**: Creator-set, visible to all
- **Actual Due Date**: Assignee personal deadline
- **Personal Override**: Multi-assignee can set once
- **Portal Timezone**: Consistent date handling
- **Due Date Notifications**: Before/at/after due date
- **Recurring Dates**: Pattern-based date generation

### Integration Points
- **Google Drive**: File attachments and storage
- **Notifications API**: Background notification service
- **User Management**: Sync with user profiles
- **Department/Package Database**: Managed metadata
- **History Versioning**: Full audit trail

### Data Integrity
- **Soft Delete**: Archive instead of delete
- **Completion Immutability**: Can't delete completed tasks
- **Change Tracking**: Every modification logged
- **Ownership Preservation**: Task creator locked
- **Approval Chain Integrity**: Can't skip approval steps
- **Permission Enforcement**: Access control validated server-side

### Advanced Workflow Controls
- **Conditional Routing**: Route based on task type
- **Approval Chains**: Multi-step approval workflows
- **Delegation Depth**: Support multi-level sub-assignments
- **Skip Logic**: Optional gatekeepers based on conditions
- **Escalation**: Route to manager if task stalled
- **Rollback**: Decline/return to previous worker
- **Parallel Paths**: Independent approval tracks (future)

---

## 15. TECHNICAL ARCHITECTURE FEATURES

### Database Columns (Schema)
- Standard: id, username, title, description, completed, created_at, updated_at
- Workflow: task_status, priority, category, due_date, position, archived
- Assignment: assigned_to, manager_id, approval_status, completed_by, completed_at
- Approval: approved_at, approved_by, declined_at, declined_by, decline_reason
- Advanced: assignment_chain (JSON), history (JSON), multi_assignment (JSON)
- Queue: queue_department, queue_status, expected_due_date, actual_due_date
- Classification: kpi_type, app_name, package_name, our_goal
- Shared: via todo_shares table (separate relation)
- Attachments: via todo_attachments table (separate relation)

### Relationships
- todos ↔ users (assigned_to, created by)
- todos ↔ todo_shares (one-to-many shared copies)
- todos ↔ todo_attachments (one-to-many files)
- todos ↔ notifications (task events trigger notifications)
- users ↔ user_packages (package assignments)
- packages ↔ todos (via package_name field)

### Security & Access Control
- Role-based access (Admin, Super Manager, Manager, User)
- Task-level permissions (creator, assignee, manager, team)
- Share-based visibility (explicit sharing required)
- History isolation (only relevant parties see events)
- Multi-team filtering (see own and team only)
- Admin override capability

### Performance Optimizations
- Lazy load task details on demand
- Cache user/department lookups
- Parallel API query execution
- Indexed searches by created_at, assigned_to, username
- Pagination for large task lists
- Minimal data in list views (no avatar blobs)

---

## SUMMARY STATISTICS

- **UI Views**: 7+ primary + multiple modals
- **Task Fields**: 25+ data fields
- **Filter Types**: 10+ quick + unlimited advanced
- **Task Actions**: 20+ primary + 10+ chain/queue actions
- **Status States**: 8+ workflow states + 4+ queue states
- **Assignment Modes**: 4 routing types + delegation support
- **Workflow Events**: 15+ tracked event types
- **Permission Levels**: 5+ role-based + task-level granular
- **Export Formats**: CSV, JSON, Email
- **Integration Points**: Google Drive, Notifications, User Management

---

## KEY FEATURES SUMMARY

### Workflow Excellence
✅ Multi-level approval chains with feedback
✅ Manager auto-routing with team support
✅ Department queue with intelligent auto-assignment
✅ Multi-assignee concurrent workflows
✅ Delegation chains with sub-assignments
✅ Rejection/rollback capability

### Collaboration
✅ Real-time comments and @mentions
✅ Full activity history with detailed events
✅ File attachments with Drive integration
✅ Task sharing with granular permissions
✅ Team visibility and manager oversight

### User Experience
✅ Kanban drag-drop interface
✅ Multiple view options (list, calendar, queue)
✅ Smart quick filters + custom filtering
✅ Personal due date management
✅ Mobile responsive design
✅ Real-time notifications

### Data & Reporting
✅ Complete audit trail
✅ Task analytics and metrics
✅ Export in multiple formats
✅ Historical data backfill/migration
✅ Performance tracking per user

