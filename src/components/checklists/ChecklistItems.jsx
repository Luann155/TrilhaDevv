import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChecklistItems = ({ phaseId, items, onCheckboxChange, onEditItem, onDeleteItem }) => {
  return (
    <div className="space-y-3">
      <AnimatePresence>
      {items.map(item => (
        <motion.div 
          key={item.id} 
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
        >
          <Checkbox
            id={`${phaseId}-${item.id}`}
            checked={item.checked}
            onCheckedChange={() => onCheckboxChange(phaseId, item.id)}
          />
          <Label htmlFor={`${phaseId}-${item.id}`} className={`flex-grow ${item.checked ? "line-through text-muted-foreground" : ""}`}>
            {item.label}
          </Label>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditItem(item)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteItem(phaseId, item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>
      ))}
      </AnimatePresence>
      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nenhum item nesta fase ainda.</p>}
    </div>
  );
};