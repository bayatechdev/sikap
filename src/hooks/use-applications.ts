import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ApplicationFormData {
  applicationTypeCode: string;
  cooperationCategoryId?: number;
  institutionId?: number;
  institutionName: string;
  title: string;
  description: string;
  purpose: string;
  about: string;
  notes?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

interface ApplicationSubmissionResponse {
  success: boolean;
  trackingNumber: string;
  publicToken: string;
  applicationId: string;
  message: string;
}

interface Application {
  id: string;
  trackingNumber: string;
  title: string;
  status: string;
  institutionName: string;
  contactEmail: string;
  submittedAt: string;
  applicationType: {
    code: string;
    name: string;
  };
  institution?: {
    name: string;
    type: string;
  };
  cooperationCategory?: {
    name: string;
  };
}

interface ApplicationsResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ApplicationsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}

async function createApplication(data: ApplicationFormData): Promise<ApplicationSubmissionResponse> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit application');
  }

  return response.json();
}

async function fetchApplications(params: ApplicationsQueryParams = {}): Promise<ApplicationsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status) searchParams.set('status', params.status);
  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);

  const response = await fetch(`/api/applications?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }

  return response.json();
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      // Invalidate applications list to refresh data
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useApplications(params: ApplicationsQueryParams = {}) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => fetchApplications(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}