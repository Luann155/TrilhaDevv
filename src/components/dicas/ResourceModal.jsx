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
import { ExternalLink, Github, Youtube, BookOpen } from 'lucide-react';

export const iconMap = {
  ExternalLink: <ExternalLink className="h-5 w-5" />,
  Github: <Github className="h-5 w-5" />,
  Youtube: <Youtube className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
};

export const ResourceModal = ({ 
  isOpen, onOpenChange, 
  title, setTitle, 
  description, setDescription, 
  link, setLink, 
  iconName, setIconName, 
  onSubmit, editingId 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Editar Recurso' : 'Adicionar Novo Recurso'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="res-title-modal">Título</Label>
            <Input id="res-title-modal" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="res-desc-modal">Descrição</Label>
            <Input id="res-desc-modal" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="res-link-modal">Link</Label>
            <Input id="res-link-modal" value={link} onChange={e => setLink(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="res-icon-modal">Ícone</Label>
            <select id="res-icon-modal" value={iconName} onChange={e => setIconName(e.target.value)} className="w-full p-2 border rounded-md bg-background">
              {Object.keys(iconMap).map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>{editingId ? 'Salvar Alterações' : 'Adicionar Recurso'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};