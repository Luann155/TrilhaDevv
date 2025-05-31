import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Edit2, Trash2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const DailySessions = ({ dailySessions, onAddOrUpdateSession, onDeleteSession }) => {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionTask, setSessionTask] = useState('');
  const [sessionTime, setSessionTime] = useState('09:00 - 10:30');
  const [sessionStatus, setSessionStatus] = useState('pendente');
  const [editingSession, setEditingSession] = useState(null);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);


  const handleOpenModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setSessionTask(session.task);
      setSessionTime(session.time);
      setSessionStatus(session.status);
    } else {
      setEditingSession(null);
      setSessionTask('');
      setSessionTime('09:00 - 10:30');
      setSessionStatus('pendente');
    }
    setIsSessionModalOpen(true);
  };

  const handleSubmitSession = () => {
    onAddOrUpdateSession({ 
      id: editingSession ? editingSession.id : `manual-${Date.now()}`, 
      task: sessionTask, 
      time: sessionTime, 
      status: sessionStatus,
      original: false
    }, !!editingSession);
    resetSessionModal();
  };

  const resetSessionModal = () => {
    setIsSessionModalOpen(false);
    setEditingSession(null);
    setSessionTask('');
    setSessionTime('09:00 - 10:30');
    setSessionStatus('pendente');
  };

  const requestDelete = (sessionId) => {
    setDeleteAction(() => () => onDeleteSession(sessionId));
    setIsConfirmDeleteDialogOpen(true);
  };
  
  const getStatusIcon = (status) => {
    if (status === 'feito') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'pendente') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (status === 'perdido') return <XCircle className="h-5 w-5 text-red-500" />;
    return null;
  };

  const getStatusColor = (status) => {
    if (status === 'feito') return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30';
    if (status === 'pendente') return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
    if (status === 'perdido') return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="md:col-span-2 lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Sessões do Dia</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => handleOpenModal()}>
              <PlusCircle className="h-5 w-5 text-primary"/>
            </Button>
          </CardHeader>
          <CardContent>
            {dailySessions.length > 0 ? (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {dailySessions.map((session) => (
                  <li key={session.id} className={cn("flex items-center justify-between p-3 rounded-lg border", getStatusColor(session.status))}>
                    <div className="flex-1">
                      <p className="font-medium">{session.task}</p>
                      <p className="text-xs opacity-80">{session.time}</p>
                    </div>
                    {!session.original && ( 
                      <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal(session)}><Edit2 className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => requestDelete(session.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    )}
                    <div className="ml-2">{getStatusIcon(session.status)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma sessão para hoje. Adicione uma!</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingSession ? 'Editar Sessão' : 'Adicionar Sessão do Dia'}</DialogTitle>
                <DialogDescription>Configure os detalhes da sua sessão de estudo para hoje.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="session-task">Tarefa</Label>
                    <Input id="session-task" value={sessionTask} onChange={(e) => setSessionTask(e.target.value)} placeholder="Ex: Estudar Promises em JS" />
                </div>
                <div>
                    <Label htmlFor="session-time">Horário</Label>
                    <Input id="session-time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} placeholder="Ex: 14:00 - 15:30" />
                </div>
                <div>
                    <Label htmlFor="session-status">Status</Label>
                    <select id="session-status" value={sessionStatus} onChange={(e) => setSessionStatus(e.target.value)} className="w-full p-2 border rounded-md bg-background">
                        <option value="pendente">Pendente</option>
                        <option value="feito">Feito</option>
                        <option value="perdido">Perdido</option>
                    </select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={resetSessionModal}>Cancelar</Button>
                <Button onClick={handleSubmitSession}>{editingSession ? 'Salvar Alterações' : 'Adicionar Sessão'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={() => {
          if (deleteAction) deleteAction();
        }}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja remover esta sessão do dia? Esta ação não pode ser desfeita."
      />
    </>
  );
};

export default DailySessions;