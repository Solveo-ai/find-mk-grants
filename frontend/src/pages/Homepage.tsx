import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import SearchFilters from "@/components/search/SearchFilters";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import EUFinancing from "@/components/opportunities/EUFinancing";
import ExploreCategories from "@/components/categories/ExploreCategories";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useAvailableGrantsCount } from "@/hooks/useAvailableGrantsCount";
import { useGrants } from "@/hooks/useGrants";
import { useEuroAccessGrants } from "@/hooks/useEuroAccessGrants";
import GrantsFeed from "@/components/grants/GrantsFeed";
import { matchesTransliterated } from "@/lib/transliteration";


const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedSector, setSelectedSector] = useState<string[]>([]);

  const { data: opportunities = [], isLoading } = useOpportunities({
    type: selectedType,
    sector: selectedSector,
    search: searchQuery
  });
  const { count: availableGrantsCount, isLoading: isGrantsCountLoading } = useAvailableGrantsCount();

  const { data: grantsData } = useGrants({ limit: 1000 });
  const { data: tendersData } = useGrants({ limit: 1000, type: ['tenders'] });
  const { data: privateFundingData } = useGrants({ limit: 1000, type: ['private-funding'] });
  const { data: loansData } = useGrants({ limit: 1000, type: ['loans'] });
  const { grants: euGrants } = useEuroAccessGrants(1000); // Get all EU grants for count

  // Filter EU grants based on search query
  const filteredEuGrants = euGrants.filter(grant => {
    if (!searchQuery) return true;
    const titleMatch = matchesTransliterated(searchQuery, grant.title || '');
    const descMatch = matchesTransliterated(searchQuery, grant.description || '');
    const programMatch = matchesTransliterated(searchQuery, grant.funding_program || '');
    return titleMatch || descMatch || programMatch;
  });

  const categoryCounts = {
    grants: grantsData?.filter(g => g.type === 'grants').length || 0,
    tenders: tendersData?.length || 0,
    'private-funding': privateFundingData?.length || 0,
    loans: loansData?.length || 0,
  };

  const scrollToEUFinancing = () => {
    const euSection = document.getElementById('eu-financing-section');
    if (euSection) {
      euSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType([]);
    setSelectedSector([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-hero mb-6">
            Најдете ги сите можности за{" "}
            <span className="text-primary">финансирање</span> во Македонија
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Централизирана платформа за ЕУ фондови, јавни грантови, тендери, 
            приватни инвеститори и кредитни можности.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">150+</div>
              <div className="text-caption">Активни можности</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">25+</div>
              <div className="text-caption">Извори на финансирање</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-success-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">€2М+</div>
              <div className="text-caption">Вкупен буџет</div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <ExploreCategories
        onCategorySelect={setSelectedType}
        selectedType={selectedType}
        counts={categoryCounts}
        onScrollToEUFinancing={scrollToEUFinancing}
        euGrantsCount={euGrants.length}
      />

      {/* Search & Filters */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedSector={selectedSector}
            onSectorChange={setSelectedSector}
            onClearFilters={clearFilters}
          />
        </div>
      </section>

      {/* Results */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-section">
              Можности за финансирање
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Се вчитуваат можности...</p>
            </div>
          ) : (
            <>
              {opportunities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {opportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      {...opportunity}
                    />
                  ))}
                </div>
              )}
              {/* Real-time Grants Feed (tenders, grants, etc) */}
              <GrantsFeed limit={200} order="random" direction="desc" type={selectedType} sector={selectedSector} search={searchQuery} />
              {opportunities.length === 0 && (searchQuery || selectedType.length > 0 || selectedSector.length > 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg mb-4">
                    Не се најдени можности кои се совпаѓаат со вашите критериуми.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Избришете ги филтрите
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* EU Financing */}
      <EUFinancing searchQuery={searchQuery} />
    </div>
  );
};

export default Homepage;