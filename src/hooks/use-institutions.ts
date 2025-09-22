import { useQuery } from '@tanstack/react-query';

interface Institution {
  id: number;
  name: string;
  type: string;
  code: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
}

interface InstitutionsResponse {
  institutions: Institution[];
}

async function searchInstitutions(query: string, limit = 10): Promise<InstitutionsResponse> {
  const response = await fetch(`/api/institutions/search?q=${encodeURIComponent(query)}&limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to search institutions');
  }

  return response.json();
}

export function useInstitutionsSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: ['institutions', 'search', query, limit],
    queryFn: () => searchInstitutions(query, limit),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}