import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const DeckModal = ({ isOpen, onOpenChange, onSubmit, editingDeck }) => {
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  useEffect(() => {
    if (isOpen) { // Only update state if modal is open to avoid stale data issues
      if (editingDeck) {
        setDeckName(editingDeck.name);
        setDeckDescription(editingDeck.description || '');
      } else {
        setDeckName('');
        setDeckDescription('');
      }
    }
  }, [editingDeck, isOpen]);

  const handleSubmit = () => {
    onSubmit(deckName, deckDescription);
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingDeck ? 'Editar Baralho' : 'Criar Novo Baralho'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div>
            <label htmlFor="deckNameModal" className="block text-sm font-medium mb-1">Nome do Baralho</label>
            <Input id="deckNameModal" value={deckName} onChange={(e) => setDeckName(e.target.value)} placeholder="Ex: Conceitos de JavaScript" />
          </div>
          <div>
            <label htmlFor="deckDescriptionModal" className="block text-sm font-medium mb-1">Descrição (Opcional)</label>
            <Textarea id="deckDescriptionModal" value={deckDescription} onChange={(e) => setDeckDescription(e.target.value)} placeholder="Ex: Termos e definições importantes sobre JS." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editingDeck ? 'Salvar Alterações' : 'Criar Baralho'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeckModal;