import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckSquare, TrendingUp } from 'lucide-react';

const WelcomePage = ({ onComplete }) => {
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/1e9da85f-0f3d-41c2-8d4c-abdb48609b38/313196da4c6c4ff2c3deb79423d2ed81.png";

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Trilha de Estudos Personalizada",
      description: "Organize seus estudos diários, defina horários e matérias para uma jornada de aprendizado focada.",
    },
    {
      icon: <CheckSquare className="h-8 w-8 text-primary" />,
      title: "Checklists por Fase",
      description: "Crie e acompanhe fases de estudo com checklists detalhados, links e materiais de apoio.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Painel de Progresso",
      description: "Visualize seu avanço, defina metas e acompanhe seu desempenho de forma intuitiva.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-12"
      >
        <img src={logoUrl} alt="Trilha Dev Logo" className="w-48 h-auto mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl">
          Bem-vindo(a) ao <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Trilha Dev</span>!
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
          Sua plataforma completa para organizar, acompanhar e potencializar sua jornada de estudos e desenvolvimento.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2, delayChildren: 0.5, duration: 0.5 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
          >
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
      >
        <Button
          size="lg"
          onClick={onComplete}
          className="text-lg font-semibold px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-300"
        >
          Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>

      <motion.p 
        className="mt-12 text-xs text-muted-foreground"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 1.5, duration: 0.5}}
      >
        Versão 0.0.1 | Trilha Dev &copy; {new Date().getFullYear()}
      </motion.p>
    </div>
  );
};

export default WelcomePage;