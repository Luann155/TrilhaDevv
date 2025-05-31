import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Link2, Github, Youtube, BookOpen, PlusCircle, Edit2, Trash2, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const iconMap = {
  Lightbulb: <Lightbulb className="h-5 w-5" />,
  Link2: <Link2 className="h-5 w-5" />,
  Github: <Github className="h-5 w-5" />,
  Youtube: <Youtube className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Default: <Lightbulb className="h-5 w-5" />,
};

const DicasPage = () => {
  const [resources, setResources] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceIcon, setResourceIcon] = useState('Lightbulb');
  const [editingResource, setEditingResource] = useState(null);

  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [editingSuggestion, setEditingSuggestion] = useState(null);

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: resourcesData, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (resourcesError) {
      toast({ title: "Erro ao buscar recursos", description: resourcesError.message, variant: "destructive" });
    } else {
      setResources(resourcesData);
    }

    const { data: suggestionsData, error: suggestionsError } = await supabase
      .from('project_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (suggestionsError) {
      toast({ title: "Erro ao buscar sugestões", description: suggestionsError.message, variant: "destructive" });
    } else {
      setSuggestions(suggestionsData);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = () => {
    if (deleteAction) {
      deleteAction();
      setDeleteAction(null);
    }
  };

  const handleAddOrUpdateResource = async () => {
    if (!resourceTitle.trim() || !resourceLink.trim()) {
      toast({ title: "Erro", description: "Título e Link são obrigatórios para recursos.", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const resourceData = {
      user_id: user.id,
      title: resourceTitle,
      link: resourceLink,
      description: resourceDescription,
      icon_name: resourceIcon,
    };

    let error;
    if (editingResource) {
      const { error: updateError } = await supabase.from('resources').update(resourceData).eq('id', editingResource.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('resources').insert(resourceData);
      error = insertError;
    }

    if (error) {
      toast({ title: `Erro ao ${editingResource ? 'atualizar' : 'adicionar'} recurso`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Recurso ${editingResource ? 'Atualizado' : 'Adicionado'}!`, description: `Recurso "${resourceTitle}" salvo.` });
      await fetchData();
      resetResourceModal();
    }
  };
  
  const openEditResourceModal = (resource) => {
    setEditingResource(resource);
    setResourceTitle(resource.title);
    setResourceLink(resource.link);
    setResourceDescription(resource.description || '');
    setResourceIcon(resource.icon_name || 'Lightbulb');
    setIsResourceModalOpen(true);
  };

  const requestDeleteResource = (resourceId) => {
    setDeleteAction(() => () => confirmDeleteResource(resourceId));
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteResource = async (resourceId) => {
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (error) {
      toast({ title: "Erro ao remover recurso", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Recurso Removido", variant: "destructive" });
      await fetchData();
    }
  };

  const resetResourceModal = () => {
    setIsResourceModalOpen(false);
    setResourceTitle('');
    setResourceLink('');
    setResourceDescription('');
    setResourceIcon('Lightbulb');
    setEditingResource(null);
  };


  const handleAddOrUpdateSuggestion = async () => {
    if (!suggestionText.trim()) {
      toast({ title: "Erro", description: "O texto da sugestão é obrigatório.", variant: "destructive" });
      return;
    }
     const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const suggestionData = {
      user_id: user.id,
      text: suggestionText,
    };
    
    let error;
    if (editingSuggestion) {
      const { error: updateError } = await supabase.from('project_suggestions').update(suggestionData).eq('id', editingSuggestion.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('project_suggestions').insert(suggestionData);
      error = insertError;
    }

    if (error) {
      toast({ title: `Erro ao ${editingSuggestion ? 'atualizar' : 'adicionar'} sugestão`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Sugestão ${editingSuggestion ? 'Atualizada' : 'Adicionada'}!`, description: `Sugestão de projeto salva.` });
      await fetchData();
      resetSuggestionModal();
    }
  };

  const openEditSuggestionModal = (suggestion) => {
    setEditingSuggestion(suggestion);
    setSuggestionText(suggestion.text);
    setIsSuggestionModalOpen(true);
  };

  const requestDeleteSuggestion = (suggestionId) => {
    setDeleteAction(() => () => confirmDeleteSuggestion(suggestionId));
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteSuggestion = async (suggestionId) => {
     const { error } = await supabase.from('project_suggestions').delete().eq('id', suggestionId);
    if (error) {
      toast({ title: "Erro ao remover sugestão", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sugestão Removida", variant: "destructive" });
      await fetchData();
    }
  };

  const resetSuggestionModal = () => {
    setIsSuggestionModalOpen(false);
    setSuggestionText('');
    setEditingSuggestion(null);
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Dicas e Recursos</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Recursos Úteis</CardTitle>
            <CardDescription>Links, ferramentas e artigos para impulsionar seus estudos.</CardDescription>
          </div>
          <Button onClick={() => { resetResourceModal(); setIsResourceModalOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Recurso
          </Button>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum recurso adicionado ainda.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
              {resources.map(resource => (
                <motion.div key={resource.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {iconMap[resource.icon_name] || iconMap.Default}
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditResourceModal(resource)}><Edit2 className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => requestDeleteResource(resource.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">{resource.description || "Sem descrição."}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={resource.link} target="_blank" rel="noopener noreferrer">
                        Acessar <Link2 className="ml-1 h-3 w-3"/>
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Sugestões de Projetos</CardTitle>
            <CardDescription>Ideias para praticar e construir seu portfólio.</CardDescription>
          </div>
           <Button onClick={() => { resetSuggestionModal(); setIsSuggestionModalOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Sugestão
          </Button>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma sugestão de projeto adicionada.</p>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence>
              {suggestions.map(suggestion => (
                <motion.li 
                  key={suggestion.id} 
                  layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm">{suggestion.text}</p>
                   <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSuggestionModal(suggestion)}><Edit2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => requestDeleteSuggestion(suggestion.id)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </motion.li>
              ))}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isResourceModalOpen} onOpenChange={(isOpen) => { if(!isOpen) resetResourceModal(); else setIsResourceModalOpen(true);}}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Editar Recurso' : 'Adicionar Novo Recurso'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="resource-title">Título</Label>
              <Input id="resource-title" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} placeholder="Ex: Documentação Oficial React" />
            </div>
            <div>
              <Label htmlFor="resource-link">Link</Label>
              <Input id="resource-link" value={resourceLink} onChange={(e) => setResourceLink(e.target.value)} placeholder="https://reactjs.org" />
            </div>
            <div>
              <Label htmlFor="resource-description">Descrição (Opcional)</Label>
              <Textarea id="resource-description" value={resourceDescription} onChange={(e) => setResourceDescription(e.target.value)} placeholder="Breve descrição do recurso" />
            </div>
            <div>
              <Label htmlFor="resource-icon">Ícone</Label>
              <select id="resource-icon" value={resourceIcon} onChange={(e) => setResourceIcon(e.target.value)} className="w-full p-2 border rounded-md bg-background">
                {Object.keys(iconMap).filter(key => key !== 'Default').map(iconKey => (
                  <option key={iconKey} value={iconKey}>{iconKey}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetResourceModal}>Cancelar</Button>
            <Button onClick={handleAddOrUpdateResource}>{editingResource ? 'Salvar Alterações' : 'Adicionar Recurso'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuggestionModalOpen} onOpenChange={(isOpen) => { if(!isOpen) resetSuggestionModal(); else setIsSuggestionModalOpen(true);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSuggestion ? 'Editar Sugestão' : 'Adicionar Nova Sugestão de Projeto'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="suggestion-text">Texto da Sugestão</Label>
            <Textarea id="suggestion-text" value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} placeholder="Ex: Criar um clone do Twitter com funcionalidades básicas" className="min-h-[100px]" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetSuggestionModal}>Cancelar</Button>
            <Button onClick={handleAddOrUpdateSuggestion}>{editingSuggestion ? 'Salvar Alterações' : 'Adicionar Sugestão'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DicasPage;