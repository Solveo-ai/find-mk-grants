import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedSector: string;
  onSectorChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  onClearFilters: () => void;
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedSector,
  onSectorChange,
  selectedStatus,
  onStatusChange,
  selectedYear,
  onYearChange,
  onClearFilters,
}: SearchFiltersProps) => {
  const hasActiveFilters = selectedType || selectedSector || selectedStatus || selectedYear || searchQuery;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="bg-background/90">
              <SelectValue placeholder="Тип на можност" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eu-funds">ЕУ Фондови</SelectItem>
              <SelectItem value="public-grants">Јавни Грантови</SelectItem>
              <SelectItem value="tenders">Тендери</SelectItem>
              <SelectItem value="private-funding">Приватно Финансирање</SelectItem>
              <SelectItem value="loans">Кредити</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={onSectorChange}>
            <SelectTrigger className="bg-background/90">
              <SelectValue placeholder="Сектор/Тема" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agriculture">Земјоделство</SelectItem>
              <SelectItem value="education">Образование</SelectItem>
              <SelectItem value="health">Здравство</SelectItem>
              <SelectItem value="environment">Животна Средина</SelectItem>
              <SelectItem value="technology">Технологија</SelectItem>
              <SelectItem value="culture">Култура</SelectItem>
              <SelectItem value="tourism">Туризам</SelectItem>
              <SelectItem value="sme">МСП</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-background/90">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Отворени</SelectItem>
              <SelectItem value="upcoming">Претстојни</SelectItem>
              <SelectItem value="closed">Затворени</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="bg-background/90">
              <SelectValue placeholder="Година" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
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