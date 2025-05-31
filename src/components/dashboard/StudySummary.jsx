import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { CalendarClock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const StudySummary = ({ studiedDaysThisMonth, plannedDaysThisMonth, dashboardData, onSaveSetting, onSetPlannedDays }) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [nextGoalInput, setNextGoalInput] = useState(dashboardData.nextGoal || '');
  const [localPlannedDays, setLocalPlannedDays] = useState(plannedDaysThisMonth);

  const handleSaveGoal = () => {
    onSaveSetting('next_goal', nextGoalInput);
    setIsGoalModalOpen(false);
  };

  const handleSavePlannedDays = () => {
    onSetPlannedDays(localPlannedDays); 
    onSaveSetting('planned_days_month', localPlannedDays);
  };
  
  React.useEffect(() => {
    setNextGoalInput(dashboardData.nextGoal || '');
  }, [dashboardData.nextGoal]);

  React.useEffect(() => {
    setLocalPlannedDays(plannedDaysThisMonth);
  }, [plannedDaysThisMonth]);


  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Resumo de Estudos</CardTitle>
          <CalendarClock className="h-6 w-6 text-primary"/>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg">
            <span className="font-medium">Dias Estudados (Mês)</span>
            <span className="text-2xl font-bold text-primary">{studiedDaysThisMonth}</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg cursor-pointer hover:bg-muted">
                <span className="font-medium">Dias Planejados (Mês)</span>
                <span className="text-2xl font-bold text-secondary-foreground">{localPlannedDays}</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Definir Dias Planejados</DialogTitle></DialogHeader>
              <Input 
                type="number" 
                value={localPlannedDays} 
                onChange={(e) => setLocalPlannedDays(Math.max(0, Number(e.target.value)))} 
                placeholder="Número de dias"
                min="0"
              />
              <DialogFooter>
                <Button onClick={handleSavePlannedDays}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
            <DialogTrigger asChild>
               <div className="flex items-center justify-between p-3 bg-accent/60 rounded-lg text-accent-foreground border border-accent cursor-pointer hover:bg-accent/80">
                <span className="font-medium">Próxima Meta</span>
                <div className="flex items-center space-x-1">
                  <Target className="h-5 w-5 text-yellow-400" />
                  <span className="text-lg font-semibold truncate max-w-[150px]">{dashboardData.nextGoal || "Definir meta..."}</span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Definir Próxima Meta</DialogTitle></DialogHeader>
              <Textarea value={nextGoalInput} onChange={(e) => setNextGoalInput(e.target.value)} placeholder="Qual sua próxima grande conquista?" />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGoalModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveGoal}>Salvar Meta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudySummary;