import { useQuery } from '@tanstack/react-query';
import { translateToMacedonian } from '@/lib/translate';

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
  opportunities?: number;
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
      // Import supabase here to avoid circular dependency
      const { supabase } = await import('@/lib/supabase');
      const { data: sources, error } = await supabase
        .from('grant_sources')
        .select('*');

      if (error) throw error;

      // For each source, get the count of grants
      const sourcesWithCounts = await Promise.all(
        sources.map(async (source) => {
          const { count } = await supabase
            .from('grants')
            .select('*', { count: 'exact', head: true })
            .eq('source_id', source.id);

          return {
            id: source.id,
            name: source.name || source.url, // Use name if available, else URL
            description: source.description || 'Извор на финансирање',
            type: 'Онлајн платформа', // Default type
            website: source.url,
            focus: ['финансирање'], // Default focus
            opportunities: count || 0,
            created_at: source.created_at
          };
        })
      );

      // Filter out sources with 0 opportunities
      const filteredSources = sourcesWithCounts.filter(source => source.opportunities > 0);

      return filteredSources as Source[];
    }
  });
};

export const useFeaturedOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities', 'featured'],
    queryFn: async () => {
      // Import supabase here to avoid circular dependency
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('type', 'grants')
        .not('deadline', 'is', null)
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(4);

      if (error) throw error;

      // Transform to Opportunity format and translate to Macedonian
      const translatedOpportunities = await Promise.all(
        data.map(async (grant) => {
          const title = grant.type === 'tenders' ? grant.description : grant.title;
          const description = grant.type === 'tenders' ? grant.title : grant.description;

          return {
            id: grant.id,
            title: await translateToMacedonian(title || '', 'en'),
            description: await translateToMacedonian(description || '', 'en'),
            budget: grant.amount ? `€${grant.amount}` : undefined,
            deadline: grant.deadline,
            type: grant.type,
            source: grant.type === 'grants' ? 'ЕУ Фондови' : grant.type === 'tenders' ? 'Тендери' : grant.type === 'loans' ? 'Кредити' : 'Инвеститори',
            status: grant.deadline && new Date(grant.deadline) > new Date() ? 'open' : 'closed',
            sector: grant.tags?.[0] || 'Развој',
            eligibility: 'Проверете детали',
            source_url: grant.url,
            created_at: grant.created_at,
            updated_at: grant.updated_at
          };
        })
      );

      return translatedOpportunities as Opportunity[];
    }
  });
};