import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Euro, Building2, ExternalLink } from "lucide-react";

interface OpportunityCardProps {
  id: string;
  title: string;
  description: string;
  budget?: string;
  deadline: string;
  type: string;
  source: string;
  status: "open" | "closed" | "upcoming";
  sector?: string;
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
}: OpportunityCardProps) => {
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

  return (
    <Card className="h-full hover:shadow-card transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-card-title group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <Badge className={getStatusColor(status)} variant="secondary">
            {getStatusText(status)}
          </Badge>
        </div>
        <p className="text-caption line-clamp-3 mt-2">{description}</p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {budget && (
            <div className="flex items-center gap-2 text-caption">
              <Euro className="w-4 h-4 text-muted-foreground" />
              <span>{budget}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-caption">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Рок: {deadline}</span>
          </div>
          
          <div className="flex items-center gap-2 text-caption">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>{source}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {type}
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
            asChild
            variant="default"
            size="sm"
            className="flex-1"
          >
            <Link to={`/opportunity/${id}`}>
              Детали
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard;