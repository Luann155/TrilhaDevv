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

export const ItemModal = ({ isOpen, onOpenChange, itemName, setItemName, itemLink, setItemLink, onSubmit, editingItemId, phaseName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingItemId ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
          <DialogDescription>
            {editingItemId ? 'Edite os detalhes deste item.' : `Adicione um novo item à fase "${phaseName || ''}".`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="item-name-modal">Nome do Item</Label>
            <Input id="item-name-modal" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Ex: Componentes e Props" />
          </div>
          <div>
            <Label htmlFor="item-link-modal">Link de Referência (Opcional)</Label>
            <Input id="item-link-modal" value={itemLink} onChange={(e) => setItemLink(e.target.value)} placeholder="https://exemplo.com/recurso" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>{editingItemId ? 'Salvar Alterações' : 'Adicionar Item'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};