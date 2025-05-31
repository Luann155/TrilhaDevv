import React from 'react';
    import { Button } from '@/components/ui/button';
    import { CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';

    const HistoricoList = ({ history, onEditEntry, onDeleteEntry }) => {
      if (history.length === 0) {
        return <p className="text-muted-foreground text-center py-8">Nenhum registro encontrado. Adicione sua primeira atividade!</p>;
      }

      return (
        <ul className="space-y-4">
          <AnimatePresence>
            {history.map(entry => (
              <motion.li 
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${entry.studied ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {entry.studied ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> : <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                    <span className="font-semibold text-lg">{new Date(entry.entry_date + 'T00:00:00').toLocaleDateString()}</span>
                    {entry.studied && entry.subject && <span className="ml-2 text-sm text-muted-foreground truncate hidden sm:inline">- {entry.subject}</span>}
                  </div>
                  {entry.studied && entry.subject && <p className="text-sm text-muted-foreground truncate sm:hidden mb-1">{entry.subject}</p>}
                  {entry.studied && entry.start_time && entry.end_time && (
                    <p className="text-xs text-muted-foreground">{entry.start_time.substring(0,5)} - {entry.end_time.substring(0,5)} ({entry.duration_minutes ? `${entry.duration_minutes} min` : 'N/A'})</p>
                  )}
                  {!entry.studied && <p className="text-sm text-muted-foreground font-medium">Dia Não Estudado</p>}
                </div>
                <div className="flex space-x-2 self-end sm:self-center">
                  <Button variant="ghost" size="icon" onClick={() => onEditEntry(entry)} className="h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteEntry(entry.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      );
    };

    export default HistoricoList;