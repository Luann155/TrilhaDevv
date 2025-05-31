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

export const PhaseModal = ({ isOpen, onOpenChange, phaseName, setPhaseName, phaseNotes, setPhaseNotes, onSubmit, editingPhaseId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingPhaseId ? 'Editar Fase' : 'Adicionar Nova Fase'}</DialogTitle>
          <DialogDescription>
            {editingPhaseId ? 'Edite os detalhes desta fase.' : 'Crie uma nova fase para seu checklist.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <Label htmlFor="phase-name-modal">Nome da Fase</Label>
            <Input 
              id="phase-name-modal" 
              value={phaseName} 
              onChange={(e) => setPhaseName(e.target.value)} 
              placeholder="Ex: Fundamentos de JavaScript" 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phase-notes-modal">Anotações da Fase (Opcional)</Label>
            <Textarea 
              id="phase-notes-modal" 
              value={phaseNotes} 
              onChange={(e) => setPhaseNotes(e.target.value)} 
              placeholder="Descreva o objetivo, principais tópicos, etc."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>{editingPhaseId ? 'Salvar Alterações' : 'Adicionar Fase'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};