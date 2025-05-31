import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTrilha } from '@/contexts/TrilhaContext';

const SessaoEstudoModal = () => {
  const {
    isModalOpen, setIsModalOpen,
    currentDay, setCurrentDay,
    startTime, setStartTime,
    endTime, setEndTime,
    subject, setSubject,
    notes, setNotes,
    editingEntry,
    daysOfWeek,
    resetModalForm,
    handleAddOrUpdateEntry
  } = useTrilha();

  return (
    <Dialog open={isModalOpen} onOpenChange={(isOpen) => { setIsModalOpen(isOpen); if (!isOpen) resetModalForm(); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingEntry ? 'Editar Sessão de Estudo' : 'Adicionar Sessão de Estudo'}</DialogTitle>
          <DialogDescription>
            Configure os detalhes da sua sessão de estudo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day" className="text-right">Dia</Label>
            <select 
              id="day" 
              value={currentDay} 
              onChange={(e) => setCurrentDay(e.target.value)}
              className="col-span-3 p-2 border rounded-md bg-background focus:ring-primary focus:border-primary"
            >
              {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">Início</Label>
            <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">Fim</Label>
            <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Matéria</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Fundamentos de HTML" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">Anotações</Label>
            <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Detalhes, links, dificuldades..." 
                className="col-span-3 min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setIsModalOpen(false); resetModalForm(); }}>Cancelar</Button>
          <Button onClick={handleAddOrUpdateEntry}>{editingEntry ? 'Salvar Alterações' : 'Adicionar Sessão'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessaoEstudoModal;