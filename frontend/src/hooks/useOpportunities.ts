import { useQuery } from '@tanstack/react-query';

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  full_description?: string;
  budget?: string;
  deadline?: string;
  type?: string;
  source?: string;
  status?: 'open' | 'closed' | 'upcoming';
  sector?: string;
  eligibility?: string;
  application_process?: string;
  contact_info?: string;
  source_url?: string;
  total_budget?: string;
  applicants_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Source {
  id: string;
  name: string;
  description?: string;
  type?: string;
  website?: string;
  focus?: string[];
  created_at?: string;
}

export const useOpportunities = (filters: {
  type?: string[];
  sector?: string[];
  search?: string;
} = {}) => {
  const queryParams: Record<string, string> = {};
  if (filters.type && filters.type.length > 0) {
    queryParams.type = filters.type.join(',');
  }
  if (filters.sector && filters.sector.length > 0) {
    queryParams.sector = filters.sector.join(',');
  }
  if (filters.search) {
    queryParams.search = filters.search;
  }

  return useQuery({
    queryKey: ['opportunities', queryParams],
    queryFn: async () => {
      const params = new URLSearchParams(queryParams);
      const response = await fetch(`/api/opportunities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json() as Promise<Opportunity[]>;
    }
  });
};

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const response = await fetch(`/api/opportunities/${id}`);
      if (!response.ok) throw new Error('Failed to fetch opportunity');
      return response.json() as Promise<Opportunity>;
    },
    enabled: !!id
  });
};

export const useSources = () => {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const response = await fetch('/api/sources');
      if (!response.ok) throw new Error('Failed to fetch sources');
      return response.json() as Promise<Source[]>;
    }
  });
};

export const useFeaturedOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities', 'featured'],
    queryFn: async () => {
      const response = await fetch('/api/opportunities/featured');
      if (!response.ok) throw new Error('Failed to fetch featured opportunities');
      return response.json() as Promise<Opportunity[]>;
    }
  });
};