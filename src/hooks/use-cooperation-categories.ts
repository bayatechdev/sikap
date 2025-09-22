import { useQuery } from '@tanstack/react-query';

interface CooperationCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

interface CategoriesResponse {
  categories: CooperationCategory[];
}

async function fetchCooperationCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/cooperation-categories');

  if (!response.ok) {
    throw new Error('Failed to fetch cooperation categories');
  }

  return response.json();
}

export function useCooperationCategories() {
  return useQuery({
    queryKey: ['cooperation-categories'],
    queryFn: fetchCooperationCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}