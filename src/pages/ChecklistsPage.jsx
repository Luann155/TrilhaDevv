import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Button } from '@/components/ui/button';
    import { PlusCircle, Trash2, Edit2, CheckSquare, FileText, CheckCircle, RotateCcw } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { PhaseModal } from '@/components/checklists/PhaseModal';
    import { ItemModal } from '@/components/checklists/ItemModal';
    import { ChecklistItems } from '@/components/checklists/ChecklistItems';
    import { PhaseAttachments } from '@/components/checklists/PhaseAttachments';
    import { AttachmentModal } from '@/components/checklists/AttachmentModal';
    import { Separator } from '@/components/ui/separator';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea'; 
    import PasswordPromptDialog from '@/components/PasswordPromptDialog';
    import ConfirmationDialog from '@/components/ConfirmationDialog';
    import { supabase } from '@/lib/supabaseClient';
    import { motion } from 'framer-motion';
    import { gamificationService } from '@/lib/gamificationService';

    const ChecklistsPage = () => {
      const [phases, setPhases] = useState([]);
      const [activeTab, setActiveTab] = useState('');
      
      const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
      const [phaseNameInput, setPhaseNameInput] = useState('');
      const [phaseNotesInput, setPhaseNotesInput] = useState('');
      const [editingPhase, setEditingPhase] = useState(null);

      const [isItemModalOpen, setIsItemModalOpen] = useState(false);
      const [itemNameInput, setItemNameInput] = useState('');
      const [itemLinkInput, setItemLinkInput] = useState('');
      const [editingItem, setEditingItem] = useState(null);

      const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
      const [attachmentNameInput, setAttachmentNameInput] = useState('');
      const [attachmentLinkInput, setAttachmentLinkInput] = useState('');
      const [editingAttachment, setEditingAttachment] = useState(null);

      const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
      const [passwordAction, setPasswordAction] = useState(null);

      const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
      const [deleteAction, setDeleteAction] = useState(null);
      
      const { toast } = useToast();
      const [loading, setLoading] = useState(true);
      const [userId, setUserId] = useState(null);

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserId(user.id);
          } else {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
          }
        };
        getUser();
      }, [toast]);

      const fetchPhasesAndItems = useCallback(async () => {
        if (!userId) {
          setLoading(false);
          return;
        }
        setLoading(true);

        const { data: phasesData, error: phasesError } = await supabase
          .from('checklist_phases')
          .select('*, checklist_items ( * ), checklist_attachments ( * )')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .order('created_at', { foreignTable: 'checklist_items', ascending: true })
          .order('created_at', { foreignTable: 'checklist_attachments', ascending: true });

        if (phasesError) {
          toast({ title: "Erro ao buscar fases", description: phasesError.message, variant: "destructive" });
          setPhases([]);
        } else {
          const processedPhases = phasesData.map(p => {
            const totalItems = p.checklist_items.length;
            const completedItems = p.checklist_items.filter(item => item.checked).length;
            const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            return { 
              ...p, 
              items: p.checklist_items || [],
              attachments: p.checklist_attachments || [],
              completed: p.completed || false,
              progress: progress,
            };
          });
          setPhases(processedPhases);

          if (processedPhases.length > 0 && (!activeTab || !processedPhases.find(p => p.id === activeTab))) {
            setActiveTab(processedPhases[0].id);
          } else if (processedPhases.length === 0) {
            setActiveTab('');
          }
        }
        setLoading(false);
      }, [toast, activeTab, userId]);

      useEffect(() => {
        if (userId) {
          fetchPhasesAndItems();
        }
      }, [fetchPhasesAndItems, userId]);

      const handlePasswordConfirm = () => {
        if (passwordAction) {
          passwordAction();
          setPasswordAction(null);
        }
      };

      const handleDeleteConfirm = () => {
        if (deleteAction) {
          deleteAction();
          setDeleteAction(null);
        }
      };

      const handleAddOrUpdatePhase = async () => {
        if (!phaseNameInput.trim() || !userId) {
          toast({ title: "Erro", description: "O nome da fase é obrigatório e o usuário deve estar autenticado.", variant: "destructive" });
          return;
        }

        const phaseData = { 
          user_id: userId, 
          name: phaseNameInput, 
          notes: phaseNotesInput,
          completed: editingPhase ? editingPhase.completed : false,
        };

        let error;
        if (editingPhase) {
          const { error: updateError } = await supabase
            .from('checklist_phases')
            .update(phaseData)
            .eq('id', editingPhase.id);
          error = updateError;
        } else {
          const { data: newPhaseData, error: insertError } = await supabase
            .from('checklist_phases')
            .insert(phaseData)
            .select()
            .single();
          error = insertError;
          if (!error && newPhaseData) {
            setActiveTab(newPhaseData.id);
          }
        }
        
        if (error) {
          toast({ title: `Erro ao ${editingPhase ? 'atualizar' : 'adicionar'} fase`, description: error.message, variant: "destructive" });
        } else {
          toast({ title: `Fase ${editingPhase ? 'Atualizada' : 'Adicionada'}!`, description: `Fase "${phaseNameInput}" foi ${editingPhase ? 'atualizada' : 'adicionada'}.` });
          await fetchPhasesAndItems();
          resetPhaseModal();
        }
      };

      const requestDeletePhase = (phaseId) => {
        setDeleteAction(() => () => {
          setPasswordAction(() => () => confirmDeletePhase(phaseId));
          setIsPasswordPromptOpen(true);
        });
        setIsConfirmDeleteDialogOpen(true);
      };
      
      const confirmDeletePhase = async (phaseId) => {
        const { error } = await supabase
          .from('checklist_phases')
          .delete()
          .eq('id', phaseId);

        if (error) {
          toast({ title: "Erro ao remover fase", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Fase Removida", variant: "destructive" });
          const newPhases = phases.filter(p => p.id !== phaseId);
          setPhases(newPhases);
          if (activeTab === phaseId) {
            setActiveTab(newPhases.length > 0 ? newPhases[0].id : '');
          }
        }
      };
      
      const requestEditPhase = (phase) => {
        setPasswordAction(() => () => openEditPhaseModal(phase));
        setIsPasswordPromptOpen(true);
      };

      const openEditPhaseModal = (phase) => {
        setEditingPhase(phase);
        setPhaseNameInput(phase.name);
        setPhaseNotesInput(phase.notes || '');
        setIsPhaseModalOpen(true);
      };

      const resetPhaseModal = () => {
        setIsPhaseModalOpen(false);
        setPhaseNameInput('');
        setPhaseNotesInput('');
        setEditingPhase(null);
      };

      const handleAddOrUpdateItem = async () => {
        if (!itemNameInput.trim() || !activeTab || !userId) {
          toast({ title: "Erro", description: "O nome do item é obrigatório, uma fase deve estar ativa e o usuário autenticado.", variant: "destructive" });
          return;
        }

        const itemData = {
          phase_id: activeTab,
          user_id: userId,
          label: itemNameInput,
          link: itemLinkInput,
          checked: editingItem ? editingItem.checked : false,
        };

        let error;
        if (editingItem) {
          const { error: updateError } = await supabase
            .from('checklist_items')
            .update(itemData)
            .eq('id', editingItem.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from('checklist_items')
            .insert(itemData);
          error = insertError;
        }

        if (error) {
          toast({ title: `Erro ao ${editingItem ? 'atualizar' : 'adicionar'} item`, description: error.message, variant: "destructive" });
        } else {
          toast({ title: `Item ${editingItem ? 'Atualizado' : 'Adicionado'}!`, description: `Item "${itemNameInput}" foi ${editingItem ? 'atualizado' : 'adicionado'}.` });
          await fetchPhasesAndItems();
          resetItemModal();
        }
      };

      const requestDeleteItem = (phaseId, itemId) => {
        setDeleteAction(() => () => confirmDeleteItem(phaseId, itemId));
        setIsConfirmDeleteDialogOpen(true);
      };

      const confirmDeleteItem = async (phaseId, itemId) => {
        const { error } = await supabase
          .from('checklist_items')
          .delete()
          .eq('id', itemId);

        if (error) {
          toast({ title: "Erro ao remover item", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Item Removido", variant: "destructive" });
          await fetchPhasesAndItems();
        }
      };

      const openEditItemModal = (item) => {
        setEditingItem(item);
        setItemNameInput(item.label);
        setItemLinkInput(item.link || '');
        setIsItemModalOpen(true);
      };

      const resetItemModal = () => {
        setIsItemModalOpen(false);
        setItemNameInput('');
        setItemLinkInput('');
        setEditingItem(null);
      };

      const handleCheckboxChange = async (phaseId, itemId, currentCheckedStatus) => {
        if (!userId) return;
        const newCheckedStatus = !currentCheckedStatus;
        const { error } = await supabase
          .from('checklist_items')
          .update({ checked: newCheckedStatus })
          .eq('id', itemId);

        if (error) {
          toast({ title: "Erro ao atualizar item", description: error.message, variant: "destructive" });
        } else {
          if (newCheckedStatus) { 
            await gamificationService.addPoints(userId, 1, "Item de checklist concluído");
          }
          await fetchPhasesAndItems();
        }
      };

      const handleNotesChange = async (phaseId, notes) => {
        const { error } = await supabase
          .from('checklist_phases')
          .update({ notes: notes })
          .eq('id', phaseId);
        if (error) {
          toast({ title: "Erro ao salvar anotações", description: error.message, variant: "destructive" });
        } else {
          setPhases(prevPhases => prevPhases.map(phase => 
            phase.id === phaseId ? { ...phase, notes: notes } : phase
          ));
        }
      };

      const handleTogglePhaseComplete = async (phaseId, currentCompletedStatus) => {
        if (!userId) return;
        const newCompletedStatus = !currentCompletedStatus;
        const { error } = await supabase
          .from('checklist_phases')
          .update({ completed: newCompletedStatus })
          .eq('id', phaseId);

        if (error) {
          toast({ title: "Erro ao atualizar status da fase", description: error.message, variant: "destructive" });
        } else {
          toast({ title: `Fase ${newCompletedStatus ? 'Concluída' : 'Reaberta'}!`, description: `A fase foi marcada como ${newCompletedStatus ? 'concluída' : 'pendente'}.` });
          
          if (newCompletedStatus) { 
            await gamificationService.addPoints(userId, 5, "Fase de checklist concluída");
          }
          
          await fetchPhasesAndItems();
          
          if (newCompletedStatus) { 
            const currentIndex = phases.findIndex(p => p.id === phaseId);
            if (currentIndex !== -1 && currentIndex < phases.length - 1) {
              setActiveTab(phases[currentIndex + 1].id);
            }
          }
        }
      };

      const handleAddOrUpdateAttachment = async () => {
        if (!attachmentNameInput.trim() || !attachmentLinkInput.trim() || !activeTab || !userId) {
          toast({ title: "Erro", description: "Nome, Link, fase ativa e usuário autenticado são obrigatórios.", variant: "destructive" });
          return;
        }

        const attachmentData = {
          phase_id: activeTab,
          user_id: userId,
          name: attachmentNameInput,
          link: attachmentLinkInput,
        };

        let error;
        if (editingAttachment) {
          const { error: updateError } = await supabase.from('checklist_attachments').update(attachmentData).eq('id', editingAttachment.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase.from('checklist_attachments').insert(attachmentData);
          error = insertError;
        }

        if (error) {
          toast({ title: `Erro ao ${editingAttachment ? 'atualizar' : 'adicionar'} anexo`, description: error.message, variant: "destructive" });
        } else {
          toast({ title: `Anexo ${editingAttachment ? 'Atualizado' : 'Adicionado'}!`, description: `Anexo "${attachmentNameInput}" salvo.` });
          await fetchPhasesAndItems();
          resetAttachmentModal();
        }
      };

      const openEditAttachmentModal = (attachment) => {
        setEditingAttachment(attachment);
        setAttachmentNameInput(attachment.name);
        setAttachmentLinkInput(attachment.link);
        setIsAttachmentModalOpen(true);
      };

      const requestDeleteAttachment = (attachmentId) => {
        setDeleteAction(() => () => confirmDeleteAttachment(attachmentId));
        setIsConfirmDeleteDialogOpen(true);
      };

      const confirmDeleteAttachment = async (attachmentId) => {
        const { error } = await supabase.from('checklist_attachments').delete().eq('id', attachmentId);
        if (error) {
          toast({ title: "Erro ao remover anexo", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Anexo Removido", variant: "destructive" });
          await fetchPhasesAndItems();
        }
      };

      const resetAttachmentModal = () => {
        setIsAttachmentModalOpen(false);
        setAttachmentNameInput('');
        setAttachmentLinkInput('');
        setEditingAttachment(null);
      };


      if (loading && !userId) {
        return <div className="flex justify-center items-center h-64"><p>Carregando usuário...</p></div>;
      }
      if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
      }
      
      const currentPhaseData = phases.find(p => p.id === activeTab);

      return (
        <div className="space-y-6">
          <PasswordPromptDialog
            isOpen={isPasswordPromptOpen}
            onOpenChange={setIsPasswordPromptOpen}
            onConfirm={handlePasswordConfirm}
            title="Ação Protegida"
            description="Esta ação requer senha para prosseguir."
          />
          <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onOpenChange={setIsConfirmDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold">Checklists por Fase</h1>
            <Button onClick={() => { resetPhaseModal(); setIsPhaseModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Fase
            </Button>
          </div>

          <PhaseModal
            isOpen={isPhaseModalOpen}
            onOpenChange={(isOpen) => { if(!isOpen) resetPhaseModal(); else setIsPhaseModalOpen(true);}}
            phaseName={phaseNameInput}
            setPhaseName={setPhaseNameInput}
            phaseNotes={phaseNotesInput}
            setPhaseNotes={setPhaseNotesInput}
            onSubmit={handleAddOrUpdatePhase}
            editingPhaseId={editingPhase?.id}
          />

          {phases.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center p-8">
              <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle>Nenhuma fase de checklist encontrada.</CardTitle>
              <CardDescription className="mt-2">Comece adicionando uma nova fase para organizar seus estudos!</CardDescription>
            </Card>
            </motion.div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full overflow-x-auto pb-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, phases.length)}, minmax(120px, 1fr))`}}>
                {phases.map(phase => (
                  <TabsTrigger 
                    key={phase.id} 
                    value={phase.id} 
                    className={`flex items-center gap-2 ${phase.completed ? 'text-green-500 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600' : ''}`}
                  >
                    {phase.name}
                    {phase.completed && <CheckCircle className="h-4 w-4"/>}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {currentPhaseData && (
                <TabsContent key={currentPhaseData.id} value={currentPhaseData.id} forceMount>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{duration: 0.3}}>
                  <Card className={`${currentPhaseData.completed ? 'border-green-500 bg-green-500/5' : ''}`}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <CardTitle className="text-2xl">{currentPhaseData.name}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => requestEditPhase(currentPhaseData)}>
                            <Edit2 className="mr-1 h-4 w-4" /> Editar Fase
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => requestDeletePhase(currentPhaseData.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Remover Fase
                          </Button>
                          <Button 
                            variant={currentPhaseData.completed ? "secondary" : "default"} 
                            size="sm" 
                            onClick={() => handleTogglePhaseComplete(currentPhaseData.id, currentPhaseData.completed)}
                            className={currentPhaseData.completed ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                          >
                            {currentPhaseData.completed ? <RotateCcw className="mr-1 h-4 w-4" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                            {currentPhaseData.completed ? "Reabrir Fase" : "Concluir Fase"}
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Marque os conteúdos conforme avança nos estudos. Progresso: {currentPhaseData.progress.toFixed(0)}%</CardDescription>
                       <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                        <div 
                          className={`h-2.5 rounded-full ${currentPhaseData.completed ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${currentPhaseData.progress}%` }}
                        ></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ChecklistItems
                        phaseId={currentPhaseData.id}
                        items={currentPhaseData.items}
                        onCheckboxChange={(phaseId, itemId) => {
                            const item = currentPhaseData.items.find(i => i.id === itemId);
                            if (item) handleCheckboxChange(phaseId, itemId, item.checked);
                        }}
                        onEditItem={openEditItemModal}
                        onDeleteItem={(phaseId, itemId) => requestDeleteItem(phaseId, itemId)}
                      />
                      <Button variant="outline" onClick={() => { resetItemModal(); setIsItemModalOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item à Fase
                      </Button>
                      <Separator />
                      <PhaseAttachments
                        phaseId={currentPhaseData.id}
                        attachments={currentPhaseData.attachments}
                        onEditAttachment={openEditAttachmentModal}
                        onDeleteAttachment={(attachmentId) => requestDeleteAttachment(attachmentId)}
                        onAddAttachment={() => { resetAttachmentModal(); setIsAttachmentModalOpen(true); }}
                      />
                      <Separator />
                      <div>
                        <Label htmlFor={`${currentPhaseData.id}-notes`} className="text-lg font-semibold flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          Anotações da Fase
                        </Label>
                        <Textarea
                          id={`${currentPhaseData.id}-notes`}
                          placeholder="Suas anotações, dificuldades, links úteis..."
                          value={currentPhaseData.notes || ''}
                          onChange={(e) => handleNotesChange(currentPhaseData.id, e.target.value)}
                          className="mt-2 min-h-[100px] p-3"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                </TabsContent>
              )}
            </Tabs>
          )}
          
          <ItemModal
            isOpen={isItemModalOpen}
            onOpenChange={(isOpen) => { if(!isOpen) resetItemModal(); else setIsItemModalOpen(true); }}
            itemName={itemNameInput}
            setItemName={setItemNameInput}
            itemLink={itemLinkInput}
            setItemLink={setItemLinkInput}
            onSubmit={handleAddOrUpdateItem}
            editingItemId={editingItem?.id}
            phaseName={currentPhaseData?.name}
          />
          <AttachmentModal
            isOpen={isAttachmentModalOpen}
            onOpenChange={(isOpen) => { if(!isOpen) resetAttachmentModal(); else setIsAttachmentModalOpen(true); }}
            attachmentName={attachmentNameInput}
            setAttachmentName={setAttachmentNameInput}
            attachmentLink={attachmentLinkInput}
            setAttachmentLink={setAttachmentLinkInput}
            onSubmit={handleAddOrUpdateAttachment}
            editingAttachmentId={editingAttachment?.id}
            phaseName={currentPhaseData?.name}
          />
        </div>
      );
    };

    export default ChecklistsPage;