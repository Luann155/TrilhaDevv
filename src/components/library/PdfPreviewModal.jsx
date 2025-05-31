import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const PdfPreviewModal = ({ isOpen, onOpenChange, previewFileUrl }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Visualizar PDF</DialogTitle>
          <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
              </Button>
          </DialogClose>
        </DialogHeader>
        {previewFileUrl ? (
          <iframe src={previewFileUrl} title="PDF Preview" className="w-full h-[calc(100%-4rem)] border-0" />
        ) : (
          <p>Carregando preview...</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewModal;