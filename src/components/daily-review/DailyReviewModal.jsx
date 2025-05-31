
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
    import { X, PlusCircle } from 'lucide-react';

    const DailyReviewModal = ({ isOpen, onOpenChange, onSubmit, editingReview, allTags = [] }) => {
      const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
      const [subject, setSubject] = useState('');
      const [content, setContent] = useState('');
      const [tags, setTags] = useState([]);
      const [newTag, setNewTag] = useState('');
      const [isFavorite, setIsFavorite] = useState(false);

      useEffect(() => {
        if (isOpen) {
          if (editingReview) {
            setEntryDate(editingReview.entry_date);
            setSubject(editingReview.subject || '');
            setContent(editingReview.content || '');
            setTags(editingReview.tags || []);
            setIsFavorite(editingReview.is_favorite || false);
          } else {
            setEntryDate(new Date().toISOString().split('T')[0]);
            setSubject('');
            setContent('');
            setTags([]);
            setIsFavorite(false);
          }
          setNewTag('');
        }
      }, [isOpen, editingReview]);

      const handleTagAdd = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
          setTags([...tags, newTag.trim()]);
        }
        setNewTag('');
      };

      const handleTagRemove = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) {
          // Basic validation, can be expanded with useToast
          alert("O conteúdo do aprendizado é obrigatório.");
          return;
        }
        onSubmit({
          entry_date: entryDate,
          subject: subject.trim(),
          content: content.trim(),
          tags,
          is_favorite: isFavorite,
        });
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingReview ? 'Editar Registro de Estudo' : 'Novo Registro de Estudo'}</DialogTitle>
              <DialogDescription>
                Documente o que você aprendeu hoje. Isso ajudará na sua revisão futura!
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
              <div>
                <Label htmlFor="entry-date">Data do Estudo</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  className="bg-input/50"
                />
              </div>
              <div>
                <Label htmlFor="subject">Assunto / Título Principal</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Loops em Python, Conceitos de UX"
                  className="bg-input/50"
                />
              </div>
              <div>
                <Label htmlFor="content">O que você aprendeu?</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva em detalhes os conceitos, exemplos, dificuldades, etc."
                  rows={6}
                  required
                  className="bg-input/50"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags / Palavras-chave</Label>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    id="new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag (ex: Python)"
                    className="flex-grow bg-input/50"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTagAdd();}}}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleTagAdd} aria-label="Adicionar Tag">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                      {tag}
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleTagRemove(tag)} className="h-5 w-5 ml-1">
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
                {allTags.length > 0 && (
                   <div className="mt-2 text-xs text-muted-foreground">
                    Sugestões (clique para adicionar):
                    <div className="flex flex-wrap gap-1 mt-1">
                    {allTags.filter(t => !tags.includes(t)).slice(0, 5).map(tag => (
                        <Button key={tag} type="button" variant="outline" size="sm" className="text-xs" onClick={() => { if (!tags.includes(tag)) setTags([...tags, tag]);}}>
                        {tag}
                        </Button>
                    ))}
                    </div>
                </div>
                )}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is-favorite"
                  checked={isFavorite}
                  onCheckedChange={setIsFavorite}
                />
                <Label htmlFor="is-favorite">Marcar como favorito/importante</Label>
              </div>
            </form>
            <DialogFooter className="mt-auto pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" onClick={handleSubmit}>{editingReview ? 'Salvar Alterações' : 'Adicionar Registro'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default DailyReviewModal;
  