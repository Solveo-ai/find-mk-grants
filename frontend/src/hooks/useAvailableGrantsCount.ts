import { useRealtimeGrants } from "@/hooks/useGrants";

export function useAvailableGrantsCount() {
  // Count all grants
  const { data: grants, isLoading } = useRealtimeGrants();
  const count = (grants || []).length;
  return { count, isLoading };
}
