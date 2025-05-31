import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { ThemeToggle } from '@/components/ThemeToggle';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Bell, Palette, Edit3, UserCircle, Info } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';

    const ConfiguracoesPage = () => {
      const [planName, setPlanName] = useLocalStorage('devPathPlanName', 'Trilha Front-End Essencial');
      const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('devPathNotifications', true);

      const handlePlanNameChange = (e) => {
        setPlanName(e.target.value);
      };

      const handleNotificationsChange = (checked) => {
        setNotificationsEnabled(checked);
      };

      const creatorImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/1e9da85f-0f3d-41c2-8d4c-abdb48609b38/9c6254f413126bc3b5fdc20a76de6bb3.png";

      return (
        <div className="space-y-8 max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Configurações</h1>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-3">
              <UserCircle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Sobre o Criador</CardTitle>
                <CardDescription>Conheça um pouco sobre quem desenvolveu este app.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <img 
                  src={creatorImageUrl} 
                  alt="Luan Pereira, criador do aplicativo" 
                  className="rounded-full h-32 w-32 object-cover border-4 border-primary shadow-md"
                />
              </div>
              <p className="text-muted-foreground text-left leading-relaxed">
                Este site foi desenvolvido por mim, Luan Pereira, como parte da minha trajetória de transição para a área de Desenvolvimento Frontend. Sou apaixonado por tecnologia, design de interfaces e soluções que facilitam a vida das pessoas. Atualmente, estudo Análise e Desenvolvimento de Sistemas e aplico meus conhecimentos em projetos práticos como este, unindo programação, criatividade e foco em usabilidade.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Palette className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize o tema do aplicativo.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Label htmlFor="theme-toggle-label" className="text-base">Tema</Label>
              <div id="theme-toggle-label">
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Edit3 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Plano de Estudos</CardTitle>
                <CardDescription>Ajuste o nome do seu plano de estudos.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plan-name">Nome do Plano</Label>
                <Input 
                  id="plan-name" 
                  value={planName}
                  onChange={handlePlanNameChange}
                  className="mt-1"
                />
              </div>
              <Button className="w-full">Salvar Nome do Plano</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie os alertas do aplicativo.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsChange}
                />
                <Label htmlFor="notifications">Ativar/desativar alertas</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                (Funcionalidade de alertas será implementada em breve)
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-3">
              <Info className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Integrações Futuras</CardTitle>
                <CardDescription>O que vem por aí.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve: Integração com Google Calendar e opção para exportar progresso.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    };

    export default ConfiguracoesPage;