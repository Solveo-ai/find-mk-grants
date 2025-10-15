import { Briefcase, FileText, TrendingUp, Banknote, Euro } from "lucide-react";

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  type: string;
}

const categories: Category[] = [
  {
    id: "public-grants",
    title: "Грантови",
    description: "Државни фондови, министерски програми и локални иницијативи",
    icon: Briefcase,
    count: 32,
    type: "grants"
  },
  {
    id: "tenders",
    title: "Тендери",
    description: "Јавни набавки, концесии и договори за услуги",
    icon: FileText,
    count: 28,
    type: "tenders"
  },
  {
    id: "investors",
    title: "Инвеститори",
    description: "Венчур капитал, бизнис ангели и приватни инвестициски фондови",
    icon: TrendingUp,
    count: 18,
    type: "private-funding"
  },
  {
    id: "loans",
    title: "Кредити",
    description: "Банкарски кредити, микрофинансирање и развојни кредити",
    icon: Banknote,
    count: 23,
    type: "loans"
  },
  {
    id: "eu-financing",
    title: "EU Финансирање",
    description: "Европски фондови, грантови и програми за финансирање",
    icon: Euro,
    count: 0, // Will be populated dynamically
    type: "eu-financing"
  }
];

interface ExploreCategoriesProps {
  onCategorySelect: (type: string[]) => void;
  selectedType: string[];
  counts?: { [key: string]: number };
  onScrollToEUFinancing?: () => void;
  euGrantsCount?: number;
}

const ExploreCategories = ({ onCategorySelect, selectedType, counts, onScrollToEUFinancing, euGrantsCount }: ExploreCategoriesProps) => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-section mb-4">Истражи Категории</h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Откријте ги сите достапни можности за финансирање според вашите потреби
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedType.includes(category.type);
            const isEUFinancing = category.id === 'eu-financing';

            return (
              <div
                key={category.id}
                onClick={() => {
                  if (isEUFinancing && onScrollToEUFinancing) {
                    onScrollToEUFinancing();
                  } else {
                    if (selectedType.includes(category.type)) {
                      onCategorySelect(selectedType.filter(t => t !== category.type));
                    } else {
                      onCategorySelect([...selectedType, category.type]);
                    }
                  }
                }}
                className={`
                  group cursor-pointer rounded-xl p-4 lg:p-6 transition-all duration-300 hover-scale
                  ${isSelected
                    ? 'bg-primary text-primary-foreground shadow-card border-2 border-primary'
                    : 'bg-card hover:bg-card/80 hover:shadow-card border border-border'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-3 lg:mb-4 transition-all duration-300
                  ${isSelected
                    ? 'bg-primary-foreground/20'
                    : 'bg-primary group-hover:bg-primary group-hover:scale-110'
                  }
                `}>
                  <Icon className={`
                    w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300
                    ${isSelected
                      ? 'text-primary-foreground'
                      : 'text-primary-foreground group-hover:text-primary-foreground'
                    }
                  `} />
                </div>

                {/* Content */}
                <div className="space-y-1 lg:space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      text-sm lg:text-card-title font-semibold transition-colors duration-300
                      ${isSelected ? 'text-primary-foreground' : 'text-foreground group-hover:text-primary'}
                    `}>
                      {category.title}
                    </h3>
                    <div className={`
                      text-xs px-2 py-1 rounded-full font-medium transition-all duration-300
                      ${isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary group-hover:bg-primary-foreground group-hover:text-primary'
                      }
                    `}>
                      {isEUFinancing ? (euGrantsCount ?? 0) : (counts?.[category.type] ?? category.count)}
                    </div>
                  </div>

                  <p className={`
                    text-xs lg:text-sm leading-relaxed transition-colors duration-300
                    ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}
                  `}>
                    {category.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className={`
                  mt-4 w-full h-0.5 bg-gradient-primary rounded-full transform origin-left transition-transform duration-300
                  ${isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                `} />
              </div>
            );
          })}
        </div>

        {/* Clear Filter Button */}
        {selectedType.length > 0 && (
          <div className="text-center mt-8 animate-fade-in">
            <button
              onClick={() => onCategorySelect([])}
              className="text-caption text-muted-foreground hover:text-primary transition-colors underline"
            >
              Прикажи ги сите категории
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreCategories;