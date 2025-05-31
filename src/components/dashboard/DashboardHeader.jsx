import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Progress } from '@/components/ui/progress';
    import { Trophy, Zap, Target, Edit2 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { gamificationService } from '@/lib/gamificationService';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
      DialogClose,
    } from '@/components/ui/dialog';
    import { Label } from '@/components/ui/label';

    const DashboardHeader = ({ overallProgress }) => {
      const [userLevel, setUserLevel] = useState(1);
      const [xp, setXp] = useState(0);
      const [nextLevelXp, setNextLevelXp] = useState(100);
      const [displayName, setDisplayName] = useState('');
      const [userId, setUserId] = useState(null);
      const { toast } = useToast();
      const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
      const [newNickname, setNewNickname] = useState('');

      const fetchUserData = useCallback(async () => {
        if (!userId) return;

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          toast({ title: "Erro", description: "Não foi possível buscar dados do usuário.", variant: "destructive" });
          return;
        }
        
        const userMetadata = userData.user.user_metadata;
        const nickname = userMetadata?.nickname;
        setDisplayName(nickname || userData.user.email?.split('@')[0] || 'Estudante');
        setNewNickname(nickname || '');

        await gamificationService.ensureUserProfileExists(userId);

        const { data: levelData, error: levelError } = await supabase
          .from('user_levels')
          .select('level, experience_points, next_level_xp')
          .eq('user_id', userId)
          .maybeSingle();

        if (levelError && levelError.code !== 'PGRST116') {
          toast({ title: "Erro ao buscar nível", description: levelError.message, variant: "destructive" });
        } else if (levelData) {
          setUserLevel(levelData.level);
          setXp(levelData.experience_points);
          setNextLevelXp(levelData.next_level_xp);
        } else {
          setUserLevel(1);
          setXp(0);
          setNextLevelXp(100);
        }
      }, [userId, toast]);

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserId(user.id);
          }
        };
        getUser();
      }, []);
      
      useEffect(() => {
        if (userId) {
          fetchUserData();
          const userLevelChannel = supabase
            .channel(`public:user_levels:user_id=eq.${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_levels', filter: `user_id=eq.${userId}` }, payload => {
              if (payload.new) {
                setUserLevel(payload.new.level);
                setXp(payload.new.experience_points);
                setNextLevelXp(payload.new.next_level_xp);
              }
            })
            .subscribe();
          
          return () => {
            supabase.removeChannel(userLevelChannel);
          };
        }
      }, [userId, fetchUserData]);

      const handleSaveNickname = async () => {
        if (!newNickname.trim()) {
          toast({ title: "Apelido Inválido", description: "O apelido não pode estar vazio.", variant: "destructive" });
          return;
        }
        const { data, error } = await supabase.auth.updateUser({
          data: { nickname: newNickname.trim() }
        });

        if (error) {
          toast({ title: "Erro ao salvar apelido", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Apelido Salvo!", description: "Seu novo apelido foi salvo com sucesso." });
          setDisplayName(newNickname.trim());
          setIsNicknameModalOpen(false);
        }
      };

      const xpPercentage = nextLevelXp > 0 ? (xp / nextLevelXp) * 100 : 0;

      return (
        <>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground p-6 rounded-lg shadow-lg mb-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Olá, {displayName}!</h1>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsNicknameModalOpen(true)}>
                  <Edit2 className="h-5 w-5" />
                  <span className="sr-only">Editar Apelido</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Trophy className="h-6 w-6" />
                <span className="font-semibold">Nível {userLevel}</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso XP</span>
                <span>{xp} / {nextLevelXp} XP</span>
              </div>
              <Progress value={xpPercentage} className="w-full h-3 bg-primary-foreground/30 [&>div]:bg-yellow-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 p-3 bg-black/20 rounded-md">
                <Zap className="h-5 w-5 text-yellow-300" />
                <p>Progresso Geral da Trilha: <span className="font-semibold">{overallProgress.toFixed(0)}%</span></p>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-black/20 rounded-md">
                <Target className="h-5 w-5 text-green-300" />
                <p>Próximo nível em: <span className="font-semibold">{Math.max(0, nextLevelXp - xp)} XP</span></p>
              </div>
            </div>
          </motion.div>

          <Dialog open={isNicknameModalOpen} onOpenChange={setIsNicknameModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Definir Apelido</DialogTitle>
                <DialogDescription>
                  Escolha um apelido para ser exibido na saudação. Se deixar em branco, seu nome de usuário será usado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nickname" className="text-right">
                    Apelido
                  </Label>
                  <Input
                    id="nickname"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="col-span-3"
                    placeholder="Seu apelido aqui"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveNickname}>Salvar Apelido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    };

    export default DashboardHeader;
