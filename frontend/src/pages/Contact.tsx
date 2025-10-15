import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Mail, User, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Contact = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fundingQuestionLoading, setFundingQuestionLoading] = useState(false);
  const [activeForm, setActiveForm] = useState<'access' | 'suggestion' | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    organization: "",
    link: "",
    message: "",
  });
  const [fundingSourceData, setFundingSourceData] = useState({
    contactPerson: "",
    email: "",
    organizationName: "",
    programLink: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setActiveForm('access');
  };

  const handleFundingSourceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFundingSourceData(prev => ({
      ...prev,
      [name]: value
    }));
    setActiveForm('suggestion');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.surname || !formData.email || !formData.organization || !formData.message) {
      toast({
        title: "Грешка",
        description: "Ве молиме пополнете ги сите задолжителни полиња.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Вашата порака е успешно испратена. Ќе ве контактираме наскоро!",
      });

      // Reset form
      setFormData({
        name: "",
        surname: "",
        email: "",
        organization: "",
        link: "",
        message: "",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Грешка",
        description: "Настана грешка при испраќањето на пораката. Обидете се повторно.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundingSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fundingSourceData.contactPerson || !fundingSourceData.email || !fundingSourceData.organizationName || !fundingSourceData.programLink || !fundingSourceData.message) {
      toast({
        title: "Грешка",
        description: "Ве молиме пополнете ги сите задолжителни полиња.",
        variant: "destructive",
      });
      return;
    }

    setFundingQuestionLoading(true);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-funding-question', {
        body: fundingSourceData
      });

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Вашата порака е успешно испратена. Ви благодариме!",
      });

      // Reset form
      setFundingSourceData({
        contactPerson: "",
        email: "",
        organizationName: "",
        programLink: "",
        message: "",
      });

    } catch (error) {
      console.error('Error sending funding source suggestion:', error);
      toast({
        title: "Грешка",
        description: "Настана грешка при испраќањето на пораката. Обидете се повторно.",
        variant: "destructive",
      });
    } finally {
      setFundingQuestionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-hero mb-6">
            Контакт
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Имате предлог за нов извор на финансирање? Контактирајте не!
          </p>
        </div>
      </section>

      {/* Contact Forms */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-start mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Access to Finance Form */}
            <Card className={`transition-all duration-300 ${
              activeForm === 'access'
                ? 'ring-2 ring-primary shadow-lg scale-[1.02] bg-slate-50'
                : activeForm === 'suggestion'
                ? 'opacity-75 bg-background'
                : 'bg-background'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Пристап до финансии
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Доколку ти е потребна насока како да обезбедиш финансии за твојот бизнис, ние можеме да помогнеме. Сподели ни повеќе за твојата идеја или проект за да добиеш соодветна поддршка и насоки за аплицирање.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Име *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Внесете го вашето име"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surname">Презиме *</Label>
                      <Input
                        id="surname"
                        name="surname"
                        type="text"
                        placeholder="Внесете го вашето презиме"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Емаил *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Внесете го вашиот емаил"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="organization">Назив на организацијата *</Label>
                    <Input
                      id="organization"
                      name="organization"
                      type="text"
                      placeholder="Внесете го името на вашата организација"
                      value={formData.organization}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Линк (опционално)</Label>
                    <Input
                      id="link"
                      name="link"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.link}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Порака *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Опишете ја вашата идеја или проект..."
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Се испраќа..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Испрати
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Предложи нов извор за финансирање Form */}
            <Card className={`transition-all duration-300 ${
              activeForm === 'suggestion'
                ? 'ring-2 ring-primary shadow-lg scale-[1.02] bg-slate-50'
                : activeForm === 'access'
                ? 'opacity-75 bg-background'
                : 'bg-background'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Предложи нов извор за финансирање
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Доколку нудите финансиска поддршка или управувате со програми за финансирање, тука можете да ги споделите. На тој начин ќе станете дел од нашата мрежа на извори за финансирање и ќе им помогнете на бизнисите да најдат нови можности.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFundingSourceSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Лице за контакт *</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      placeholder="Внесете го името на лицето за контакт"
                      value={fundingSourceData.contactPerson}
                      onChange={handleFundingSourceChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundingEmail">Емаил *</Label>
                    <Input
                      id="fundingEmail"
                      name="email"
                      type="email"
                      placeholder="Внесете го емаилот"
                      value={fundingSourceData.email}
                      onChange={handleFundingSourceChange}
                      required
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Назив на организацијата *</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      placeholder="Внесете го називот на организацијата"
                      value={fundingSourceData.organizationName}
                      onChange={handleFundingSourceChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="programLink">Линк до програмата *</Label>
                    <Input
                      id="programLink"
                      name="programLink"
                      type="url"
                      placeholder="https://example.com"
                      value={fundingSourceData.programLink}
                      onChange={handleFundingSourceChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundingMessage">Порака *</Label>
                    <Textarea
                      id="fundingMessage"
                      name="message"
                      placeholder="Опишете ја програмата за финансирање..."
                      rows={4}
                      value={fundingSourceData.message}
                      onChange={handleFundingSourceChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={fundingQuestionLoading}
                  >
                    {fundingQuestionLoading ? (
                      "Се испраќа..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Испрати
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;