import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedSector: string[];
  onSectorChange: (value: string[]) => void;
  onClearFilters: () => void;
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedSector,
  onSectorChange,
  onClearFilters,
}: SearchFiltersProps) => {
  const hasActiveFilters = selectedType || selectedSector.length > 0 || searchQuery;

  return (
    <Card className="bg-gradient-hero border-0 shadow-md">
      <CardContent className="p-6">
        {/* Main Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Пребарувај можности за финансирање..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 text-base bg-background/90 border-2 border-transparent focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="bg-background/90">
              <SelectValue placeholder="Тип на можност" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="public-grants">Јавни Грантови</SelectItem>
              <SelectItem value="tenders">Тендери</SelectItem>
              <SelectItem value="private-funding">Приватно Финансирање</SelectItem>
              <SelectItem value="loans">Кредити</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-background/90 h-10 font-normal"
              >
                {selectedSector.length > 0 
                  ? `${selectedSector.length} избрани` 
                  : "Сектор/Тема"
                }
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <div className="p-3">
                <div className="space-y-2">
                  {[
                    { value: "eu-funds", label: "ЕУ Фондови" },
                    { value: "agriculture", label: "Земјоделство" },
                    { value: "education", label: "Образование" },
                    { value: "health", label: "Здравство" },
                    { value: "environment", label: "Животна Средина" },
                    { value: "technology", label: "Технологија" },
                    { value: "culture", label: "Култура" },
                    { value: "tourism", label: "Туризам" },
                    { value: "sme", label: "МСП" }
                  ].map((sector) => (
                    <div key={sector.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={sector.value}
                        checked={selectedSector.includes(sector.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onSectorChange([...selectedSector, sector.value]);
                          } else {
                            onSectorChange(selectedSector.filter(s => s !== sector.value));
                          }
                        }}
                      />
                      <label
                        htmlFor={sector.value}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {sector.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center">
            <span className="text-caption">
              Активни филтри
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="bg-background/90"
            >
              <X className="w-4 h-4 mr-2" />
              Избриши филтри
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;