import { useState, useEffect } from "react";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import Navigation from "@/components/layout/Navigation";
import { Star, Building, DollarSign, ExternalLink } from "lucide-react";

const StarredGrants = () => {
  const [starredGrants, setStarredGrants] = useState<any[]>([]);

  useEffect(() => {
    const grants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    setStarredGrants(grants);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ⭐ Зачувани Можности за Финансирање
          </h1>
          <p className="text-muted-foreground">
            {starredGrants.length === 0
              ? "Нема зачувани можности во моментов."
              : `Имате ${starredGrants.length} зачувани можност${starredGrants.length === 1 ? 'и' : 'и'} за финансирање.`
            }
          </p>
        </div>

        {starredGrants.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Кликнете на "⭐ Зачувај" на некоја можност за финансирање за да ја додадете овде.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {starredGrants.map((grant) => {
              if (grant.type === 'eu-grants') {
                // Render EU grant card
                return (
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
                            <span className="font-medium">
                              {grant.deadline ? new Date(grant.deadline).toLocaleDateString('mk-MK') : 'Нема рок'}
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
                            {grant.budget ? (
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Буџет на повик:</span>
                                <span className="font-medium text-green-600">
                                  {grant.budget}
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
                            ) : null}
                            {grant.funding_rate ? (
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Стапка на финансирање:</span>
                                <span className="font-medium text-green-600">
                                  {grant.funding_rate}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentStarred = JSON.parse(localStorage.getItem('starredGrants') || '[]');
                                const newStarredGrants = currentStarred.filter((g: any) => g.id !== grant.id);
                                localStorage.setItem('starredGrants', JSON.stringify(newStarredGrants));
                                setStarredGrants(newStarredGrants);
                              }}
                              className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Star className="w-4 h-4 fill-current" />
                              Зачувано
                            </button>
                            {grant.url ? (
                              <a
                                href={grant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium opacity-50 cursor-not-allowed flex items-center justify-center"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Render regular grant card
                return (
                  <OpportunityCard
                    key={grant.id}
                    {...grant}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarredGrants;