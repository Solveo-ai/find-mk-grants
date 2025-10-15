import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { translateToMacedonian } from '@/lib/translate';

export interface EuroAccessGrant {
  id: number;
  source_id: string;
  source_url: string;
  title: string;
  title_mk: string;
  description: string;
  description_mk: string;
  deadline: string | null;
  days_left: number | null;
  url: string;
  type: string;
  tags: string[] | null;
  funding_program: string;
  call_number: string;
  eligible_entities: string;
  regions_countries_for_funding: string;
  topics: string;
  contact: string;
  status: string;
  created_at: string;
  updated_at: string;
  amount?: number;
  currency?: string;
  funding_rate?: string;
  estimated_eu_contribution_per_project?: string;
  project_duration?: string;
  relevance_for_eu_macro_region?: string;
  other_eligibility_criteria?: string;
  call_documents?: string;
  call_objectives?: string;
  mandatory_partnership?: string;
  project_partnership?: string;
  un_sdgs?: string;
  additional_information?: string;
}

export const useEuroAccessGrants = (initialLimit: number = 8) => {
  const [grants, setGrants] = useState<EuroAccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);

  const fetchGrants = async (limit: number = currentLimit) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('active_euro_access_grants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to check if there are more

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Check if there are more grants available
        setHasMore(data.length > limit);

        // Only show the requested number
        const grantsToShow = data.slice(0, limit);

        // Translate all fields to Macedonian
        const translatedGrants = await Promise.all(
          grantsToShow.map(async (grant) => ({
            ...grant,
            title: await translateToMacedonian(grant.title || '', 'en'),
            description: await translateToMacedonian(grant.description || '', 'en'),
            funding_program: await translateToMacedonian(grant.funding_program || '', 'en'),
            eligible_entities: await translateToMacedonian(grant.eligible_entities || '', 'en'),
            regions_countries_for_funding: await translateToMacedonian(grant.regions_countries_for_funding || '', 'en'),
            topics: await translateToMacedonian(grant.topics || '', 'en'),
            contact: await translateToMacedonian(grant.contact || '', 'en'),
            other_eligibility_criteria: grant.other_eligibility_criteria ? await translateToMacedonian(grant.other_eligibility_criteria, 'en') : undefined,
            call_objectives: grant.call_objectives ? await translateToMacedonian(grant.call_objectives, 'en') : undefined,
            mandatory_partnership: grant.mandatory_partnership ? await translateToMacedonian(grant.mandatory_partnership, 'en') : undefined,
            project_partnership: grant.project_partnership ? await translateToMacedonian(grant.project_partnership, 'en') : undefined,
            un_sdgs: grant.un_sdgs ? await translateToMacedonian(grant.un_sdgs, 'en') : undefined,
            additional_information: grant.additional_information ? await translateToMacedonian(grant.additional_information, 'en') : undefined,
          }))
        );

        setGrants(translatedGrants);
      }
    } catch (err) {
      console.error('Error fetching Euro-Access grants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grants');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const newLimit = currentLimit + 8;
    setCurrentLimit(newLimit);
    fetchGrants(newLimit);
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  return {
    grants,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchGrants(currentLimit)
  };
};