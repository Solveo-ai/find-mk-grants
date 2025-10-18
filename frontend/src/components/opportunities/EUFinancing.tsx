import { useEuroAccessGrants, EuroAccessGrant } from '@/hooks/useEuroAccessGrants';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink, Clock, Building, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { translateToMacedonian } from '@/lib/translate';
import { matchesTransliterated } from '@/lib/transliteration';

interface EUFinancingProps {
  searchQuery?: string;
}

const EUFinancing = ({ searchQuery }: EUFinancingProps) => {
  const { grants, loading, error, hasMore, loadMore } = useEuroAccessGrants(8);
  const navigate = useNavigate();
  const [starredGrants, setStarredGrants] = useState<any[]>([]);
  const [translatedGrants, setTranslatedGrants] = useState<EuroAccessGrant[]>([]);

  useEffect(() => {
    const grants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    setStarredGrants(grants);
  }, []);

  // EU grants are now translated in the useEuroAccessGrants hook, so we can use them directly
  useEffect(() => {
    let filteredGrants = grants;

    // Filter grants based on search query
    if (searchQuery) {
      filteredGrants = grants.filter(grant => {
        const titleMatch = matchesTransliterated(searchQuery, grant.title || '');
        const descMatch = matchesTransliterated(searchQuery, grant.description || '');
        const programMatch = matchesTransliterated(searchQuery, grant.funding_program || '');
        return titleMatch || descMatch || programMatch;
      });
    }

    setTranslatedGrants(filteredGrants);
  }, [grants, searchQuery]);

  const toggleStar = (grant: EuroAccessGrant, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentStarred = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    const isStarred = currentStarred.some((g: any) => g.id === grant.id);

    let newStarredGrants;
    if (isStarred) {
      newStarredGrants = currentStarred.filter((g: any) => g.id !== grant.id);
    } else {
      const grantObject = {
        id: grant.id,
        title: grant.title_mk || grant.title,
        description: grant.description_mk || grant.description,
        budget: grant.amount ? `${new Intl.NumberFormat('mk-MK', {
          style: 'currency',
          currency: grant.currency || 'EUR',
          minimumFractionDigits: 2
        }).format(grant.amount)}` : undefined,
        deadline: grant.deadline,
        type: 'eu-grants',
        source: 'EU Access',
        status: grant.days_left && grant.days_left > 0 ? 'open' : 'closed',
        sector: grant.funding_program,
        url: grant.url,
        funding_program: grant.funding_program,
        eligible_entities: grant.eligible_entities,
        estimated_eu_contribution_per_project: grant.estimated_eu_contribution_per_project,
        funding_rate: grant.funding_rate,
      };
      newStarredGrants = [...currentStarred, grantObject];
    }
    localStorage.setItem('starredGrants', JSON.stringify(newStarredGrants));
    setStarredGrants(newStarredGrants);
  };

  console.log('EUFinancing render:', { grants, loading, error, hasMore });

  const calculateDaysRemaining = (deadline: string | null, daysLeft: number | null) => {
    if (daysLeft !== null) {
      if (daysLeft < 0) return "Истечено";
      if (daysLeft === 0) return "Денес";
      if (daysLeft === 1) return "1 ден";
      return `${daysLeft} дена`;
    }

    if (!deadline) return "Нема рок";

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Истечено";
    if (diffDays === 0) return "Денес";
    if (diffDays === 1) return "1 ден";
    return `${diffDays} дена`;
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Нема рок";
    try {
      return new Date(deadline).toLocaleDateString('mk-MK');
    } catch {
      return deadline;
    }
  };

  if (loading && grants.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-warning fill-warning" />
              <h2 className="text-section">EU Финансирање</h2>
              <Star className="w-6 h-6 text-warning fill-warning" />
            </div>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Можности за финансирање од Европската Унија
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Грешка при вчитување на EU финансирањето: {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="eu-financing-section" className="py-16 px-4 bg-gradient-hero">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-warning fill-warning" />
            <h2 className="text-section">EU Финансирање</h2>
            <Star className="w-6 h-6 text-warning fill-warning" />
          </div>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Можности за финансирање од Европската Унија со најнови повици и рокови
          </p>
        </div>

        {/* EU Grants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {translatedGrants.map((grant) => (
            <div key={grant.id} className="relative">
              {/* EU Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                  EU
                </div>
              </div>

              {/* Grant Card */}
              <div className="bg-card rounded-lg border border-border hover:shadow-card transition-all duration-300 group h-full">
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-card-title group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {grant.title}
                    </h3>
                    <p className="text-caption line-clamp-3 mb-3">
                      {grant.description}
                    </p>
                  </div>

                  {/* Program Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <Building className="w-3 h-3" />
                      {grant.funding_program}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-caption">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Рок:</span>
                      <span className="font-medium">{formatDeadline(grant.deadline)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Остануваат:</span>
                      <span className="font-medium text-warning flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {calculateDaysRemaining(grant.deadline, grant.days_left)}
                      </span>
                    </div>

                    {grant.eligible_entities && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Може да аплицира:</span>
                        <span className="font-medium text-right text-xs leading-tight max-w-[120px]">
                          {grant.eligible_entities.length > 30
                            ? `${grant.eligible_entities.substring(0, 30)}...`
                            : grant.eligible_entities}
                        </span>
                      </div>
                    )}

                    {/* Budget Information */}
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                        <DollarSign className="w-3 h-3" />
                        Буџет:
                      </div>
                      {grant.amount ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Буџет на повик:</span>
                          <span className="font-medium text-green-600">
                            {new Intl.NumberFormat('mk-MK', {
                              style: 'currency',
                              currency: grant.currency || 'EUR',
                              minimumFractionDigits: 2
                            }).format(grant.amount)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Буџет на повик:</span>
                          <span className="font-medium text-muted-foreground">Нема информации</span>
                        </div>
                      )}
                      {grant.estimated_eu_contribution_per_project ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">EU придонес по проект:</span>
                          <span className="font-medium text-green-600">
                            {grant.estimated_eu_contribution_per_project}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">EU придонес по проект:</span>
                          <span className="font-medium text-muted-foreground">Нема информации</span>
                        </div>
                      )}
                      {grant.funding_rate ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Стапка на финансирање:</span>
                          <span className="font-medium text-green-600">
                            {grant.funding_rate}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Стапка на финансирање:</span>
                          <span className="font-medium text-muted-foreground">Нема информации</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => toggleStar(grant, e)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          starredGrants.some((g: any) => g.id === grant.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${starredGrants.some((g: any) => g.id === grant.id) ? 'fill-current' : ''}`} />
                        {starredGrants.some((g: any) => g.id === grant.id) ? 'Зачувано' : 'Зачувај'}
                      </button>
                      <button
                        onClick={() => navigate(`/eu-financing/${grant.id}`)}
                        className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
              size="lg"
              className="bg-card hover:bg-card/80"
            >
              {loading ? 'Се вчитува...' : 'Прикажи повеќе'}
            </Button>
          </div>
        )}

        {/* Total Count */}
        <div className="text-center mt-8">
          <p className="text-caption text-muted-foreground">
            Вкупно EU можности: {translatedGrants.length}{hasMore ? '+' : ''}
          </p>
        </div>
      </div>
    </section>
  );
};

export default EUFinancing;