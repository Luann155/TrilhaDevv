import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

    const HistoricoEntryModal = ({
      isOpen,
      onOpenChange,
      onSubmit,
      editingEntry,
    }) => {
      const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
      const [entryStartTime, setEntryStartTime] = useState('09:00');
      const [entryEndTime, setEntryEndTime] = useState('10:30');
      const [entrySubject, setEntrySubject] = useState('');
      const [entryStudied, setEntryStudied] = useState(true);

      useEffect(() => {
        if (isOpen) {
          if (editingEntry) {
            setEntryDate(editingEntry.entry_date);
            setEntryStudied(editingEntry.studied);
            setEntrySubject(editingEntry.subject || '');
            setEntryStartTime(editingEntry.start_time || '09:00');
            setEntryEndTime(editingEntry.end_time || '10:30');
          } else {
            setEntryDate(new Date().toISOString().split('T')[0]);
            setEntryStartTime('09:00');
            setEntryEndTime('10:30');
            setEntrySubject('');
            setEntryStudied(true);
          }
        }
      }, [isOpen, editingEntry]);

      const handleSubmit = () => {
        onSubmit({
          entryDate,
          entryStartTime,
          entryEndTime,
          entrySubject,
          entryStudied,
        });
      };

      const handleClose = () => {
        onOpenChange(false);
      };

      return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Editar' : 'Adicionar'} Registro no Histórico</DialogTitle>
              <DialogDescription>
                Registre suas atividades de estudo ou dias de pausa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="entry-date-modal">Data</Label>
                <Input id="entry-date-modal" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="studied-checkbox-modal" checked={entryStudied} onChange={(e) => setEntryStudied(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                <Label htmlFor="studied-checkbox-modal">Estudei neste dia</Label>
              </div>
              {entryStudied && (
                <>
                  <div>
                    <Label htmlFor="entry-subject-modal">Matéria/Tópico</Label>
                    <Input id="entry-subject-modal" value={entrySubject} onChange={(e) => setEntrySubject(e.target.value)} placeholder="Ex: API com Node.js" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry-start-time-modal">Início</Label>
                      <Input id="entry-start-time-modal" type="time" value={entryStartTime} onChange={(e) => setEntryStartTime(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="entry-end-time-modal">Fim</Label>
                      <Input id="entry-end-time-modal" type="time" value={entryEndTime} onChange={(e) => setEntryEndTime(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmit}>{editingEntry ? 'Salvar Alterações' : 'Adicionar Registro'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default HistoricoEntryModal;