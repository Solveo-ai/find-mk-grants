import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Euro, Building2, ExternalLink, Award, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { cleanTitle } from "@/lib/utils";

interface OpportunityCardProps {
  id: string;
  title: string;
  description?: string;
  budget?: string;
  deadline?: string;
  type?: string; // 'grants', 'tenders', etc.
  source?: string;
  status?: "open" | "closed" | "upcoming";
  sector?: string;
  url?: string; // For external link
}

const OpportunityCard = ({
  id,
  title,
  description,
  budget,
  deadline,
  type,
  source,
  status,
  sector,
  url,
}: OpportunityCardProps) => {
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    setIsStarred(starredGrants.some((grant: any) => grant.id === id));
  }, [id]);

  const toggleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    let newStarredGrants;
    if (isStarred) {
      newStarredGrants = starredGrants.filter((grant: any) => grant.id !== id);
    } else {
      const grantObject = {
        id,
        title,
        description,
        budget,
        deadline,
        type,
        source,
        status,
        sector,
        url,
      };
      newStarredGrants = [...starredGrants, grantObject];
    }
    localStorage.setItem('starredGrants', JSON.stringify(newStarredGrants));
    setIsStarred(!isStarred);

    // Dispatch custom event to update navigation badge
    window.dispatchEvent(new Event('starredGrantsChanged'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-success text-success-foreground";
      case "closed":
        return "bg-destructive text-destructive-foreground";
      case "upcoming":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Отворено";
      case "closed":
        return "Затворено";
      case "upcoming":
        return "Претстои";
      default:
        return status;
    }
  };

  // Icon and color by type
  const getTypeIcon = (type: string | undefined) => {
    switch (type) {
      case "tenders":
        return <Building2 className="w-5 h-5 text-primary" />;
      case "grants":
        return <Award className="w-5 h-5 text-primary" />;
      case "loans":
        return <Euro className="w-5 h-5 text-primary" />;
      case "private-funding":
        return <Users className="w-5 h-5 text-primary" />;
      default:
        return <Award className="w-5 h-5 text-primary" />;
    }
  };

  // Type label
  const getTypeLabel = (type: string | undefined) => {
    switch (type) {
      case "tenders":
        return "Јавна набавка";
      case "grants":
        return "Грант";
      case "loans":
        return "Кредит";
      case "private-funding":
        return "Приватно финансирање";
      default:
        return type || "Можност";
    }
  };

  return (
    <Card className="h-full hover:shadow-card transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(type)}
            <Link to={`/grant/${id}`}>
              <h3 className="text-card-title group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                {cleanTitle(title)}
              </h3>
            </Link>
          </div>
          {status && (
            <Badge className={getStatusColor(status)} variant="secondary">
              {getStatusText(status)}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-caption line-clamp-3 mt-2">{description}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {budget && (
            <div className="flex items-center gap-2 text-caption">
              <Euro className="w-4 h-4 text-muted-foreground" />
              <span>{budget}</span>
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-2 text-caption">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Рок: {deadline}</span>
            </div>
          )}
          {source && (
            <div className="flex items-center gap-2 text-caption">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span>{source}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(type)}
          </Badge>
          {sector && (
            <Badge variant="outline" className="text-xs">
              {sector}
            </Badge>
          )}
        </div>
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
            <Link to={`/grant/${id}`}>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard;