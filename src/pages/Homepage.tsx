import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import SearchFilters from "@/components/search/SearchFilters";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import FeaturedOpportunities from "@/components/opportunities/FeaturedOpportunities";
import ExploreCategories from "@/components/categories/ExploreCategories";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";

// Mock data for demonstration
const mockOpportunities = [
  {
    id: "1",
    title: "ИПА III Програма за рурален развој",
    description: "Поддршка за модернизација на земјоделското стопанство и развој на руралните области во Северна Македонија.",
    budget: "€50,000 - €200,000",
    deadline: "15 март 2024",
    type: "ЕУ Фондови",
    source: "Министерство за земјоделство",
    status: "open" as const,
    sector: "Земјоделство"
  },
  {
    id: "2", 
    title: "Фонд за иновации и технолошки развој",
    description: "Грантови за технолошки стартапи и иновативни проекти во областа на дигитализација.",
    budget: "€10,000 - €100,000",
    deadline: "30 април 2024",
    type: "Јавни Грантови",
    source: "Фонд за иновации",
    status: "open" as const,
    sector: "Технологија"
  },
  {
    id: "3",
    title: "Еразмус+ Младински програми",
    description: "Можности за финансирање на младински проекти и мобилност во рамките на ЕУ.",
    budget: "€5,000 - €60,000",
    deadline: "22 мај 2024",
    type: "ЕУ Фондови",
    source: "Национална Агенција",
    status: "upcoming" as const,
    sector: "Образование"
  },
  {
    id: "4",
    title: "Конкурс за еколошки проекти",
    description: "Поддршка за проекти кои промовираат одржлива животна средина и зелени технологии.",
    budget: "€15,000 - €75,000",
    deadline: "10 февруари 2024",
    type: "Кредити",
    source: "ЕБРР",
    status: "closed" as const,
    sector: "Животна Средина"
  },
  {
    id: "5",
    title: "Јавна набавка за IT услуги",
    description: "Тендер за развој на дигитална платформа за електронски услуги на граѓаните.",
    budget: "€200,000 - €500,000",
    deadline: "25 март 2024",
    type: "Тендери",
    source: "Министерство за информатичко општество",
    status: "open" as const,
    sector: "Технологија"
  },
  {
    id: "6",
    title: "Seed инвестиции за стартапи",
    description: "Рано-фазни инвестиции за технолошки стартапи во регионот на Балканот.",
    budget: "€25,000 - €250,000",
    deadline: "15 мај 2024",
    type: "Инвеститори",
    source: "South Central Ventures",
    status: "open" as const,
    sector: "Технологија"
  }
];

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSector, setSelectedSector] = useState<string[]>([]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedSector([]);
  };

  // Filter opportunities based on search and filters
  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesSearch = searchQuery === "" || 
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "" || opportunity.type === selectedType;
    const matchesSector = selectedSector.length === 0 || selectedSector.includes(opportunity.sector);
    
    return matchesSearch && matchesType && matchesSector;
  });

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
              Можности за финансирање ({filteredOpportunities.length})
            </h2>
          </div>

          {filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  {...opportunity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Не се најдени можности кои се совпаѓаат со вашите критериуми.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Избришете ги филтрите
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Opportunities */}
      <FeaturedOpportunities />
    </div>
  );
};

export default Homepage;