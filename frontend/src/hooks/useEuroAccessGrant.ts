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

export const useEuroAccessGrant = (id: string | undefined) => {
  const [grant, setGrant] = useState<EuroAccessGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchGrant = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('active_euro_access_grants')
          .select('*')
          .eq('id', parseInt(id))
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Translate all fields to Macedonian
        const translatedGrant = {
          ...data,
          title: await translateToMacedonian(data.title || '', 'en'),
          description: await translateToMacedonian(data.description || '', 'en'),
          funding_program: await translateToMacedonian(data.funding_program || '', 'en'),
          eligible_entities: await translateToMacedonian(data.eligible_entities || '', 'en'),
          regions_countries_for_funding: await translateToMacedonian(data.regions_countries_for_funding || '', 'en'),
          topics: await translateToMacedonian(data.topics || '', 'en'),
          contact: await translateToMacedonian(data.contact || '', 'en'),
          other_eligibility_criteria: data.other_eligibility_criteria ? await translateToMacedonian(data.other_eligibility_criteria, 'en') : undefined,
          call_objectives: data.call_objectives ? await translateToMacedonian(data.call_objectives, 'en') : undefined,
          mandatory_partnership: data.mandatory_partnership ? await translateToMacedonian(data.mandatory_partnership, 'en') : undefined,
          project_partnership: data.project_partnership ? await translateToMacedonian(data.project_partnership, 'en') : undefined,
          un_sdgs: data.un_sdgs ? await translateToMacedonian(data.un_sdgs, 'en') : undefined,
          additional_information: data.additional_information ? await translateToMacedonian(data.additional_information, 'en') : undefined,
        };

        setGrant(translatedGrant);
      } catch (err) {
        console.error('Error fetching Euro-Access grant:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch grant');
      } finally {
        setLoading(false);
      }
    };

    fetchGrant();
  }, [id]);

  return {
    grant,
    loading,
    error,
    refetch: () => {
      if (id) {
        // Re-run the effect by changing the dependency
        setLoading(true);
        setError(null);
        // This will trigger the useEffect again
        window.location.reload();
      }
    }
  };
};