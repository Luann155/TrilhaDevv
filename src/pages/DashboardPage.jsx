
import React, { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Progress } from '@/components/ui/progress';

    import DashboardHeader from '@/components/dashboard/DashboardHeader';
    import PhaseProgress from '@/components/dashboard/PhaseProgress';
    import StudySummary from '@/components/dashboard/StudySummary';
    import DailySessions from '@/components/dashboard/DailySessions';
    import InfoTabs from '@/components/dashboard/InfoTabs';
    import StudyHoursChartDashboard from '@/components/dashboard/StudyHoursChartDashboard';
    import InactivityChartDashboard from '@/components/dashboard/InactivityChartDashboard';

    const DashboardPage = () => {
      const [checklistPhases, setChecklistPhases] = useState([]);
      const [studySessions, setStudySessions] = useState([]);
      const [dashboardData, setDashboardData] = useState({
        nextGoal: '',
        focusOfWeek: 'Concentre-se em manter a consistência e revisar os tópicos anteriores.',
        quickTip: 'Divida grandes tarefas em partes menores e celebre cada pequena vitória!',
      });
      const [dailySessionsInput, setDailySessionsInput] = useState([]); 
      const [plannedDaysThisMonth, setPlannedDaysThisMonth] = useState(0);
      const [totalHoursStudied, setTotalHoursStudied] = useState(0);
      
      const { toast } = useToast();
      const [loading, setLoading] = useState(true);
      const [userId, setUserId] = useState(null);

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserId(user.id);
          } else {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
            setLoading(false);
          }
        };
        getUser();
      }, [toast]);

      const fetchDashboardPageData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        
        const { data: phasesData, error: phasesError } = await supabase
          .from('checklist_phases')
          .select('id, name, user_id, completed, checklist_items (id, checked, user_id)')
          .eq('user_id', userId);
        
        if (phasesError) {
          toast({ title: "Erro ao buscar fases do checklist", description: phasesError.message, variant: "destructive" });
        } else {
          const processedPhases = phasesData.map(phase => {
            const totalTasks = phase.checklist_items.length;
            const completedTasks = phase.checklist_items.filter(item => item.checked).length;
            return {
              id: phase.id,
              name: phase.name,
              progress: phase.completed ? 100 : (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0),
              totalTasks,
              completedTasks,
              completed: phase.completed,
            };
          });
          setChecklistPhases(processedPhases);
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('id, day_of_week, start_time, end_time, subject, completed, created_at')
          .eq('user_id', userId)
          .gte('created_at', startOfMonth); 

        if (sessionsError) {
          toast({ title: "Erro ao buscar sessões de estudo", description: sessionsError.message, variant: "destructive" });
        } else {
          setStudySessions(sessionsData || []);
          
          const todayDayStr = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][today.getDay()];
          const todaySessionsFromDb = (sessionsData || [])
            .filter(s => {
                const sessionDate = new Date(s.created_at);
                const isToday = sessionDate.toDateString() === today.toDateString();
                const isRecurringToday = s.day_of_week === todayDayStr && !isToday; 
                return isToday || isRecurringToday;
            })
            .map(s => ({
              id: s.id,
              time: `${s.start_time.substring(0,5)} - ${s.end_time.substring(0,5)}`,
              task: s.subject,
              status: s.completed ? 'feito' : (new Date(`1970-01-01T${s.end_time}`) < new Date(`1970-01-01T${today.toTimeString().substring(0,8)}`) && !s.completed ? 'perdido' : 'pendente'),
              original: true, 
            }));
          
          setDailySessionsInput(prevManual => {
            const manualIds = new Set(prevManual.filter(s => !s.original).map(s => s.id));
            const uniqueFetched = todaySessionsFromDb.filter(s => !manualIds.has(s.id)); 
            return [...prevManual.filter(s=> !s.original), ...uniqueFetched]; 
          });
        }
        
        const { data: dashboardSettings, error: settingsError } = await supabase
          .from('dashboard_settings') 
          .select('next_goal, focus_of_week, quick_tip, planned_days_month')
          .eq('user_id', userId)
          .maybeSingle();

        if (settingsError && settingsError.code !== 'PGRST116') { 
          toast({ title: "Erro ao buscar configurações do painel", description: settingsError.message, variant: "destructive" });
        } 
        
        if (dashboardSettings) {
          setDashboardData({
            nextGoal: dashboardSettings.next_goal || '',
            focusOfWeek: dashboardSettings.focus_of_week || 'Concentre-se em manter a consistência.',
            quickTip: dashboardSettings.quick_tip || 'Divida grandes tarefas em partes menores.',
          });
          setPlannedDaysThisMonth(dashboardSettings.planned_days_month || 0);
        } else {
          setDashboardData({
            nextGoal: '',
            focusOfWeek: 'Concentre-se em manter a consistência e revisar os tópicos anteriores.',
            quickTip: 'Divida grandes tarefas em partes menores e celebre cada pequena vitória!',
          });
          setPlannedDaysThisMonth(0);
        }


        const { data: historyData, error: historyError } = await supabase
            .from('study_history')
            .select('duration_minutes')
            .eq('user_id', userId)
            .eq('studied', true);

        if (historyError) {
            toast({ title: "Erro ao buscar total de horas", description: historyError.message, variant: "destructive" });
        } else {
            const totalMinutes = historyData.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
            setTotalHoursStudied(totalMinutes / 60);
        }


        setLoading(false);
      }, [toast, userId]);

      useEffect(() => {
        if (userId) {
            fetchDashboardPageData();
            
            const subscriptions = [
            supabase.channel('public:study_sessions_dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${userId}` }, fetchDashboardPageData)
                .subscribe(),
            supabase.channel('public:checklist_items_dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items', filter: `user_id=eq.${userId}` }, fetchDashboardPageData)
                .subscribe(),
            supabase.channel('public:checklist_phases_dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_phases', filter: `user_id=eq.${userId}` }, fetchDashboardPageData)
                .subscribe(),
            supabase.channel('public:dashboard_settings_dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_settings', filter: `user_id=eq.${userId}` }, fetchDashboardPageData)
                .subscribe(),
            supabase.channel('public:study_history_dashboard_total_hours')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'study_history', filter: `user_id=eq.${userId}` }, fetchDashboardPageData)
                .subscribe()
            ];

            return () => {
            subscriptions.forEach(sub => supabase.removeChannel(sub));
            };
        }
      }, [fetchDashboardPageData, userId]);

      const handleSaveDashboardSetting = async (field, value) => {
        if (!userId) return;

        const { error } = await supabase
          .from('dashboard_settings')
          .upsert({ user_id: userId, [field]: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });


        if (error) {
          toast({ title: `Erro ao salvar ${field.replace(/_/g, ' ')}`, description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Salvo!", description: `${field.replace(/_/g, ' ')} atualizado(a).` });
          if (field === 'next_goal') setDashboardData(prev => ({ ...prev, nextGoal: value }));
          if (field === 'focus_of_week') setDashboardData(prev => ({ ...prev, focusOfWeek: value }));
          if (field === 'quick_tip') setDashboardData(prev => ({ ...prev, quickTip: value }));
          if (field === 'planned_days_month') setPlannedDaysThisMonth(Number(value));
        }
      };
      
      const handleAddOrUpdateDailySession = (session, isEditing) => {
        if (!session.task.trim()) {
          toast({ title: "Erro", description: "A tarefa da sessão é obrigatória.", variant: "destructive" });
          return;
        }

        if (isEditing) {
          setDailySessionsInput(prev => prev.map(s => s.id === session.id ? session : s));
          toast({ title: "Sessão Atualizada!", description: "Sessão do dia foi atualizada." });
        } else {
          setDailySessionsInput(prev => [...prev, session]);
          toast({ title: "Sessão Adicionada!", description: "Nova sessão do dia adicionada." });
        }
      };

      const handleDeleteDailySession = (sessionId) => {
        setDailySessionsInput(prev => prev.filter(s => s.id !== sessionId));
        toast({ title: "Sessão Removida", variant: "destructive" });
      };

      const overallProgress = checklistPhases.length > 0 
        ? checklistPhases.reduce((acc, phase) => acc + phase.progress, 0) / checklistPhases.length
        : 0;

      const studiedDaysThisMonth = new Set(
        studySessions
          .filter(s => s.completed) 
          .map(s => new Date(s.created_at).toLocaleDateString()) 
      ).size;

      if (loading && !userId) {
        return <div className="flex justify-center items-center h-screen"><p>Carregando usuário...</p></div>;
      }
      if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div></div>;
      }

      return (
        <div className="space-y-6 pb-10">
          <DashboardHeader overallProgress={overallProgress} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 md:col-span-2 lg:col-span-3"
          >
            <Card>
                <CardHeader>
                    <CardTitle>Total de Horas Estudadas</CardTitle>
                    <CardDescription>Seu tempo total dedicado aos estudos registrado no histórico.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{totalHoursStudied.toFixed(1)} horas</p>
                </CardContent>
            </Card>
          </motion.div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PhaseProgress checklistPhases={checklistPhases} />
            <StudySummary 
              studiedDaysThisMonth={studiedDaysThisMonth}
              plannedDaysThisMonth={plannedDaysThisMonth}
              dashboardData={dashboardData}
              onSaveSetting={handleSaveDashboardSetting}
              onSetPlannedDays={(days) => handleSaveDashboardSetting('planned_days_month', days)}
            />
            <DailySessions 
              dailySessions={dailySessionsInput}
              onAddOrUpdateSession={handleAddOrUpdateDailySession}
              onDeleteSession={handleDeleteDailySession}
            />
            {userId && <StudyHoursChartDashboard userId={userId} />}
            {userId && <InactivityChartDashboard userId={userId} />}
          </div>

          <InfoTabs 
            dashboardData={dashboardData}
            onSaveSetting={handleSaveDashboardSetting}
          />
        </div>
      );
    };

    export default DashboardPage;
