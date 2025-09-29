// Application-related types and interfaces
export interface Application {
  id: string;
  userId?: string;
  cooperationTypeId: number;
  institutionId?: number;
  cooperationCategoryId?: number;
  trackingNumber: string;
  publicToken: string;
  isPublicSubmission: boolean;
  title: string;
  description: string;
  purpose: string;
  about: string;
  notes?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  institutionName: string;
  status: ApplicationStatus;
  priority: Priority;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  // Relations
  assignedUser?: User;
  cooperationCategory?: CooperationCategory;
  institution?: Institution;
  cooperationType: CooperationType;
  user?: User;
  documents?: Document[];
  statusHistory?: ApplicationStatusHistory[];
}

export interface ApplicationFormData {
  cooperationTypeId: number;
  institutionId?: number;
  cooperationCategoryId?: number;
  title: string;
  description: string;
  purpose: string;
  about: string;
  notes?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  institutionName: string;
  priority?: Priority;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  previousStatus?: string;
  newStatus: string;
  changedBy?: string;
  notes?: string;
  notifyApplicant: boolean;
  changedAt: string;
  changedByUser?: User;
  application: Application;
}

export interface PublicSubmission {
  id: string;
  applicationId: string;
  trackingNumber: string;
  publicToken: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  lastAccessed?: string;
  emailNotificationsEnabled: boolean;
  createdAt: string;
  application: Application;
}

export interface ApplicationData {
  id: string;
  applicationId: string;
  fieldKey: string;
  fieldValue: string;
  fieldType: string;
  createdAt: string;
  updatedAt: string;
  application: Application;
}

export interface ApplicationWorkflow {
  id: string;
  applicationId: string;
  stepName: string;
  status: WorkflowStatus;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  application: Application;
}

// Dashboard interfaces
export interface DashboardStats {
  totalApplications: number;
  applicationsToday: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers: number;
  totalDocuments: number;
  trends: {
    applications: number;
    approved: number;
  };
}

export interface RecentApplication {
  id: string;
  trackingNumber: string;
  title: string;
  status: string;
  submittedAt: string;
  contactPerson: string;
  institutionName: string;
  cooperationType: {
    name: string;
  };
}

// Enums
export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  LEGAL_REVIEW = 'LEGAL_REVIEW',
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Import types from other files
interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  // Add other fields as needed
}

interface CooperationType {
  id: number;
  code: string;
  name: string;
  // Add other fields as needed
}

interface CooperationCategory {
  id: number;
  name: string;
  // Add other fields as needed
}

interface Institution {
  id: number;
  name: string;
  type: string;
  // Add other fields as needed
}

interface Document {
  id: string;
  applicationId: string;
  originalFilename: string;
  // Add other fields as needed
}