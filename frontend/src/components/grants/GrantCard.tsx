import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, ExternalLink, Tag, Star, Building2, Award, Users } from "lucide-react";
import { Grant } from "@/hooks/useGrants";
import { useState, useEffect } from "react";
import { cleanTitle } from "@/lib/utils";

interface GrantCardProps {
  grant: Grant;
}

const GrantCard = ({ grant }: GrantCardProps) => {
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    setIsStarred(starredGrants.some((g: any) => g.id === grant.id));
  }, [grant.id]);

  const toggleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    let newStarredGrants;
    if (isStarred) {
      newStarredGrants = starredGrants.filter((g: any) => g.id !== grant.id);
    } else {
      const grantObject = {
        id: grant.id,
        title: grant.title,
        description: grant.description,
        budget: grant.amount ? formatCurrency(grant.amount, grant.currency) : undefined,
        deadline: grant.deadline,
        type: grant.type,
        source: grant.source_id || 'Unknown',
        status: getStatusLabel(grant.deadline),
        sector: grant.tags?.join(', ') || '',
        url: grant.url,
      };
      newStarredGrants = [...starredGrants, grantObject];
    }
    localStorage.setItem('starredGrants', JSON.stringify(newStarredGrants));
    setIsStarred(!isStarred);

    // Dispatch custom event to update navigation badge
    window.dispatchEvent(new Event('starredGrantsChanged'));
  };

    const formatCurrency = (amount?: number, currency?: string) => {
     if (!amount) return null;
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: currency || 'USD',
     }).format(amount);
   };

   const formatDate = (dateString?: string) => {
     if (!dateString) return null;
     return new Date(dateString).toLocaleDateString();
   };

   const getTypeLabel = (type: string) => {
     const typeMap: Record<string, string> = {
       'grants': 'Грант',
       'tenders': 'Тендер',
       'private-funding': 'Приватно финансирање',
       'loans': 'Кредит'
     };
     return typeMap[type] || type;
   };

   const getStatusLabel = (deadline?: string) => {
     if (!deadline) return 'Претстои';
     try {
       const now = new Date();
       const deadlineDate = new Date(deadline);
       // Check if deadlineDate is valid
       if (isNaN(deadlineDate.getTime())) return 'Претстои';
       if (deadlineDate > now) return 'Отворено';
       return 'Затворено';
     } catch (error) {
       console.warn('Error parsing deadline:', deadline, error);
       return 'Претстои';
     }
   };

   const getStatusColor = (status: string) => {
     switch (status) {
       case 'Отворено': return 'bg-success text-success-foreground';
       case 'Затворено': return 'bg-destructive text-destructive-foreground';
       case 'Претстои': return 'bg-warning text-warning-foreground';
       default: return 'bg-secondary text-secondary-foreground';
     }
   };

   const calculateDaysRemaining = (deadline?: string) => {
     if (!deadline) return null;
     try {
       const deadlineDate = new Date(deadline);
       const today = new Date();
       const diffTime = deadlineDate.getTime() - today.getTime();
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

       if (diffDays < 0) return "Истечено";
       if (diffDays === 0) return "Денес";
       if (diffDays === 1) return "1 ден";
       return `${diffDays} дена`;
     } catch (error) {
       console.warn('Error calculating days remaining:', deadline, error);
       return null;
     }
   };

   const getSourceDisplayName = (sourceId?: string) => {
     if (!sourceId) return 'Нема информација';

     // Map common source IDs to display names
     const sourceMap: Record<string, string> = {
       'giz': 'GIZ',
       'undp': 'UNDP',
       'world-bank': 'World Bank',
       'ebrd': 'EBRD',
       'eib': 'EIB',
       'usaid': 'USAID',
       'euro-access': 'EuroAccess',
       'webalkans': 'WebAlkans',
       'pcb': 'ProCredit Bank',
       'na': 'НА за Европски Прашања',
       'mtsp': 'Министерство за труд и социјална политика',
       'economy': 'Министерство за економија',
       'mtsp.gov.mk': 'Министерство за труд и социјална политика',
       'economy.gov.mk': 'Министерство за економија',
       'na.org.mk': 'НА за Европски Прашања',
       'www.pcb.mk': 'ProCredit Bank',
       'ebrdgeff.com': 'EBRD Green Economy Financing Facility',
       'ausschreibungen.giz.de': 'GIZ',
       'procurement-notices.undp.org': 'UNDP',
       'eib.org': 'European Investment Bank',
       'developmentaid.org': 'DevelopmentAid',
       'tendersontime.com': 'TendersOnTime',
       'tenderimpulse.com': 'TenderImpulse',
       'tenderi.mk': 'Tenderi.mk',
       'slvesnik.com.mk': 'Сл. весник',
       'redi-ngo.eu': 'REDI NGO',
       'biddetail.com': 'BidDetail',
       'ceedhub.mk': 'CEED Hub',
       'impactventures.mk': 'Impact Ventures',
       'ec.europa.eu': 'Европска Комисија',
       'e-nabavki.gov.mk': 'Електронски набавки'
     };

     return sourceMap[sourceId] || sourceId;
   };

  return (
    <Card className="h-full hover:shadow-card transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-card-title group-hover:text-primary transition-colors line-clamp-2">
            {cleanTitle(grant.title)}
          </h3>
          <div className="flex flex-col gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {getTypeLabel(grant.type)}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(getStatusLabel(grant.deadline))}`}>
              {getStatusLabel(grant.deadline)}
            </Badge>
          </div>
        </div>
        <p className="text-caption line-clamp-3 mt-2">{grant.description}</p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Source */}
          <div className="flex items-center gap-2 text-caption">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Извор:</span>
            <span className="font-medium">{getSourceDisplayName(grant.source_id)}</span>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2 text-caption">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Буџет:</span>
            <span className="font-medium">
              {grant.amount ? formatCurrency(grant.amount, grant.currency) : 'Нема информација'}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2 text-caption">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Рок:</span>
            <span className="font-medium">
              {grant.deadline ? formatDate(grant.deadline) : 'Нема информација'}
            </span>
          </div>

          {/* Days Remaining */}
          {grant.deadline && calculateDaysRemaining(grant.deadline) && (
            <div className="flex items-center gap-2 text-caption">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Остануваат:</span>
              <span className="font-medium text-warning">
                {calculateDaysRemaining(grant.deadline)}
              </span>
            </div>
          )}

          {/* Type */}
          <div className="flex items-center gap-2 text-caption">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Тип:</span>
            <span className="font-medium">{getTypeLabel(grant.type)}</span>
          </div>
        </div>

        {grant.tags && grant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {grant.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            onClick={toggleStar}
            variant={isStarred ? "default" : "outline"}
            size="sm"
            className="flex-1"
          >
            <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-current' : ''}`} />
            {isStarred ? "Зачувано" : "Зачувај"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            asChild
          >
            <a href={grant.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GrantCard;