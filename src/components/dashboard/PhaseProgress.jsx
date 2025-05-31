import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PhaseProgress = ({ checklistPhases }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Progresso por Fase</CardTitle>
          <BookOpen className="h-6 w-6 text-primary"/>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklistPhases.length > 0 ? checklistPhases.map((phase) => (
            <div key={phase.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{phase.name} {phase.completed && <CheckCircle2 className="inline h-4 w-4 text-green-500 ml-1"/>}</span>
                <span className="text-sm text-muted-foreground">{phase.progress.toFixed(0)}% ({phase.completedTasks}/{phase.totalTasks})</span>
              </div>
              <Progress value={phase.progress} className="h-2.5" />
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fase de checklist cadastrada.</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PhaseProgress;