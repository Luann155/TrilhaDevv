import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrilha } from '@/contexts/TrilhaContext';
import { supabase } from '@/lib/supabaseClient';

const TrilhaFilterModal = ({ isOpen, onOpenChange }) => {
  const { fetchStudyDataForWeek, currentDisplayDate, getWeekNumber } = useTrilha();
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentDisplayDate.getFullYear().toString());
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(currentDisplayDate).toString());
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchYears = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('weekly_study_progress')
        .select('year', { distinct: true })
        .eq('user_id', userId)
        .order('year', { ascending: false });
      
      if (error) {
        console.error("Error fetching years:", error);
        setAvailableYears([currentDisplayDate.getFullYear().toString()]);
      } else {
        const years = data.map(item => item.year.toString());
        if (!years.includes(currentDisplayDate.getFullYear().toString())) {
          years.push(currentDisplayDate.getFullYear().toString());
          years.sort((a, b) => parseInt(b) - parseInt(a));
        }
        setAvailableYears(years.length > 0 ? years : [currentDisplayDate.getFullYear().toString()]);
      }
    };
    fetchYears();
  }, [userId, currentDisplayDate]);

  useEffect(() => {
    const fetchWeeksForYear = async () => {
      if (!userId || !selectedYear) return;
      const { data, error } = await supabase
        .from('weekly_study_progress')
        .select('week_number', { distinct: true })
        .eq('user_id', userId)
        .eq('year', parseInt(selectedYear))
        .order('week_number', { ascending: true });

      if (error) {
        console.error("Error fetching weeks for year:", error);
        setAvailableWeeks([getWeekNumber(currentDisplayDate).toString()]);
      } else {
        const weeks = data.map(item => item.week_number.toString());
         if (selectedYear === currentDisplayDate.getFullYear().toString() && !weeks.includes(getWeekNumber(currentDisplayDate).toString())) {
          weeks.push(getWeekNumber(currentDisplayDate).toString());
          weeks.sort((a,b) => parseInt(a) - parseInt(b));
        }
        setAvailableWeeks(weeks.length > 0 ? weeks : [getWeekNumber(currentDisplayDate).toString()]);
        if (weeks.length > 0 && !weeks.includes(selectedWeek) && selectedYear === currentDisplayDate.getFullYear().toString()) {
            setSelectedWeek(getWeekNumber(currentDisplayDate).toString());
        } else if (weeks.length > 0 && !weeks.includes(selectedWeek)) {
            setSelectedWeek(weeks[0]);
        } else if (weeks.length === 0) {
            setSelectedWeek(getWeekNumber(currentDisplayDate).toString());
        }
      }
    };
    fetchWeeksForYear();
  }, [userId, selectedYear, currentDisplayDate]);


  const handleApplyFilter = () => {
    if (!selectedYear || !selectedWeek) return;
    
    const yearNum = parseInt(selectedYear);
    const weekNum = parseInt(selectedWeek);

    const firstDayOfYear = new Date(yearNum, 0, 1);
    const daysOffset = (weekNum - 1) * 7;
    let dateForWeek = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
    
    const dayOfWeek = dateForWeek.getDay();
    const diffToMonday = dateForWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    dateForWeek = new Date(dateForWeek.setDate(diffToMonday));

    fetchStudyDataForWeek(dateForWeek);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Semanas de Estudo</DialogTitle>
          <DialogDescription>
            Selecione o ano e a semana que deseja visualizar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year-select" className="text-right">
              Ano
            </Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-select" className="col-span-3">
                <SelectValue placeholder="Selecione o Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="week-select" className="text-right">
              Semana
            </Label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek} disabled={availableWeeks.length === 0}>
              <SelectTrigger id="week-select" className="col-span-3">
                <SelectValue placeholder="Selecione a Semana" />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.map(week => (
                  <SelectItem key={week} value={week}>Semana {week}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleApplyFilter}>Aplicar Filtro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrilhaFilterModal;
