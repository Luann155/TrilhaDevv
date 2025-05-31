import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExternalLink, Edit2, Trash2, Paperclip, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PhaseAttachments = ({ phaseId, attachments, onEditAttachment, onDeleteAttachment, onAddAttachment }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label htmlFor={`${phaseId}-attachments`} className="text-lg font-semibold flex items-center">
          <Paperclip className="mr-2 h-5 w-5 text-primary" />
          Links e Arquivos da Fase
        </Label>
        <Button variant="outline" size="sm" onClick={onAddAttachment}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Anexo
        </Button>
      </div>
      <div id={`${phaseId}-attachments`} className="space-y-2">
        <AnimatePresence>
          {attachments.map(attachment => (
            <motion.div
              key={attachment.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={attachment.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-grow text-sm text-primary hover:underline truncate"
                title={attachment.link}
              >
                {attachment.name}
              </a>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditAttachment(attachment)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteAttachment(attachment.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {attachments.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nenhum anexo adicionado.</p>}
      </div>
    </div>
  );
};