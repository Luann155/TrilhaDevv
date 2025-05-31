import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const UnitModal = ({ isOpen, onOpenChange, onSubmit, editingUnit }) => {
  const [unitTitle, setUnitTitle] = useState('');
  const [unitDescription, setUnitDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingUnit) {
        setUnitTitle(editingUnit.title);
        setUnitDescription(editingUnit.description || '');
      } else {
        setUnitTitle('');
        setUnitDescription('');
      }
    }
  }, [editingUnit, isOpen]);

  const handleSubmit = () => {
    if (!unitTitle.trim()) {
      // Basic validation, can be enhanced with toast notifications from parent
      console.error("O título da unidade é obrigatório.");
      return;
    }
    onSubmit({ title: unitTitle, description: unitDescription });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUnit ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          <DialogDescription>
            {editingUnit ? 'Atualize os detalhes desta unidade.' : 'Crie uma nova unidade para organizar seus arquivos.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="Título da Unidade (ex: Unidade 1 - Algoritmos)"
            value={unitTitle}
            onChange={(e) => setUnitTitle(e.target.value)}
            aria-label="Título da Unidade"
          />
          <Input
            placeholder="Descrição (opcional)"
            value={unitDescription}
            onChange={(e) => setUnitDescription(e.target.value)}
            aria-label="Descrição da Unidade"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editingUnit ? 'Salvar Alterações' : 'Criar Unidade'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnitModal;