import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const FileModal = ({ isOpen, onOpenChange, onSubmit, editingFile, selectedUnit }) => {
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTags, setLinkTags] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editingFile) {
        setLinkName(editingFile.file_name || '');
        setLinkUrl(editingFile.link_url || '');
        setLinkTags(editingFile.tags ? editingFile.tags.join(', ') : '');
      } else {
        setLinkName('');
        setLinkUrl('');
        setLinkTags('');
      }
    }
  }, [editingFile, isOpen]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  };

  const handleSubmit = async () => {
    if (!selectedUnit && !editingFile?.unit_id) {
      toast({ title: "Erro", description: "Nenhuma unidade selecionada.", variant: "destructive" });
      return;
    }
    if (!linkName.trim()) {
      toast({ title: "Erro", description: "O nome do link é obrigatório.", variant: "destructive" });
      return;
    }
    if (!linkUrl.trim()) {
      toast({ title: "Erro", description: "A URL do link é obrigatória.", variant: "destructive" });
      return;
    }
    if (!isValidUrl(linkUrl)) {
      toast({ title: "URL Inválida", description: "Por favor, insira uma URL válida (ex: https://exemplo.com).", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const tagsArray = linkTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const success = await onSubmit({ 
      fileName: linkName, // Mantendo 'fileName' para consistência com a prop onSubmit que espera isso
      linkUrl: linkUrl, 
      tagsArray 
    });
    
    setProcessing(false);
    if (success) {
      onOpenChange(false); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingFile ? 'Editar Link' : 'Adicionar Link'}</DialogTitle>
          <DialogDescription>
            {editingFile ? 'Atualize os detalhes deste link.' : `Adicione um novo link para a unidade "${selectedUnit?.title}".`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="Nome/Título do Link (ex: Documentação Oficial React)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            aria-label="Nome do Link"
          />
          <Input
            placeholder="URL do Link (ex: https://react.dev)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            aria-label="URL do Link"
            type="url"
          />
          <Input
            placeholder="Tags (separadas por vírgula, ex: Documentação, Tutorial)"
            value={linkTags}
            onChange={(e) => setLinkTags(e.target.value)}
            aria-label="Tags do Link"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={processing || !linkName.trim() || !linkUrl.trim()}>
            {processing ? (editingFile ? 'Salvando...' : 'Adicionando...') : (editingFile ? 'Salvar Alterações' : 'Adicionar Link')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileModal;