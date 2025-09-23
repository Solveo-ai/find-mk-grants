import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building2, Globe, Users } from "lucide-react";
import { useSources } from "@/hooks/useOpportunities";


const Sources = () => {
  const { data: sources = [], isLoading } = useSources();

  const getTotalOpportunities = () => {
    return sources.reduce((sum, source) => sum + (source.opportunities || 0), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-hero mb-6">
            Извори на <span className="text-primary">финансирање</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Запознајте се со сите организации, институции и фондови што нудат 
            можности за финансирање во Северна Македонија.
          </p>
          
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{sources.length}</div>
              <div className="text-caption">Извори</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{getTotalOpportunities()}</div>
              <div className="text-caption">Можности</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources List */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sources.map((source) => (
              <Card key={source.id} className="hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{source.name}</CardTitle>
                      <Badge variant="outline" className="mb-3">
                        {source.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{source.opportunities}</div>
                      <div className="text-xs text-muted-foreground">можности</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-body mb-4 leading-relaxed">
                    {source.description}
                  </p>
                  
                  {/* Focus areas */}
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">Области на фокус:</div>
                    <div className="flex flex-wrap gap-2">
                      {source.focus.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1">
                      <Building2 className="w-4 h-4 mr-2" />
                      Погледни можности
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={source.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-section mb-4">
            Недостасува некој извор?
          </h2>
          <p className="text-body text-muted-foreground mb-6 max-w-2xl mx-auto">
            Ако знаете за дополнителни извори на финансирање кои не се наведени тука, 
            ве молиме контактирајте не за да ги додадеме во нашата база.
          </p>
          <Button size="lg">
            Предложи извор
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Sources;