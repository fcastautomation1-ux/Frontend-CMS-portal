// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export type UserRole = "Admin" | "Super Manager" | "Manager" | "Supervisor" | "User";

export interface ModuleAccess {
  googleAccount?: {
    enabled: boolean;
    accessLevel?: "all" | "specific";
    accounts?: string[];
  };
  campaigns?: {
    enabled: boolean;
    accessLevel?: "all" | "specific";
  };
  users?: {
    enabled: boolean;
    departmentRestricted?: boolean;
  };
  drive?: {
    enabled: boolean;
  };
  reports?: {
    enabled: boolean;
  };
  todos?: {
    enabled: boolean;
  };
}

export interface User {
  username: string;
  role: UserRole;
  email?: string;
  department?: string;
  password?: string;
  allowedAccounts?: string;
  allowedDriveFolders?: string;
  allowedCampaigns?: string;
  allowedLookerReports?: string;
  driveAccessLevel?: "viewer" | "editor";
  managerId?: string;
  teamMembers?: string;
  moduleAccess?: string | ModuleAccess;
  lastLogin?: string;
  avatarData?: string | null;
}

export interface SessionUser {
  username: string;
  role: UserRole;
  email?: string;
  department?: string;
  allowedAccounts: string[];
  allowedDriveFolders: string[];
  allowedCampaigns: string[];
  allowedLookerReports: string[];
  driveAccessLevel: string;
  avatarData?: string | null;
  moduleAccess?: ModuleAccess | null;
  managerId?: string;
  teamMembers?: string;
}

// ============================================================================
// ACCOUNT TYPES
// ============================================================================

export interface Account {
  customerId: string;
  googleSheetLink: string;
  driveCodeComments?: string;
  enabled: boolean;
  lastRun?: string;
  status: string;
  createdDate?: string;
  workflow: string;
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export interface Campaign {
  customerId: string;
  campaignName: string;
  removalConditions: string;
  enabled: boolean;
  workflow?: string;
}

// ============================================================================
// DRIVE TYPES
// ============================================================================

export interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  mimeType: string;
  size: number | null;
  modifiedDate: string;
  createdDate: string;
  url: string;
  icon: string;
}

export interface DriveFolderResponse {
  success: boolean;
  items: DriveItem[];
  currentFolder: { id: string; name: string };
  breadcrumbs: { id: string; name: string }[];
  totalItems: number;
  message?: string;
}

// ============================================================================
// TODO/TASK TYPES
// ============================================================================

export type TodoStatus = "open" | "in-progress" | "pending" | "approved" | "declined" | "completed";
export type TodoPriority = "high" | "medium" | "low";

export interface Todo {
  id: string;
  username: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  assigned_to?: string;
  assigned_by?: string;
  approval_chain?: string;
  approval_status?: string;
  category?: string;
  tags?: string;
  attachments?: string;
  app_name?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface TodoShare {
  id: string;
  todo_id: string;
  shared_by: string;
  shared_with: string;
  can_edit: boolean;
  created_at: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface LookerReport {
  id: string;
  name: string;
  url: string;
  description?: string;
  allowed_users?: string;
  created_at?: string;
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  last_run?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  from_user: string;
  to_user: string;
  todo_id?: string;
  read: boolean;
  created_at: string;
}

// ============================================================================
// PACKAGE TYPES
// ============================================================================

export interface Package {
  id: string;
  name: string;
  description?: string;
  features?: string;
  created_at?: string;
}

// ============================================================================
// CREDENTIALS TYPES
// ============================================================================

export interface Credentials {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  youtubeRefreshToken?: string;
}
