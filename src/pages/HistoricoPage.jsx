import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { CalendarPlus as CalendarIcon, PlusCircle, Filter } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import PasswordPromptDialog from '@/components/PasswordPromptDialog';
    import ConfirmationDialog from '@/components/ConfirmationDialog';
    import { supabase } from '@/lib/supabaseClient';
    import { gamificationService } from '@/lib/gamificationService';

    import HistoricoEntryModal from '@/components/historico/HistoricoEntryModal';
    import HistoricoFilterModal from '@/components/historico/HistoricoFilterModal';
    import HistoricoList from '@/components/historico/HistoricoList';
    import StudyHoursChart from '@/components/historico/StudyHoursChart';


    const HistoricoPage = () => {
      const [history, setHistory] = useState([]);
      const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
      const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
      
      const [editingEntry, setEditingEntry] = useState(null);
      const [entryToDeleteId, setEntryToDeleteId] = useState(null);

      const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: 'all',
        period: 'month', 
      });

      const { toast } = useToast();
      const [loading, setLoading] = useState(true);
      const [userId, setUserId] = useState(null);

      const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
      const [passwordAction, setPasswordAction] = useState(null);

      const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
      const [deleteAction, setDeleteAction] = useState(null);

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setUserId(user.id);
          else toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        };
        getUser();
      }, [toast]);

      const fetchHistory = useCallback(async () => {
        if (!userId) {
          setLoading(false);
          return;
        }
        setLoading(true);
        
        let query = supabase
          .from('study_history') 
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false })
          .order('start_time', { ascending: false });

        let effectiveStartDate = filters.startDate;
        let effectiveEndDate = filters.endDate;

        if (filters.period !== 'custom') {
            const today = new Date();
            if (filters.period === 'day') {
                effectiveStartDate = today.toISOString().split('T')[0];
                effectiveEndDate = effectiveStartDate;
            } else if (filters.period === 'week') {
                const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1) ));
                effectiveStartDate = firstDayOfWeek.toISOString().split('T')[0];
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                effectiveEndDate = lastDayOfWeek.toISOString().split('T')[0];
            } else if (filters.period === 'month') {
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                effectiveStartDate = firstDayOfMonth.toISOString().split('T')[0];
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                effectiveEndDate = lastDayOfMonth.toISOString().split('T')[0];
            } else if (filters.period === 'year') {
                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                effectiveStartDate = firstDayOfYear.toISOString().split('T')[0];
                const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
                effectiveEndDate = lastDayOfYear.toISOString().split('T')[0];
            }
        }

        if (effectiveStartDate) query = query.gte('entry_date', effectiveStartDate);
        if (effectiveEndDate) query = query.lte('entry_date', effectiveEndDate);
        
        if (filters.status === 'studied') query = query.eq('studied', true);
        else if (filters.status === 'not_studied') query = query.eq('studied', false);
        
        const { data, error } = await query;

        if (error) {
          toast({ title: "Erro ao buscar histórico", description: error.message, variant: "destructive" });
          setHistory([]);
        } else {
          setHistory(data || []);
        }
        setLoading(false);
      }, [toast, userId, filters]);

      const checkAndCreateMissingEntries = useCallback(async () => {
        if (!userId) return;

        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('day_of_week, subject, start_time, end_time')
          .eq('user_id', userId)
          .eq('completed', false); 

        if (!sessions || sessions.length === 0) return;

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];
        const dayOfWeekMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const yesterdayDayName = dayOfWeekMap[yesterday.getDay()];

        const { data: existingEntry, error: existingEntryError } = await supabase
          .from('study_history')
          .select('id')
          .eq('user_id', userId)
          .eq('entry_date', yesterdayISO)
          .maybeSingle();

        if (existingEntryError && existingEntryError.code !== 'PGRST116') {
          console.error("Error checking existing history entry:", existingEntryError);
          return;
        }
        
        if (!existingEntry) {
          const plannedForYesterday = sessions.some(s => s.day_of_week === yesterdayDayName);
          if (plannedForYesterday) {
            const { error: insertError } = await supabase
              .from('study_history')
              .insert({ user_id: userId, entry_date: yesterdayISO, studied: false });
            if (insertError) {
              toast({ title: "Erro ao registrar dia não estudado", description: insertError.message, variant: "destructive" });
            } else {
              fetchHistory(); 
            }
          }
        }
      }, [toast, fetchHistory, userId]);

      useEffect(() => {
        if (userId) {
            fetchHistory();
            checkAndCreateMissingEntries();
        }
      }, [fetchHistory, checkAndCreateMissingEntries, userId]);

      const handlePasswordConfirm = () => {
        if (passwordAction) {
          passwordAction();
          setPasswordAction(null);
        }
      };

      const handleDeleteConfirm = () => {
        if (deleteAction) {
          deleteAction();
          setDeleteAction(null);
        }
      };

      const handleAddOrUpdateEntry = async (formData) => {
        if (!userId) return;
        const { entryDate, entryStartTime, entryEndTime, entrySubject, entryStudied } = formData;

        if (entryStudied && (!entrySubject.trim() || !entryStartTime || !entryEndTime)) {
          toast({ title: "Erro", description: "Para dias estudados, preencha matéria e horários.", variant: "destructive" });
          return;
        }
        if (entryStudied && new Date(`1970-01-01T${entryStartTime}:00`) >= new Date(`1970-01-01T${entryEndTime}:00`)) {
            toast({ title: "Erro de Horário", description: "O horário de início deve ser anterior ao de término.", variant: "destructive" });
            return;
        }

        const entryData = {
          user_id: userId,
          entry_date: entryDate,
          studied: entryStudied,
          subject: entryStudied ? entrySubject : null,
          start_time: entryStudied ? entryStartTime : null,
          end_time: entryStudied ? entryEndTime : null,
          duration_minutes: entryStudied ? Math.round((new Date(`1970-01-01T${entryEndTime}:00`) - new Date(`1970-01-01T${entryStartTime}:00`)) / (1000 * 60)) : null,
        };

        let error;
        if (editingEntry) {
          const { error: updateError } = await supabase
            .from('study_history')
            .update(entryData)
            .eq('id', editingEntry.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from('study_history')
            .insert(entryData);
          error = insertError;
        }

        if (error) {
          toast({ title: `Erro ao ${editingEntry ? 'atualizar' : 'adicionar'} registro`, description: error.message, variant: "destructive" });
        } else {
          toast({ title: `Registro ${editingEntry ? 'Atualizado' : 'Adicionado'}!`, description: `O registro para ${entryDate} foi salvo.` });
          if (entryStudied) {
            await gamificationService.addPoints(userId, 1, "Dia de estudo registrado"); 
            await gamificationService.updateStreak(userId, true); 
            
            const durationHours = entryData.duration_minutes / 60;
            if (durationHours >= 5) await gamificationService.addPoints(userId, 6, "Estudo por 5+ horas"); 
            else if (durationHours >= 3) await gamificationService.addPoints(userId, 4, "Estudo por 3+ horas"); 
            else if (durationHours >= 1) await gamificationService.addPoints(userId, 2, "Estudo por 1+ hora"); 
          } else {
            await gamificationService.updateStreak(userId, false);
          }
          await fetchHistory();
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }
      };

      const requestEditEntry = (entry) => {
        setPasswordAction(() => () => {
          setEditingEntry(entry);
          setIsEntryModalOpen(true);
        });
        setIsPasswordPromptOpen(true);
      };
      
      const requestDeleteEntry = (id) => {
        setEntryToDeleteId(id);
        setDeleteAction(() => () => {
          setPasswordAction(() => () => confirmDeleteEntry(id));
          setIsPasswordPromptOpen(true);
        });
        setIsConfirmDeleteDialogOpen(true);
      };

      const confirmDeleteEntry = async (idToDelete) => {
        if (!idToDelete || !userId) return;
        const { error } = await supabase
          .from('study_history')
          .delete()
          .eq('id', idToDelete);

        if (error) {
          toast({ title: "Erro ao remover registro", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Registro Removido", description: "O registro do histórico foi removido." });
          const resetResult = await gamificationService.resetUserGamificationStats(userId);
          if (resetResult.error) {
            toast({ title: "Erro ao zerar gamificação", description: resetResult.error.message, variant: "destructive" });
          } else {
            toast({ title: "Gamificação Zerada", description: "Seus pontos e XP foram zerados." });
          }
          await gamificationService.updateStreak(userId, false); 
          await fetchHistory();
        }
        setEntryToDeleteId(null);
      };
      
      const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setIsFilterModalOpen(false);
      };
      
      const handleClearFilters = () => {
        setFilters({ startDate: '', endDate: '', status: 'all', period: 'month' });
      };
      
      useEffect(() => {
        if(userId) fetchHistory();
      }, [filters, fetchHistory, userId]); 

      return (
        <div className="space-y-6">
          <PasswordPromptDialog
            isOpen={isPasswordPromptOpen}
            onOpenChange={setIsPasswordPromptOpen}
            onConfirm={handlePasswordConfirm}
            title="Ação Protegida"
            description="Esta ação requer senha para prosseguir."
          />
          <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onOpenChange={setIsConfirmDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            title="Confirmar Exclusão"
            description="Tem certeza que deseja excluir este registro? Esta ação também zerará seus pontos e XP."
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold">Histórico de Estudo</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
                <Filter className="mr-2 h-4 w-4" /> Filtrar
              </Button>
              <Button onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Registro
              </Button>
            </div>
          </div>

          <HistoricoEntryModal
            isOpen={isEntryModalOpen}
            onOpenChange={setIsEntryModalOpen}
            onSubmit={handleAddOrUpdateEntry}
            editingEntry={editingEntry}
          />

          <HistoricoFilterModal
            isOpen={isFilterModalOpen}
            onOpenChange={setIsFilterModalOpen}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            initialFilters={filters}
          />
          
          {loading && !userId ? (
            <div className="flex justify-center items-center h-64"><p>Carregando usuário...</p></div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
          ) : (
            <>
              <StudyHoursChart data={history} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CalendarIcon className="mr-2 h-5 w-5 text-primary"/>Registros de Atividades</CardTitle>
                  <CardDescription>Seu histórico detalhado de estudos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <HistoricoList
                    history={history}
                    onEditEntry={requestEditEntry}
                    onDeleteEntry={requestDeleteEntry}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      );
    };

    export default HistoricoPage;