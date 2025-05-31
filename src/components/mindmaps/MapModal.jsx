import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

    const MapModal = ({ isOpen, onOpenChange, onSubmit, editingMap }) => {
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');

      useEffect(() => {
        if (isOpen) {
            if (editingMap) {
                setTitle(editingMap.title);
                setDescription(editingMap.description || '');
            } else {
                setTitle('');
                setDescription('');
            }
        }
      }, [editingMap, isOpen]);

      const handleSubmitInternal = () => {
        onSubmit(title, description);
      };

      const handleClose = () => {
        onOpenChange(false);
      };

      return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMap ? 'Editar Mapa Mental' : 'Criar Novo Mapa Mental'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div>
                <label htmlFor="mapTitleModal" className="block text-sm font-medium mb-1">Título do Mapa</label>
                <Input id="mapTitleModal" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Estrutura do Projeto React" />
              </div>
              <div>
                <label htmlFor="mapDescriptionModal" className="block text-sm font-medium mb-1">Descrição (Opcional)</label>
                <Textarea id="mapDescriptionModal" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Detalhes sobre componentes, estado e fluxo de dados." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmitInternal} disabled={!title.trim()}>{editingMap ? 'Salvar Alterações' : 'Criar Mapa'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default MapModal;