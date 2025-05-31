import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, Check, Laptop as NotebookPen } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrilha } from '@/contexts/TrilhaContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const TrilhaGrid = () => {
  const { studyPlan, loading, daysOfWeek, handleOpenModalForDay, handleEditEntry, handleDeleteEntry, toggleComplete } = useTrilha();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {daysOfWeek.map(day => (
        <motion.div 
            key={day} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: daysOfWeek.indexOf(day) * 0.05 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">{day}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleOpenModalForDay(day)} className="h-8 w-8">
                <PlusCircle className="h-5 w-5 text-primary" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[200px] flex-grow overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence>
                {studyPlan[day] && studyPlan[day].length > 0 ? (
                  studyPlan[day].map(entry => (
                    <motion.div 
                      key={entry.id} 
                      layout
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors duration-300 ${entry.completed ? 'bg-green-500/10 border-green-500/40 hover:bg-green-500/20' : 'bg-muted/50 hover:bg-muted/80'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                           <Checkbox 
                            checked={entry.completed} 
                            onCheckedChange={() => toggleComplete(entry.id, entry.completed)}
                            id={`complete-${day}-${entry.id}`}
                            className="mt-1 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-base break-words ${entry.completed ? 'line-through text-muted-foreground' : ''}`}>{entry.subject}</p>
                            <p className={`text-xs ${entry.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>{entry.time}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEditEntry(day, entry)} className="h-7 w-7">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Sessão</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)} className="h-7 w-7 text-destructive hover:text-destructive/80">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Remover Sessão</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      {entry.notes && (
                        <div className={`pl-8 pt-1 text-xs ${entry.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                          <p className="italic flex items-start gap-1">
                            <NotebookPen className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"/> 
                            <span className="break-words">{entry.notes}</span>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center pt-10">Nenhuma sessão planejada.</p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TrilhaGrid;