import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { FileImage, Palette, SmilePlus } from 'lucide-react'; // Added SmilePlus for emoji picker trigger
    // Basic emoji picker (can be replaced with a library later)
    // import EmojiPicker from 'emoji-picker-react'; // Example, not implementing full picker here

    const NodeModal = ({ isOpen, onOpenChange, onSubmit, editingNode, currentMapName, parentNodeLabel }) => {
      const [label, setLabel] = useState('');
      const [imageUrl, setImageUrl] = useState('');
      const [nodeColor, setNodeColor] = useState('#FFFFFF'); // Default white
      // const [showEmojiPicker, setShowEmojiPicker] = useState(false); // For a custom picker

      useEffect(() => {
        if (isOpen) {
            if (editingNode) {
                setLabel(editingNode.label || '');
                setImageUrl(editingNode.image_url || '');
                setNodeColor(editingNode.color || '#FFFFFF');
            } else {
                setLabel('');
                setImageUrl('');
                setNodeColor('#FFFFFF');
            }
            // setShowEmojiPicker(false);
        }
      }, [editingNode, isOpen]);

      const handleSubmitInternal = () => {
        onSubmit(label, nodeColor, imageUrl);
      };
      
      const handleClose = () => {
        onOpenChange(false);
      };

      // const onEmojiClick = (emojiObject) => {
      //   setLabel(prevLabel => prevLabel + emojiObject.emoji);
      //   setShowEmojiPicker(false);
      // };

      return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNode ? 'Editar Nó' : 'Adicionar Novo Nó'}</DialogTitle>
              {currentMapName && <DialogDescription>No mapa: {currentMapName}</DialogDescription>}
              {parentNodeLabel && !editingNode && <DialogDescription className="text-xs text-muted-foreground">Conectando a: {parentNodeLabel}</DialogDescription>}
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div>
                <label htmlFor="nodeLabelModal" className="block text-sm font-medium mb-1">Rótulo do Nó</label>
                <div className="flex items-center space-x-2">
                    <Input id="nodeLabelModal" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Componente Principal" />
                    {/* Basic Emoji "Picker" - User uses OS emoji keyboard for now */}
                    {/* <Button variant="outline" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><SmilePlus className="h-5 w-5"/></Button> */}
                </div>
                {/* {showEmojiPicker && <div className="mt-2"><EmojiPicker onEmojiClick={onEmojiClick} /></div>} */}
              </div>
              <div>
                <label htmlFor="nodeImageUrlModal" className="block text-sm font-medium mb-1">URL da Imagem (Opcional)</label>
                <div className="flex items-center space-x-2">
                  <FileImage className="h-5 w-5 text-muted-foreground"/>
                  <Input id="nodeImageUrlModal" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://exemplo.com/imagem.png" />
                </div>
              </div>
              <div>
                <label htmlFor="nodeColorModal" className="block text-sm font-medium mb-1">Cor do Nó (Opcional)</label>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-muted-foreground"/>
                  <Input id="nodeColorModal" type="color" value={nodeColor} onChange={(e) => setNodeColor(e.target.value)} className="h-10 p-1 w-full rounded-md border" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmitInternal} disabled={!label.trim()}>{editingNode ? 'Salvar Alterações' : 'Adicionar Nó'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default NodeModal;