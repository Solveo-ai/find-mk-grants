import { Building2, Briefcase, FileText, TrendingUp, Banknote } from "lucide-react";

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
    id: "eu-funds",
    title: "ЕУ Фондови",
    description: "Хоризонт Европа, ИПА, Еразмус+ и други европски програми",
    icon: Building2,
    count: 45,
    type: "ЕУ Фондови"
  },
  {
    id: "public-grants",
    title: "Јавни Грантови", 
    description: "Државни фондови, министерски програми и локални иницијативи",
    icon: Briefcase,
    count: 32,
    type: "Јавни Грантови"
  },
  {
    id: "tenders",
    title: "Тендери",
    description: "Јавни набавки, концесии и договори за услуги",
    icon: FileText,
    count: 28,
    type: "Тендери"
  },
  {
    id: "investors",
    title: "Инвеститори",
    description: "Венчур капитал, бизнис ангели и приватни инвестициски фондови",
    icon: TrendingUp,
    count: 18,
    type: "Инвеститори"
  },
  {
    id: "loans",
    title: "Кредити",
    description: "Банкарски кредити, микрофинансирање и развојни кредити",
    icon: Banknote,
    count: 23,
    type: "Кредити"
  }
];

interface ExploreCategoriesProps {
  onCategorySelect: (type: string) => void;
  selectedType: string;
}

const ExploreCategories = ({ onCategorySelect, selectedType }: ExploreCategoriesProps) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedType === category.type;
            
            return (
              <div
                key={category.id}
                onClick={() => onCategorySelect(category.type)}
                className={`
                  group cursor-pointer rounded-xl p-6 transition-all duration-300 hover-scale
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground shadow-card border-2 border-primary' 
                    : 'bg-card hover:bg-card/80 hover:shadow-card border border-border'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300
                  ${isSelected
                    ? 'bg-primary-foreground/20'
                    : 'bg-primary group-hover:bg-primary group-hover:scale-110'
                  }
                `}>
                  <Icon className={`
                    w-6 h-6 transition-colors duration-300
                    ${isSelected 
                      ? 'text-primary-foreground' 
                      : 'text-primary-foreground group-hover:text-primary-foreground'
                    }
                  `} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      text-card-title font-semibold transition-colors duration-300
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
                      {category.count}
                    </div>
                  </div>
                  
                  <p className={`
                    text-sm leading-relaxed transition-colors duration-300
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
        {selectedType && (
          <div className="text-center mt-8 animate-fade-in">
            <button
              onClick={() => onCategorySelect("")}
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