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

export const AttachmentModal = ({ isOpen, onOpenChange, attachmentName, setAttachmentName, attachmentLink, setAttachmentLink, onSubmit, editingAttachmentId, phaseName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingAttachmentId ? 'Editar Anexo' : 'Adicionar Novo Anexo'}</DialogTitle>
          <DialogDescription>
            {editingAttachmentId ? 'Edite os detalhes deste anexo.' : `Adicione um novo anexo à fase "${phaseName || ''}".`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="attachment-name-modal">Nome do Anexo/Link</Label>
            <Input id="attachment-name-modal" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} placeholder="Ex: Artigo sobre Hooks" />
          </div>
          <div>
            <Label htmlFor="attachment-link-modal">URL do Anexo/Link</Label>
            <Input id="attachment-link-modal" value={attachmentLink} onChange={(e) => setAttachmentLink(e.target.value)} placeholder="https://exemplo.com/artigo" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>{editingAttachmentId ? 'Salvar Alterações' : 'Adicionar Anexo'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};