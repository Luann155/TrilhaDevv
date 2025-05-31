import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { gamificationService } from '@/lib/gamificationService';

const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

const TrilhaContext = createContext();

export const useTrilha = () => useContext(TrilhaContext);

export const TrilhaProvider = ({ children }) => {
  const [studyPlan, setStudyPlan] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(daysOfWeek[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [userId, setUserId] = useState(null);

  const [isConfirmUncheckOpen, setIsConfirmUncheckOpen] = useState(false);
  const [itemToUncheck, setItemToUncheck] = useState(null);

  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); 
  const [weeklyProgress, setWeeklyProgress] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      }
    };
    getUser();
  }, [toast]);

  const fetchStudyDataForWeek = useCallback(async (dateToShow) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const year = dateToShow.getFullYear();
    const weekNumber = getWeekNumber(dateToShow);
    const weekStartDate = getWeekStartDate(dateToShow);

    const { data: sessionsData, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStartDate.toISOString().split('T')[0] + 'T00:00:00.000Z')
      .lt('created_at', new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + 7).toISOString().split('T')[0] + 'T00:00:00.000Z');


    if (sessionsError) {
      toast({ title: "Erro ao buscar sessões da semana", description: sessionsError.message, variant: "destructive" });
      setStudyPlan({});
    } else {
      const plan = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
      sessionsData.forEach(session => {
        if (plan[session.day_of_week]) {
          plan[session.day_of_week].push({
            id: session.id,
            time: `${session.start_time.substring(0,5)} - ${session.end_time.substring(0,5)}`,
            subject: session.subject,
            completed: session.completed,
            notes: session.notes || '',
            created_at: session.created_at 
          });
        }
      });
      daysOfWeek.forEach(day => {
        if (plan[day]) {
          plan[day].sort((a, b) => a.time.localeCompare(b.time));
        }
      });
      setStudyPlan(plan);
    }

    const { data: progressData, error: progressError } = await supabase
      .from('weekly_study_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('week_number', weekNumber)
      .maybeSingle();

    if (progressError && progressError.code !== 'PGRST116') {
      toast({ title: "Erro ao buscar progresso semanal", description: progressError.message, variant: "destructive" });
      setWeeklyProgress(null);
    } else {
      setWeeklyProgress(progressData);
    }

    setLoading(false);
  }, [toast, userId]);

  useEffect(() => {
    if (userId) {
      fetchStudyDataForWeek(currentDisplayDate);
    }
    const studySessionSubscription = supabase.channel('public:study_sessions_trilha_weekly')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions' }, (payload) => fetchStudyDataForWeek(currentDisplayDate))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_study_progress'}, (payload) => fetchStudyDataForWeek(currentDisplayDate))
      .subscribe();
    
    return () => {
      supabase.removeChannel(studySessionSubscription);
    };
  }, [fetchStudyDataForWeek, userId, currentDisplayDate]);

  const resetModalForm = () => {
    setSubject('');
    setStartTime('09:00');
    setEndTime('10:30');
    setNotes('');
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleAddOrUpdateEntry = async () => {
    if (!subject.trim() || !startTime || !endTime) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios (Matéria, Início, Fim).", variant: "destructive" });
      return;
    }
    if (new Date(`1970-01-01T${startTime}:00`) >= new Date(`1970-01-01T${endTime}:00`)) {
      toast({ title: "Erro de Horário", description: "O horário de início deve ser anterior ao de término.", variant: "destructive" });
      return;
    }

    if (!userId) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    
    const sessionCreatedAt = editingEntry?.created_at ? new Date(editingEntry.created_at) : currentDisplayDate;
    const year = sessionCreatedAt.getFullYear();
    const weekNumber = getWeekNumber(sessionCreatedAt);
    const weekStartDate = getWeekStartDate(sessionCreatedAt);


    const sessionData = {
      user_id: userId,
      day_of_week: currentDay,
      start_time: startTime,
      end_time: endTime,
      subject: subject,
      notes: notes,
      completed: editingEntry ? editingEntry.completed : false,
      created_at: editingEntry?.created_at ? editingEntry.created_at : new Date().toISOString() 
    };

    let error;
    if (editingEntry) {
      const { error: updateError } = await supabase
        .from('study_sessions')
        .update(sessionData)
        .eq('id', editingEntry.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('study_sessions')
        .insert(sessionData);
      error = insertError;
    }

    if (error) {
      toast({ title: `Erro ao ${editingEntry ? 'atualizar' : 'adicionar'} sessão`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Sessão ${editingEntry ? 'Atualizada' : 'Adicionada'}!`, description: `Sua sessão de ${subject} foi ${editingEntry ? 'atualizada' : 'adicionada'}.` });
      await fetchStudyDataForWeek(currentDisplayDate); 
      resetModalForm();
    }
  };
  
  const handleEditEntry = (day, entry) => {
    setCurrentDay(day);
    const [start, end] = entry.time.split(' - ');
    setStartTime(start);
    setEndTime(end);
    setSubject(entry.subject);
    setNotes(entry.notes || '');
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (entryId) => {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', entryId);

    if (error) {
      toast({ title: "Erro ao remover sessão", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sessão Removida", description: "A sessão de estudo foi removida." });
      await fetchStudyDataForWeek(currentDisplayDate);
    }
  };

  const proceedToggleComplete = async (entryId, newCompletedStatus) => {
    if (!userId) return;
    const { error } = await supabase
     .from('study_sessions')
     .update({ completed: newCompletedStatus })
     .eq('id', entryId);

   if (error) {
     toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
   } else {
     toast({ title: "Status Atualizado!", description: `Sessão marcada como ${newCompletedStatus ? 'concluída' : 'pendente'}.` });
     if (newCompletedStatus) {
        await gamificationService.addPoints(userId, 2, "Sessão de estudo semanal concluída");
     }
     await fetchStudyDataForWeek(currentDisplayDate);
   }
   setItemToUncheck(null);
   setIsConfirmUncheckOpen(false);
 };

  const toggleComplete = (entryId, currentCompletedStatus) => {
    if (currentCompletedStatus) { 
      setItemToUncheck(entryId);
      setIsConfirmUncheckOpen(true);
    } else { 
      proceedToggleComplete(entryId, true);
    }
  };
  
  const handleOpenModalForDay = (day) => {
    setCurrentDay(day);
    resetModalForm(); 
    setIsModalOpen(true);
  };

  const changeWeek = (direction) => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  return (
    <TrilhaContext.Provider value={{
      studyPlan,
      isModalOpen, setIsModalOpen,
      currentDay, setCurrentDay,
      startTime, setStartTime,
      endTime, setEndTime,
      subject, setSubject,
      notes, setNotes,
      editingEntry, setEditingEntry,
      loading,
      daysOfWeek,
      resetModalForm,
      handleAddOrUpdateEntry,
      handleEditEntry,
      handleDeleteEntry,
      toggleComplete,
      handleOpenModalForDay,
      isConfirmUncheckOpen, setIsConfirmUncheckOpen,
      itemToUncheck,
      proceedToggleComplete,
      currentDisplayDate,
      changeWeek,
      weeklyProgress,
      fetchStudyDataForWeek,
      getWeekNumber, 
      getWeekStartDate
    }}>
      {children}
    </TrilhaContext.Provider>
  );
};
