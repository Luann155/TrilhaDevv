
    import React from 'react';
    import { Link, useLocation, useNavigate } from 'react-router-dom';
    import { cn } from '@/lib/utils';
    import { Button } from '@/components/ui/button';
    import { ThemeToggle } from '@/components/ThemeToggle';
    import { LayoutDashboard, CalendarDays, ListChecks, History, Lightbulb, Settings, LogOut, ShieldQuestion, Layers, Brain, Trophy, Library as LibraryIcon, Edit3 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const navItems = [
      { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
      { href: '/trilha', label: 'Trilha', icon: CalendarDays },
      { href: '/checklists', label: 'Checklists', icon: ListChecks },
      { href: '/flashcards', label: 'Flashcards', icon: Layers },
      { href: '/mapas-mentais', label: 'Mapas Mentais', icon: Brain },
      { href: '/biblioteca', label: 'Biblioteca', icon: LibraryIcon },
      { href: '/revisao-diaria', label: 'Revisão Diária', icon: Edit3 },
      { href: '/gamificacao', label: 'Gamificação', icon: Trophy },
      { href: '/historico', label: 'Histórico', icon: History },
      { href: '/dicas', label: 'Dicas', icon: Lightbulb },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ];

    const Sidebar = ({ onLinkClick }) => {
      const location = useLocation();
      const navigate = useNavigate();
      const [, setHasVisitedWelcome] = useLocalStorage('hasVisitedWelcomeTrilhaDev', false);
      const { toast } = useToast();
      
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/1e9da85f-0f3d-41c2-8d4c-abdb48609b38/313196da4c6c4ff2c3deb79423d2ed81.png";

      const handleResetWelcome = () => {
        setHasVisitedWelcome(false);
        navigate('/');
        if (onLinkClick) onLinkClick();
      };

      const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "Erro ao sair", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Você saiu!", description: "Até a próxima!"});
          setHasVisitedWelcome(false); 
          navigate('/auth'); 
        }
        if (onLinkClick) onLinkClick(); 
      };

      const handleNavLinkClick = () => {
        if (onLinkClick) {
          onLinkClick(); 
        }
      };

      return (
        <motion.aside 
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full md:w-64 h-full bg-card text-card-foreground border-r flex flex-col p-4 space-y-2 glass-effect overflow-y-auto"
        >
          <div className="flex items-center space-x-2 p-2 mb-3 flex-shrink-0">
            <img src={logoUrl} alt="Trilha Dev Logo Icon" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-primary whitespace-nowrap">Trilha Dev</h1>
          </div>
          <nav className="flex-grow overflow-y-auto pr-1">
            <ul className="space-y-1.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Button
                    asChild
                    variant={location.pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start text-base py-2.5 px-3', 
                      location.pathname.startsWith(item.href) && 'font-semibold'
                    )}
                    onClick={handleNavLinkClick}
                  >
                    <Link to={item.href} className="flex items-center space-x-3 w-full">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-3 border-t space-y-1.5 flex-shrink-0">
            <Button variant="outline" className="w-full justify-start py-2.5 px-3" onClick={handleResetWelcome}>
              <ShieldQuestion className="mr-2 h-4 w-4 flex-shrink-0" /> 
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">Ver Boas-Vindas</span>
            </Button>
            <Button variant="outline" className="w-full justify-start py-2.5 px-3" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4 flex-shrink-0" /> 
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">Sair</span>
            </Button>
            <div className="flex justify-center pt-1">
              <ThemeToggle />
            </div>
          </div>
        </motion.aside>
      );
    };

    export default Sidebar;
  