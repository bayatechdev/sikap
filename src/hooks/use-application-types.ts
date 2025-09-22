import { useQuery } from '@tanstack/react-query';

interface RequiredDocument {
  key: string;
  name: string;
  required: boolean;
}

interface WorkflowStep {
  step: string;
  name: string;
  assignable_roles: string[];
}

interface ApplicationType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  requiredDocuments: RequiredDocument[];
  workflowSteps: WorkflowStep[];
}

interface ApplicationTypesResponse {
  applicationTypes: ApplicationType[];
}

async function fetchApplicationTypes(): Promise<ApplicationTypesResponse> {
  const response = await fetch('/api/application-types');

  if (!response.ok) {
    throw new Error('Failed to fetch application types');
  }

  return response.json();
}

export function useApplicationTypes() {
  return useQuery({
    queryKey: ['application-types'],
    queryFn: fetchApplicationTypes,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}