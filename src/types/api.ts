// API-related types and interfaces for consistent response handling

// Generic API Response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>; // For validation errors
}

// Paginated response structure
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message?: string;
  error?: string;
}

// File upload response
export interface FileUploadResponse {
  success: boolean;
  data?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
    url?: string;
  };
  message?: string;
  error?: string;
}

// Authentication response
export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      status: string;
    };
    token?: string;
    redirectUrl?: string;
  };
  message?: string;
  error?: string;
}

// Search response
export interface SearchResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  query: string;
  filters?: Record<string, unknown>;
  message?: string;
  error?: string;
}

// Bulk operation response
export interface BulkOperationResponse {
  success: boolean;
  data: {
    totalProcessed: number;
    successful: number;
    failed: number;
    errors?: string[];
  };
  message?: string;
}

// Statistics response
export interface StatsResponse {
  success: boolean;
  data: Record<string, number | string>;
  period?: {
    start: string;
    end: string;
  };
  message?: string;
  error?: string;
}

// Settings response
export interface SettingsResponse {
  success: boolean;
  settings: Record<string, string>;
  message?: string;
  error?: string;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
  details?: unknown;
}

// Request parameters for common operations
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  q?: string;
  filters?: Record<string, unknown>;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

// Request options
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
}

// Common API endpoints structure
export interface ApiEndpoints {
  auth: {
    login: string;
    logout: string;
    refresh: string;
    profile: string;
  };
  applications: {
    list: string;
    create: string;
    get: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
    track: (trackingNumber: string) => string;
  };
  cooperations: {
    list: string;
    create: string;
    get: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  documents: {
    upload: string;
    download: (id: string) => string;
    delete: (id: string) => string;
  };
  settings: {
    get: string;
    update: string;
    bulk: string;
  };
}

// Validation error structure
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Query parameters for different endpoints
export interface ApplicationQueryParams extends PaginationParams {
  status?: string;
  cooperationType?: string;
  institutionId?: number;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CooperationQueryParams extends PaginationParams {
  type?: string;
  status?: string;
  orgUnit?: string;
  partnerInstitution?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DocumentQueryParams extends PaginationParams {
  applicationId?: string;
  documentType?: string;
  uploadedBy?: string;
}