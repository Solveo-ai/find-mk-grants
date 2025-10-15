import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
        setGrants(grantsToShow);
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