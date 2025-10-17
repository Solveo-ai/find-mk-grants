import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { translateToMacedonian } from '@/lib/translate';

// Fisher-Yates shuffle algorithm to randomize array order
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface Grant {
   id: string;
   source_id: string;
   source_url: string;
   title: string;
   url: string;
   description?: string;
   deadline?: string;
   amount?: number;
   currency?: string;
   type: string;
   tags: string[];
   content_hash: string;
   raw_html?: string;
   created_at: string;
   updated_at: string;
}

export interface GrantSource {
   id: string;
   url: string;
   parser_hint?: Record<string, unknown>;
   status: 'pending' | 'processing' | 'success' | 'error';
   last_fetched_at?: string;
   last_error_message?: string;
   created_at: string;
   updated_at: string;
 }

export const useGrants = (options: {
     limit?: number;
     order?: 'created_at' | 'updated_at' | 'deadline' | 'random';
     direction?: 'asc' | 'desc';
     type?: string[];
 } = {}) => {
     const { limit = 500, order = 'random', direction = 'desc', type } = options;

    const query = useQuery({
       queryKey: ['grants', { limit, order, direction, type }],
       queryFn: async () => {
         let query = supabase
           .from('grants')
           .select('*');

         // Use random ordering to mix grants from different sources
         if (order === 'random') {
           query = query.order('created_at', { ascending: false }); // First order by date
           // Note: Supabase doesn't support RANDOM() in order(), so we'll shuffle client-side
         } else {
           query = query.order(order, { ascending: direction === 'asc' });
         }

         if (limit) {
           query = query.limit(limit);
         }

         if (type && type.length > 0) {
           query = query.in('type', type);
         }

         const { data, error } = await query;
         if (error) throw error;

         let processedGrants = data as Grant[];

         // Shuffle the results to mix grants from different sources
         if (order === 'random') {
           processedGrants = shuffleArray(processedGrants);
         }

         // Translate grant titles and descriptions to Macedonian
         const translatedGrants = await Promise.all(
           processedGrants.map(async (grant) => ({
             ...grant,
             title: await translateToMacedonian(grant.title || '', 'de'), // Try German first, fallback to English
             description: await translateToMacedonian(grant.description || '', 'de'), // Try German first, fallback to English
           }))
         );

         return translatedGrants;
       },
       refetchInterval: 10000, // Refetch every 10 seconds for near real-time updates
       refetchOnWindowFocus: true,
     });

    return query;
 };

export const useRealtimeGrants = (options: {
     limit?: number;
     order?: 'created_at' | 'updated_at' | 'deadline' | 'random';
     direction?: 'asc' | 'desc';
     type?: string[];
 } = {}) => {
     const queryClient = useQueryClient();
     const { limit = 500, order = 'random', direction = 'desc', type } = options;

    // Initial query
    const query = useGrants(options);

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('grants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grants',
        },
        (payload) => {
          console.log('Realtime grant change:', payload);

          // Invalidate and refetch the grants query
          queryClient.invalidateQueries({ queryKey: ['grants'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, limit, order, direction]);

  return query;
};

export const useGrantSources = () => {
  return useQuery({
    queryKey: ['grant-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grant_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GrantSource[];
    },
  });
};

export const useCreateGrantSource = () => {
   const queryClient = useQueryClient();

   return async (url: string, parserHint?: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('grant_sources')
      .insert({
        url,
        parser_hint: parserHint,
      })
      .select()
      .single();

    if (error) throw error;

    // Invalidate sources query
    queryClient.invalidateQueries({ queryKey: ['grant-sources'] });

    return data as GrantSource;
  };
};