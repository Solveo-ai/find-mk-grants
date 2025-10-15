import { useState } from "react";
import { useRealtimeGrants } from "@/hooks/useGrants";
import GrantCard from "./GrantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { matchesTransliterated } from "@/lib/transliteration";

interface GrantsFeedProps {
  limit?: number;
  order?: 'created_at' | 'updated_at' | 'deadline';
  direction?: 'asc' | 'desc';
  type?: string[];
  sector?: string[];
  search?: string;
}

const GrantsFeed = ({
  limit = 200,
  order = 'created_at',
  direction = 'desc',
  type,
  sector,
  search
}: GrantsFeedProps) => {
  const { data: allGrants, isLoading, error } = useRealtimeGrants({
    limit,
    order,
    direction,
    type,
  });
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter grants by sector, search, and deadline
  const grants = allGrants?.filter(grant => {
    // Deadline filter - show grants that are not expired or expired within last 6 months
    // This allows users to see historical opportunities and prepare for future similar calls
    if (grant.deadline) {
      const deadlineDate = new Date(grant.deadline);
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)); // 180 days ago

      // Hide grants that expired more than 6 months ago
      if (deadlineDate < sixMonthsAgo) {
        return false;
      }
    }

    // Sector filter
    if (sector && sector.length > 0) {
      const hasMatchingSector = grant.tags?.some(tag => sector.includes(tag));
      if (!hasMatchingSector) return false;
    }
    // Search filter with transliteration support (Cyrillic ↔ Latin)
    if (search) {
      const titleMatch = matchesTransliterated(search, grant.title || '');
      const descMatch = matchesTransliterated(search, grant.description || '');
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

  const visibleGrants = grants?.slice(0, visibleCount) || [];
  const hasMore = grants && grants.length > visibleCount;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load grants: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!grants || grants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Нема пронајдени можности. Додајте извор за да започнете!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleGrants.map((grant) => (
          <GrantCard key={grant.id} grant={grant} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center">
          <Button onClick={() => setVisibleCount(prev => prev + 6)}>
            Покажи повеќе
          </Button>
        </div>
      )}
    </div>
  );
};

export default GrantsFeed;