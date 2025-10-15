import { useParams, useNavigate } from 'react-router-dom';
import { useEuroAccessGrant } from '@/hooks/useEuroAccessGrant';
import Navigation from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Clock, Building, MapPin, Users, FileText, Target, Info, Phone } from 'lucide-react';

const EUFinancingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grant, loading, error } = useEuroAccessGrant(id);

  const calculateDaysRemaining = (deadline: string | null, daysLeft: number | null) => {
    if (daysLeft !== null) {
      if (daysLeft < 0) return "Истечено";
      if (daysLeft === 0) return "Денес";
      if (daysLeft === 1) return "1 ден";
      return `${daysLeft} дена`;
    }

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

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Нема рок";
    try {
      return new Date(deadline).toLocaleDateString('mk-MK');
    } catch {
      return deadline;
    }
  };

  if (loading) {
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
            {error || "Не може да се вчита информацијата за овој повик."}
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад кон почетната страница
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Log what data we're receiving
  console.log('Grant data received:', {
    id: grant.id,
    title: grant.title,
    funding_rate: grant.funding_rate,
    estimated_eu_contribution_per_project: grant.estimated_eu_contribution_per_project,
    project_duration: grant.project_duration
  });

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
            <span>EU Финансирање</span>
            <span>/</span>
            <span className="text-foreground font-medium">{grant.title}</span>
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

          <h1 className="text-3xl font-bold text-foreground mb-4">
            {grant.title}
          </h1>

          {/* EU Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium">
            EU Финансирање
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Содржина на повикот</h2>
          <nav className="space-y-2">
            <a href="#key-data" className="block text-primary hover:underline">Клучни податоци за повикот</a>
            <a href="#content" className="block text-primary hover:underline">Содржина на повикот</a>
            <a href="#eligibility" className="block text-primary hover:underline">Критериуми за подобност</a>
            <a href="#additional" className="block text-primary hover:underline">Дополнителни информации</a>
          </nav>
        </div>

        {/* Call Key Data */}
        <section id="key-data" className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Клучни податоци за повикот
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-muted-foreground">Програма за финансирање</span>
              <span className="font-semibold">{grant.funding_program}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-muted-foreground">Број на повик</span>
              <span className="font-semibold">{grant.call_number}</span>
            </div>

            <div className="py-3 border-b">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-muted-foreground">Рок за аплицирање</span>
                <span className="font-semibold">{formatDeadline(grant.deadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Остануваат</span>
                <span className="font-semibold text-warning flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {calculateDaysRemaining(grant.deadline, grant.days_left)}
                </span>
              </div>
            </div>

            {grant.amount && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Буџет на повик</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('mk-MK', {
                    style: 'currency',
                    currency: grant.currency || 'EUR',
                    minimumFractionDigits: 2
                  }).format(grant.amount)}
                </span>
              </div>
            )}

            {grant.funding_rate && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Стапка на финансирање</span>
                <span className="font-semibold">{grant.funding_rate}</span>
              </div>
            )}

            {grant.estimated_eu_contribution_per_project && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Проценет придонес од ЕУ по проект</span>
                <span className="font-semibold">{grant.estimated_eu_contribution_per_project}</span>
              </div>
            )}

            {grant.project_duration && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Времетраење на проектот</span>
                <span className="font-semibold">{grant.project_duration}</span>
              </div>
            )}

            {grant.url && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Линк до повикот</span>
                <a
                  href={grant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  ec.europa.eu
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Call Content */}
        <section id="content" className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Содржина на повикот
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Краток опис</h4>
              <div className="text-muted-foreground leading-relaxed">
                {grant.description}
              </div>
            </div>

            {grant.call_objectives && (
              <div>
                <h4 className="font-semibold mb-3">Цели на повикот</h4>
                <div className="text-muted-foreground leading-relaxed">
                  {grant.call_objectives}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Eligibility Criteria */}
        <section id="eligibility" className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Критериуми за подобност
          </h3>

          <div className="space-y-6">
            {grant.regions_countries_for_funding && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Региони / земји за финансирање
                </h4>
                <div className="text-muted-foreground">
                  {grant.regions_countries_for_funding}
                </div>
              </div>
            )}

            {grant.eligible_entities && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Подобни субјекти
                </h4>
                <div className="text-muted-foreground">
                  {grant.eligible_entities}
                </div>
              </div>
            )}

            {grant.mandatory_partnership && (
              <div>
                <h4 className="font-semibold mb-3">Задолжително партнерство</h4>
                <div className="text-muted-foreground">
                  {grant.mandatory_partnership}
                </div>
              </div>
            )}

            {grant.project_partnership && (
              <div>
                <h4 className="font-semibold mb-3">Партнерство на проектот</h4>
                <div className="text-muted-foreground">
                  {grant.project_partnership}
                </div>
              </div>
            )}

            {grant.other_eligibility_criteria && (
              <div>
                <h4 className="font-semibold mb-3">Други критериуми за подобност</h4>
                <div className="text-muted-foreground">
                  {grant.other_eligibility_criteria}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Additional Information */}
        <section id="additional" className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Дополнителни информации
          </h3>

          <div className="space-y-6">
            {grant.topics && (
              <div>
                <h4 className="font-semibold mb-3">Теми</h4>
                <div className="text-muted-foreground">
                  {grant.topics}
                </div>
              </div>
            )}

            {grant.un_sdgs && (
              <div>
                <h4 className="font-semibold mb-3">Цели за одржлив развој на ОН (UN-SDGs)</h4>
                <div className="text-muted-foreground">
                  {grant.un_sdgs}
                </div>
              </div>
            )}

            {grant.relevance_for_eu_macro_region && (
              <div>
                <h4 className="font-semibold mb-3">Релевантност за ЕУ макро-регион</h4>
                <div className="text-muted-foreground">
                  {grant.relevance_for_eu_macro_region}
                </div>
              </div>
            )}

            {grant.call_documents && (
              <div>
                <h4 className="font-semibold mb-3">Документи за повикот</h4>
                <div className="text-muted-foreground">
                  {grant.call_documents}
                </div>
              </div>
            )}

            {grant.additional_information && (
              <div>
                <h4 className="font-semibold mb-3">Дополнителни информации</h4>
                <div className="text-muted-foreground">
                  {grant.additional_information}
                </div>
              </div>
            )}

            {grant.contact && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Контакт
                </h4>
                <div className="text-muted-foreground">
                  {grant.contact}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Original Source Link */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-3">Погледајте го оригиналниот повик на Euro-Access</h3>
          <p className="text-muted-foreground mb-4">
            За повеќе детали и официјални информации, посетете ја оригиналната страница на Euro-Access.
          </p>
          <Button
            onClick={() => window.open(grant.url, '_blank')}
            className="bg-primary hover:bg-primary/90"
          >
            Отвори на Euro-Access
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EUFinancingDetail;