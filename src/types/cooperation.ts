// Cooperation-related types and interfaces
export interface CooperationType {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayTitle?: string;
  longDescription?: string;
  features?: string[];
  examples?: string[];
  downloadInfo?: DownloadInfo;
  color?: string;
  icon?: string;
  displayOrder: number;
  showOnHomepage: boolean;
  requiredDocumentsJson: Record<string, unknown>; // JSON field from Prisma
  workflowStepsJson: Record<string, unknown>; // JSON field from Prisma
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cooperation {
  id: string;
  applicationId?: string;
  title: string;
  cooperationType: string;
  cooperationTypeColor: string;
  orgUnit: string;
  partnerInstitution: string;
  cooperationDate: string;
  startDate?: string;
  endDate?: string;
  location: string;
  description?: string;
  objectives?: string;
  scope?: string;
  documentPath?: string;
  documentNumber?: string;
  documentSize?: number;
  documentMimeType?: string;
  status: CooperationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}

export interface CooperationCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Cooperation form data interfaces
export interface CooperationFormData {
  title: string;
  cooperationType: string;
  orgUnit: string;
  partnerInstitution: string;
  cooperationDate: string;
  startDate?: string;
  endDate?: string;
  location: string;
  description?: string;
  objectives?: string;
  scope?: string;
  notes?: string;
}

// Legacy types (keeping for backward compatibility)
export interface DownloadInfo {
  fileName: string;
  fileSize: string;
  fileType: string;
  docType: string;
  color: string;
  icon: string;
}

export interface KerjasamaType {
  title: string;
  description: string;
  features: string[];
  examples: string[];
  downloadInfo: DownloadInfo;
}

export interface KerjasamaData {
  mou: KerjasamaType;
  pks: KerjasamaType;
  surat_kuasa: KerjasamaType;
  nota_kesepakatan: KerjasamaType;
}

// Enums
export enum CooperationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  DRAFT = 'DRAFT'
}

// Import Application interface (will be defined in application.ts)
interface Application {
  id: string;
  title: string;
  status: string;
  // Add other fields as needed
}