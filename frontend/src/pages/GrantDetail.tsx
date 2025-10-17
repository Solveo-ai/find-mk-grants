import { useParams, useNavigate } from 'react-router-dom';
import { useOpportunity } from '@/hooks/useOpportunities';
import Navigation from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Euro, Building2, ExternalLink, Award, Users, FileText, Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cleanTitle } from '@/lib/utils';

const GrantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: grant, isLoading, error } = useOpportunity(id || '');
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (grant?.id) {
      const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
      setIsStarred(starredGrants.some((starredGrant: any) => starredGrant.id === grant.id));
    }
  }, [grant?.id]);

  const toggleStar = () => {
    if (!grant) return;

    const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    let newStarredGrants;
    if (isStarred) {
      newStarredGrants = starredGrants.filter((starredGrant: any) => starredGrant.id !== grant.id);
    } else {
      const grantObject = {
        id: grant.id,
        title: grant.title,
        description: grant.description,
        budget: grant.budget,
        deadline: grant.deadline,
        type: grant.type,
        source: grant.source,
        status: grant.status,
        sector: grant.sector,
        url: grant.source_url,
      };
      newStarredGrants = [...starredGrants, grantObject];
    }
    localStorage.setItem('starredGrants', JSON.stringify(newStarredGrants));
    setIsStarred(!isStarred);

    // Dispatch custom event to update navigation badge
    window.dispatchEvent(new Event('starredGrantsChanged'));
  };

  const calculateDaysRemaining = (deadline: string | undefined) => {
    if (!deadline) return "Нема рок";

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Истечено";
    if (diffDays === 0) return "Денес";
    if (diffDays === 1) return "1 ден";
    return `${diffDays} дена`;
  };

  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return "Нема рок";
    try {
      return new Date(deadline).toLocaleDateString('mk-MK');
    } catch {
      return deadline;
    }
  };

  const getStatusColor = (status: string | undefined) => {
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

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "open":
        return "Отворено";
      case "closed":
        return "Затворено";
      case "upcoming":
        return "Претстои";
      default:
        return status || "Непознато";
    }
  };

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

  const getTypeLabel = (type: string | undefined) => {
    switch (type) {
      case "tenders":
        return "Тендер";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-40 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !grant) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Грешка при вчитување</h1>
          <p className="text-muted-foreground mb-6">
            {error?.message || "Не може да се вчита информацијата за овој грант."}
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад кон почетната страница
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary transition-colors"
            >
              Почетна
            </button>
            <span>/</span>
            <span>Грантови</span>
            <span>/</span>
            <span className="text-foreground font-medium">{cleanTitle(grant.title)}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {getTypeIcon(grant.type)}
              <h1 className="text-3xl font-bold text-foreground">
                {cleanTitle(grant.title)}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(grant.status)}>
                {getStatusText(grant.status)}
              </Badge>
              <Badge variant="outline">{getTypeLabel(grant.type)}</Badge>
              {grant.sector && <Badge variant="outline">{grant.sector}</Badge>}
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Содржина на грантот</h2>
          <nav className="space-y-2">
            <a href="#key-data" className="block text-primary hover:underline">Клучни податоци</a>
            <a href="#description" className="block text-primary hover:underline">Опис</a>
            <a href="#eligibility" className="block text-primary hover:underline">Критериуми за аплицирање</a>
            <a href="#additional" className="block text-primary hover:underline">Дополнителни информации</a>
          </nav>
        </div>

        {/* Key Data */}
        <section id="key-data" className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Клучни податоци
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-muted-foreground">Извор</span>
              <span className="font-semibold">{grant.source || "Нема информација"}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-muted-foreground">Тип</span>
              <span className="font-semibold">{getTypeLabel(grant.type)}</span>
            </div>

            {grant.deadline && (
              <div className="py-3 border-b">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-muted-foreground">Рок за аплицирање</span>
                  <span className="font-semibold">{formatDeadline(grant.deadline)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Остануваат</span>
                  <span className="font-semibold text-warning flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {calculateDaysRemaining(grant.deadline)}
                  </span>
                </div>
              </div>
            )}

            {grant.budget && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Буџет</span>
                <span className="font-semibold">{grant.budget}</span>
              </div>
            )}

            {grant.sector && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Сектор</span>
                <span className="font-semibold">{grant.sector}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-muted-foreground">Статус</span>
              <Badge className={getStatusColor(grant.status)}>
                {getStatusText(grant.status)}
              </Badge>
            </div>
          </div>
        </section>

        {/* Description */}
        <section id="description" className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Опис на програмата
          </h3>

          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {grant.full_description || grant.description || "Нема информација"}
          </div>
        </section>

        {/* Eligibility */}
        {grant.eligibility && (
          <section id="eligibility" className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Критериуми за аплицирање
            </h3>

            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {grant.eligibility}
            </div>
          </section>
        )}

        {/* Application Process */}
        {grant.application_process && (
          <section id="additional" className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Процес на аплицирање
            </h3>

            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {grant.application_process}
            </div>
          </section>
        )}

        {/* Additional Information */}
        {(grant.contact_info || grant.total_budget || grant.applicants_count) && (
          <section className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Дополнителни информации
            </h3>

            <div className="space-y-4">
              {grant.total_budget && (
                <div>
                  <div className="text-sm text-muted-foreground">Вкупен буџет на програмата</div>
                  <div className="font-semibold">{grant.total_budget}</div>
                </div>
              )}

              {grant.contact_info && (
                <div>
                  <div className="text-sm text-muted-foreground">Контакт за информации</div>
                  <div className="text-sm">{grant.contact_info}</div>
                </div>
              )}

              {grant.applicants_count && (
                <div>
                  <div className="text-sm text-muted-foreground">Број на апликанти</div>
                  <div className="font-semibold">{grant.applicants_count}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex gap-4 justify-center">
            <Button onClick={toggleStar} variant={isStarred ? "default" : "outline"} size="lg">
              <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-current' : ''}`} />
              {isStarred ? "Зачувано" : "Зачувај"}
            </Button>
          </div>
        </div>

        {/* Original Source Link */}
        {grant.source_url && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Види ја оригиналната објава</h3>
            <p className="text-muted-foreground mb-4">
              За повеќе детали и официјални информации, посетете ја оригиналната страница.
            </p>
            <Button
              onClick={() => window.open(grant.source_url, '_blank')}
              className="bg-primary hover:bg-primary/90"
            >
              Види ја оригиналната објава
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantDetail;