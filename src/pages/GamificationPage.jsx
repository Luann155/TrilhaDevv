import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Flame, Star, Trophy, Zap, ShieldCheck, Gem, Crown, Bird as DragonIcon, Rocket, Footprints, Mountain, GraduationCap, Target, Moon, Sunrise, Brain, Clock, BookOpenCheck, HelpCircle, Bomb, Hourglass, Share2, MessageSquare as MessageSquareHeart, Bed, HeartOff, Turtle, EyeOff, Drama, Snail, Droplets, Skull, MinusCircle, Skull as Grave, Bird, CircleOff, PiggyBank, Ghost, Eye, Archive, Lightbulb, Sparkles, CheckSquare, BrainCircuit, BookHeart, Repeat, Users, CalendarDays, ThumbsUp, ActivitySquare, TrendingUp, DollarSign, Gift, Zap as FastForward } from 'lucide-react';
import { motion } from 'framer-motion';

const GamificationPage = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(100);
  const [userStreaks, setUserStreaks] = useState({ current_streak: 0, longest_streak: 0 });
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
    };
    getUser();
  }, [toast]);

  const fetchGamificationData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: pointsData, error: pointsError } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .maybeSingle();
    if (pointsError && pointsError.code !== 'PGRST116') toast({ title: "Erro ao buscar pontos", description: pointsError.message, variant: "destructive" });
    else setUserPoints(pointsData?.points || 0);

    const { data: levelData, error: levelError } = await supabase
      .from('user_levels')
      .select('level, experience_points, next_level_xp')
      .eq('user_id', userId)
      .maybeSingle();
    if (levelError && levelError.code !== 'PGRST116') toast({ title: "Erro ao buscar nível", description: levelError.message, variant: "destructive" });
    else {
      setUserLevel(levelData?.level !== undefined ? levelData.level : 0);
      setXp(levelData?.experience_points || 0);
      setNextLevelXp(levelData?.next_level_xp || 100);
    }
    
    const { data: streaksData, error: streaksError } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .maybeSingle();
    if (streaksError && streaksError.code !== 'PGRST116') toast({ title: "Erro ao buscar streaks", description: streaksError.message, variant: "destructive" });
    else setUserStreaks(streaksData || { current_streak: 0, longest_streak: 0 });

    const { data: earnedBadgesData, error: earnedBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at, badges (id, name, description, icon_url, visual_details, category, is_negative, is_secret)')
      .eq('user_id', userId);
    if (earnedBadgesError) toast({ title: "Erro ao buscar medalhas ganhas", description: earnedBadgesError.message, variant: "destructive" });
    else setUserBadges(earnedBadgesData || []);
    
    const { data: allBadgesData, error: allBadgesError } = await supabase
      .from('badges')
      .select('*')
      .order('category')
      .order('xp_required', { ascending: true })
      .order('name');
    if (allBadgesError) toast({ title: "Erro ao buscar todas as medalhas", description: allBadgesError.message, variant: "destructive" });
    else setAllBadges(allBadgesData || []);

    setLoading(false);
  }, [toast, userId]);

  useEffect(() => {
    if (userId) {
        fetchGamificationData();
        const pointsChannel = supabase.channel(`public:user_points:user_id=eq.${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points', filter: `user_id=eq.${userId}` }, payload => {
                if (payload.new) setUserPoints(payload.new.points || 0);
            }).subscribe();
        const levelsChannel = supabase.channel(`public:user_levels:user_id=eq.${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_levels', filter: `user_id=eq.${userId}` }, payload => {
                if (payload.new) {
                    setUserLevel(payload.new.level !== undefined ? payload.new.level : 0);
                    setXp(payload.new.experience_points || 0);
                    setNextLevelXp(payload.new.next_level_xp || 100);
                }
            }).subscribe();
        const streaksChannel = supabase.channel(`public:user_streaks:user_id=eq.${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_streaks', filter: `user_id=eq.${userId}` }, payload => {
                if (payload.new) setUserStreaks(payload.new || { current_streak: 0, longest_streak: 0 });
            }).subscribe();
        const badgesChannel = supabase.channel(`public:user_badges:user_id=eq.${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges', filter: `user_id=eq.${userId}` }, () => fetchGamificationData()) 
            .subscribe();
        const allBadgesListener = supabase.channel('public:badges')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'badges'}, () => fetchGamificationData())
            .subscribe();


        return () => {
            supabase.removeChannel(pointsChannel);
            supabase.removeChannel(levelsChannel);
            supabase.removeChannel(streaksChannel);
            supabase.removeChannel(badgesChannel);
            supabase.removeChannel(allBadgesListener);
        };
    }
  }, [fetchGamificationData, userId]);

  const isEmoji = (str) => {
    if (typeof str !== 'string') return false;
    const emojiRegex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;
    return emojiRegex.test(str);
  };
  
  const lucideIconsMap = { Archive, Award, Flame, Star, Trophy, Zap, ShieldCheck, Gem, Crown, DragonIcon, Rocket, Footprints, Mountain, GraduationCap, Target, Moon, Sunrise, Brain, Clock, BookOpenCheck, HelpCircle, Bomb, Hourglass, Share2, MessageSquareHeart, Bed, HeartOff, Turtle, EyeOff, Drama, Snail, Droplets, Skull, MinusCircle, Grave, Bird, CircleOff, PiggyBank, Ghost, Eye, Lightbulb, Sparkles, CheckSquare, BrainCircuit, BookHeart, Repeat, Users, CalendarDays, ThumbsUp, ActivitySquare, TrendingUp, DollarSign, Gift, FastForward };

  const getBadgeIcon = (iconUrl, visualDetails) => {
    if (isEmoji(iconUrl)) {
        return <span className="text-3xl md:text-4xl">{iconUrl}</span>;
    }
    
    const IconComponent = lucideIconsMap[iconUrl] || Award; 
    
    let colorClass = "text-primary"; 
    if (visualDetails?.color) {
      const colorMap = {
        "silver": "text-gray-400",
        "blue": "text-blue-500",
        "gold": "text-yellow-500",
        "purple": "text-purple-500",
        "red": "text-red-500",
        "green": "text-green-500",
        "orange": "text-orange-500",
      };
      colorClass = colorMap[visualDetails.color] || colorClass;
    }
    return <IconComponent className={`h-8 w-8 md:h-10 md:w-10 ${colorClass}`} />;
  };
  
  const levelProgress = nextLevelXp > 0 ? (xp / nextLevelXp) * 100 : 0;

  const scoringRules = [
    { action: "Completar um item de Checklist", points: "+5 Pontos", xp: "Contribui para XP via Pontos", icon: CheckSquare },
    { action: "Completar uma fase inteira de Checklist", points: "+25 Pontos", xp: "+50 XP Direto", icon: BrainCircuit },
    { action: "Revisar um Flashcard", points: "+1 Ponto (por card)", xp: "Contribui para XP via Pontos", icon: Repeat },
    { action: "Concluir uma sessão de estudo (Trilha)", points: "+10 Pontos", xp: "+20 XP Direto", icon: BookHeart },
    { action: "Manter streak diário (5 dias)", points: "+5 Pontos Bônus", xp: "Contribui para XP via Pontos", icon: CalendarDays },
    { action: "Manter streak diário (7 dias)", points: "+7 Pontos Bônus", xp: "Contribui para XP via Pontos", icon: Flame },
    { action: "Adicionar uma Dica útil", points: "+3 Pontos", xp: "Contribui para XP via Pontos", icon: Lightbulb },
    { action: "Adicionar um Recurso (Configurações)", points: "+2 Pontos", xp: "Contribui para XP via Pontos", icon: Sparkles },
    { action: "Interagir com a comunidade (Social - Ex: dar feedback)", points: "+Variável", xp: "Variável", icon: Users },
    { action: "Geral: A cada 10 Pontos acumulados", points: "N/A", xp: "+20 XP", icon: TrendingUp },
  ];

  const renderBadgeSection = (title, categoryFilter) => {
    const filteredBadges = allBadges.filter(badge => badge.category === categoryFilter && !badge.is_negative && !badge.is_secret);
    if (filteredBadges.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * (filteredBadges.length) }}>
            <Card className="shadow-xl mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredBadges.map(badge => {
                            const earnedBadge = userBadges.find(ub => ub.badges.id === badge.id);
                            return (
                            <motion.div 
                                key={badge.id} 
                                className={`p-3 md:p-4 border rounded-lg text-center transition-all duration-300 flex flex-col items-center justify-start h-full ${earnedBadge ? 'bg-primary/10 border-primary/50 shadow-md' : 'bg-muted/50 border-border opacity-60 hover:opacity-100'}`}
                                whileHover={{ scale: earnedBadge ? 1.05 : 1.02 }}
                            >
                                <div className="flex justify-center items-center h-12 w-12 md:h-16 md:w-16 mb-2">{getBadgeIcon(badge.icon_url, badge.visual_details)}</div>
                                <h3 className="font-semibold text-xs md:text-sm mb-1 leading-tight">{badge.name}</h3>
                                <p className="text-[10px] md:text-xs text-muted-foreground leading-snug flex-grow">{badge.description}</p>
                                {earnedBadge && <p className="text-[10px] md:text-xs text-green-500 mt-1">Conquistada: {new Date(earnedBadge.earned_at).toLocaleDateString()}</p>}
                            </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
  }

  const renderSpecialBadgesSection = (title, categoryFilter, isSecret = false) => {
    const badgesToDisplay = allBadges.filter(badge => badge.category === categoryFilter && badge.is_secret === isSecret && !badge.is_negative);
    
    const earnedSecretBadgesInCategory = userBadges.filter(ub => ub.badges.category === categoryFilter && ub.badges.is_secret);

    if (badgesToDisplay.length === 0 && !isSecret) return null; 
    if (isSecret && earnedSecretBadgesInCategory.length === 0) return null; 

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
             <Card className="shadow-xl mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">{title} {isSecret && <Eye className="h-6 w-6 ml-2 text-muted-foreground"/>}</CardTitle>
                    {isSecret && <CardDescription>Medalhas secretas que você desbloqueou!</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {badgesToDisplay.map(badge => {
                            const earnedBadge = userBadges.find(ub => ub.badges.id === badge.id);
                            if (isSecret && !earnedBadge) return null; 
                            return (
                            <motion.div 
                                key={badge.id} 
                                className={`p-3 md:p-4 border rounded-lg text-center transition-all duration-300 flex flex-col items-center justify-start h-full ${earnedBadge ? 'bg-primary/10 border-primary/50 shadow-md' : 'bg-muted/50 border-border opacity-60 hover:opacity-100'}`}
                                whileHover={{ scale: earnedBadge ? 1.05 : 1.02 }}
                            >
                                <div className="flex justify-center items-center h-12 w-12 md:h-16 md:w-16 mb-2">{getBadgeIcon(badge.icon_url, badge.visual_details)}</div>
                                <h3 className="font-semibold text-xs md:text-sm mb-1 leading-tight">{badge.name}</h3>
                                {!isSecret || earnedBadge ? <p className="text-[10px] md:text-xs text-muted-foreground leading-snug flex-grow">{badge.description}</p> : <p className="text-xs text-muted-foreground">???</p>}
                                {earnedBadge && <p className="text-[10px] md:text-xs text-green-500 mt-1">Conquistada: {new Date(earnedBadge.earned_at).toLocaleDateString()}</p>}
                            </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
  }
  
  const renderNegativeBadgesSection = () => {
    const allNegativeBadges = allBadges.filter(badge => badge.is_negative);
    
    if (allNegativeBadges.length === 0) {
        return null; 
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="shadow-xl mt-8 border-amber-500/50">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center text-amber-600">
                        <Archive className="mr-2 h-6 w-6" /> Baú das Medalhas Negativas
                    </CardTitle>
                    <CardDescription>Uma coleção de "anti-conquistas" para ficar de olho e evitar!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {allNegativeBadges.map(badge => {
                            const earnedBadge = userBadges.find(ub => ub.badges.id === badge.id);
                            return (
                            <motion.div 
                                key={badge.id} 
                                className={`p-3 md:p-4 border rounded-lg text-center transition-all duration-300 flex flex-col items-center justify-start h-full 
                                            ${earnedBadge ? 'bg-destructive/20 border-destructive/60 shadow-lg opacity-100' 
                                                        : 'bg-muted/30 border-border opacity-70 hover:opacity-100 hover:bg-muted/50'}`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="flex justify-center items-center h-12 w-12 md:h-16 md:w-16 mb-2">{getBadgeIcon(badge.icon_url, badge.visual_details)}</div>
                                <h3 className={`font-semibold text-xs md:text-sm mb-1 leading-tight ${earnedBadge ? 'text-destructive-foreground' : ''}`}>{badge.name}</h3>
                                <p className={`text-[10px] md:text-xs leading-snug flex-grow ${earnedBadge ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}>{badge.description}</p>
                                {earnedBadge && <p className="text-[10px] md:text-xs text-destructive-foreground/70 mt-1">"Conquistada": {new Date(earnedBadge.earned_at).toLocaleDateString()}</p>}
                                {badge.visual_details?.removal_condition && !earnedBadge && <p className="text-[9px] text-yellow-600 mt-1 italic">{badge.visual_details.removal_condition}</p>}
                                {earnedBadge && badge.visual_details?.removal_condition && <p className="text-[9px] text-yellow-400 mt-1 italic">{badge.visual_details.removal_condition}</p>}
                            </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
  }


  if (loading && !userId) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando usuário...</p></div>;
  }
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div></div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Sua Jornada de Conquistas
        </h1>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-2 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="howToEarn">Como Ganhar Pontos/XP</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="h-full shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Pontuação Total</CardTitle>
                  <Star className="h-6 w-6 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">{userPoints}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pontos ganhos por suas atividades.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Card className="h-full shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Nível Atual</CardTitle>
                    <Trophy className="h-6 w-6 text-green-500" />
                  </div>
                  <CardDescription>Nível {userLevel}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{xp} / {nextLevelXp} XP</div>
                  <Progress value={levelProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Progresso para o próximo nível.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <Card className="h-full shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Streaks de Estudo</CardTitle>
                  <Flame className="h-6 w-6 text-orange-500" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Streak Atual</p>
                    <p className="text-2xl font-bold text-primary">{userStreaks.current_streak} dias</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maior Streak</p>
                    <p className="text-lg font-semibold text-muted-foreground">{userStreaks.longest_streak} dias</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {renderBadgeSection("Medalhas de Evolução", "Evolução")}
          {renderBadgeSection("Medalhas de Progresso", "Progresso")}
          {renderBadgeSection("Medalhas de Constância", "Constância")}
          {renderBadgeSection("Medalhas de Desempenho", "Desempenho")}
          {renderBadgeSection("Medalhas Sociais", "Social")}
          {renderSpecialBadgesSection("Medalhas Secretas Desbloqueadas", "Secreta", true)}
          {renderNegativeBadgesSection()}
        </TabsContent>
        <TabsContent value="howToEarn">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <Lightbulb className="mr-3 h-7 w-7 text-yellow-400" />
                        Guia de Pontuação e XP
                    </CardTitle>
                    <CardDescription>
                        Descubra como suas ações na plataforma se transformam em recompensas e ajudam você a evoluir!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {scoringRules.map((rule, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                        >
                            <rule.icon className="h-10 w-10 text-primary mr-4 mt-1 flex-shrink-0" />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-foreground mb-1">{rule.action}</h3>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-green-500">Pontos:</span> {rule.points}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-blue-500">XP:</span> {rule.xp}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: scoringRules.length * 0.1 }}
                        className="mt-6 p-4 border-t border-dashed"
                    >
                        <h4 className="text-lg font-semibold mb-2 flex items-center"><Zap className="h-5 w-5 mr-2 text-yellow-500" />Dica Rápida:</h4>
                        <p className="text-sm text-muted-foreground">
                            Mantenha-se ativo e explore todas as funcionalidades da plataforma para maximizar seus ganhos.
                            Cada pequena ação contribui para sua jornada de aprendizado e recompensas!
                        </p>
                    </motion.div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationPage;