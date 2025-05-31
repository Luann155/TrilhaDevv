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

export const SuggestionModal = ({ isOpen, onOpenChange, text, setText, onSubmit, editingId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Editar Sugestão' : 'Adicionar Nova Sugestão'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="sug-text-modal">Texto da Sugestão</Label>
            <Input id="sug-text-modal" value={text} onChange={e => setText(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>{editingId ? 'Salvar Alterações' : 'Adicionar Sugestão'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};