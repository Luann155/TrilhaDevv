import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useTrilha } from '@/contexts/TrilhaContext';

const TrilhaHeader = () => {
  const { 
    daysOfWeek, 
    handleOpenModalForDay, 
    currentDisplayDate, 
    changeWeek,
    getWeekNumber,
    getWeekStartDate,
    onOpenFilterModal 
  } = useTrilha();

  const weekStartDate = getWeekStartDate(currentDisplayDate);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const formatDateRange = (start, end) => {
    const startDay = start.toLocaleDateString('pt-BR', { day: '2-digit' });
    const startMonth = start.toLocaleDateString('pt-BR', { month: 'short' });
    const endDay = end.toLocaleDateString('pt-BR', { day: '2-digit' });
    const endMonth = end.toLocaleDateString('pt-BR', { month: 'short' });

    if (start.getMonth() === end.getMonth()) {
      return `${startDay} - ${endDay} de ${startMonth.replace('.', '')}`;
    }
    return `${startDay} de ${startMonth.replace('.', '')} - ${endDay} de ${endMonth.replace('.', '')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left">Trilha de Estudos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onOpenFilterModal}>
            <Filter className="mr-2 h-4 w-4" /> Filtrar Semanas
          </Button>
          <Button onClick={() => handleOpenModalForDay(daysOfWeek[0])}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Adicionar Sessão
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 p-2 bg-muted rounded-lg">
        <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-lg font-semibold">
            Semana {getWeekNumber(currentDisplayDate)} de {currentDisplayDate.getFullYear()}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(weekStartDate, weekEndDate)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => changeWeek(1)}>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default TrilhaHeader;
