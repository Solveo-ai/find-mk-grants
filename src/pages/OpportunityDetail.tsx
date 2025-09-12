import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Euro, Building2, ExternalLink, Users, FileText, Clock } from "lucide-react";

// Mock data - in real app this would come from Supabase
const mockOpportunityDetail = {
  id: "1",
  title: "ИПА III Програма за рурален развој",
  fullDescription: `Програмата за рурален развој во рамките на ИПА III има за цел да ги поддржи земјоделските производители и руралните заедници во Северна Македонија. Фокусот е на модернизација на земјоделското стопанство, подобрување на продуктивноста и развој на одржливи практики.

Програмата опфаќа:
• Поддршка за набавка на современа земјоделска механизација
• Инвестиции во преработка на земјоделски производи
• Развој на руралниот туризам
• Подобрување на земјоделската инфраструктура
• Обука и едукација на земјоделци

Средствата се доделуваат преку грант шема со максимална поддршка до 70% од вкупните прифатливи трошоци.`,
  budget: "€50,000 - €200,000",
  deadline: "15 март 2024",
  type: "ЕУ Фондови",
  source: "Министерство за земјоделство",
  status: "open",
  sector: "Земјоделство",
  eligibility: `Право на аплицирање имаат:
• Регистрирани земјоделски стопанства
• Земјоделски кооперативи
• Мали и средни претпријатија во рурални области
• НВО кои работат во областа на рурален развој
• Локални самоуправи

Барања:
• Минимум 3 години искуство во соодветната област
• Регистрација во Централниот регистар на РСМ
• Проектот да се реализира во рурална област
• Финансиска стабилност на апликантот`,
  applicationProcess: `Процесот на аплицирање:
1. Регистрација на платформата на ИПАРД програмата
2. Пополнување на апликационен формулар
3. Доставување на потребната документација
4. Оценување од страна на комисија
5. Потпишување договор и почеток на проектот

Потребна документација:
• Бизнис план за проектот
• Финансиски извештаи за последните 3 години
• Технички спецификации за планираните инвестиции
• Дозволи и лиценци (доколку се потребни)`,
  contactInfo: "За дополнителни информации контактирајте ги на ipard@mzsv.gov.mk или 02/3134-567",
  sourceUrl: "https://www.mzsv.gov.mk/ipard",
  totalBudget: "€15,000,000",
  applicantsCount: "245"
};

const OpportunityDetail = () => {
  const { id } = useParams();

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
        return "Отворено за апликации";
      case "closed":
        return "Затворено";
      case "upcoming":
        return "Претстои отворање";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до листата
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-hero text-foreground mb-3">
                {mockOpportunityDetail.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(mockOpportunityDetail.status)}>
                  {getStatusText(mockOpportunityDetail.status)}
                </Badge>
                <Badge variant="outline">{mockOpportunityDetail.type}</Badge>
                <Badge variant="outline">{mockOpportunityDetail.sector}</Badge>
              </div>
            </div>
          </div>

          {/* Quick info cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Euro className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Буџет</div>
                <div className="font-semibold">{mockOpportunityDetail.budget}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Рок</div>
                <div className="font-semibold">{mockOpportunityDetail.deadline}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Извор</div>
                <div className="font-semibold text-center text-xs">{mockOpportunityDetail.source}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Апликанти</div>
                <div className="font-semibold">{mockOpportunityDetail.applicantsCount}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Опис на програмата
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-body whitespace-pre-line">
                  {mockOpportunityDetail.fullDescription}
                </div>
              </CardContent>
            </Card>

            {/* Eligibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Критериуми за аплицирање
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-body whitespace-pre-line">
                  {mockOpportunityDetail.eligibility}
                </div>
              </CardContent>
            </Card>

            {/* Application Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Процес на аплицирање
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-body whitespace-pre-line">
                  {mockOpportunityDetail.applicationProcess}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button className="w-full" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Аплицирај сега
                </Button>
                <Button variant="outline" className="w-full">
                  Зачувај можност
                </Button>
                <Button variant="ghost" className="w-full">
                  Сподели
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Дополнителни информации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Вкупен буџет на програмата</div>
                  <div className="font-semibold">{mockOpportunityDetail.totalBudget}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Контакт за информации</div>
                  <div className="text-sm">{mockOpportunityDetail.contactInfo}</div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href={mockOpportunityDetail.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Официјален извор
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;