import OpportunityCard from "./OpportunityCard";
import { Star } from "lucide-react";

// Mock featured opportunities data
const featuredOpportunities = [
  {
    id: "featured-1",
    title: "Хоризонт Европа - Дигитална Трансформација",
    description: "Грантови за дигитална трансформација на МСП и истражувачки институции. Поддршка за AI, IoT и blockchain решенија.",
    budget: "€100,000 - €2,000,000",
    deadline: "28 март 2024",
    type: "ЕУ Фондови",
    source: "Европска Комисија",
    status: "open" as const,
    sector: "Технологија",
    eligibility: "МСП, истражувачки институции"
  },
  {
    id: "featured-2",
    title: "Фонд за зелена економија",
    description: "Инвестиции во обновливи извори на енергија и енергетска ефикасност за локални заедници и претпријатија.",
    budget: "€25,000 - €500,000",
    deadline: "15 април 2024",
    type: "Јавни Грантови",
    source: "Министерство за животна средина",
    status: "open" as const,
    sector: "Животна Средина",
    eligibility: "Локални самоуправи, НВО, претпријатија"
  },
  {
    id: "featured-3",
    title: "Младински предприемнички програми",
    description: "Стартап грантови и менторство за млади претприемачи (18-35 години) во сите сектори.",
    budget: "€5,000 - €50,000",
    deadline: "5 мај 2024",
    type: "Приватно Финансирање",
    source: "УСАИД Македонија",
    status: "upcoming" as const,
    sector: "Претприемништво",
    eligibility: "Млади 18-35 години"
  },
  {
    id: "featured-4",
    title: "Културно наследство и туризам",
    description: "Поддршка за проекти кои промовираат културното наследство и развиваат културен туризам.",
    budget: "€10,000 - €150,000",
    deadline: "20 април 2024",
    type: "ЕУ Фондови",
    source: "IPA III Програма",
    status: "open" as const,
    sector: "Култура",
    eligibility: "НВО, локални самоуправи, културни институции"
  }
];

const FeaturedOpportunities = () => {
  const calculateDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Истечено";
    if (diffDays === 0) return "Денес";
    if (diffDays === 1) return "1 ден";
    return `${diffDays} дена`;
  };

  return (
    <section className="py-16 px-4 bg-gradient-hero">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-warning fill-warning" />
            <h2 className="text-section">Издвоени Можности</h2>
            <Star className="w-6 h-6 text-warning fill-warning" />
          </div>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Најпопуларните можности за финансирање со надоаѓачки рокови
          </p>
        </div>

        {/* Featured Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {featuredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="relative">
              {/* Featured badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                  Издвоено
                </div>
              </div>
              
              {/* Enhanced OpportunityCard with additional info */}
              <div className="bg-card rounded-lg border border-border hover:shadow-card transition-all duration-300 group h-full">
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-card-title group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {opportunity.title}
                    </h3>
                    <p className="text-caption line-clamp-3 mb-3">
                      {opportunity.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-caption">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Извор:</span>
                      <span className="font-medium">{opportunity.source}</span>
                    </div>
                    
                    {opportunity.budget && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Буџет:</span>
                        <span className="font-medium text-primary">{opportunity.budget}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Рок:</span>
                      <span className="font-medium">{opportunity.deadline}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Остануваат:</span>
                      <span className="font-medium text-warning">
                        {calculateDaysRemaining(opportunity.deadline)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Може да аплицира:</span>
                      <span className="font-medium text-right text-xs leading-tight">
                        {opportunity.eligibility}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md text-sm font-medium transition-colors">
                      Погледај Детали
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOpportunities;