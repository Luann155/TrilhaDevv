
import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { FileImage, Link as LinkIcon, UploadCloud } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const CardModal = ({ isOpen, onOpenChange, onSubmit, editingCard, currentDeckName, userId, deckId }) => {
      const [cardFront, setCardFront] = useState('');
      const [cardBack, setCardBack] = useState('');
      const [cardImageUrl, setCardImageUrl] = useState(''); 
      const [cardLink, setCardLink] = useState('');
      const [imageFile, setImageFile] = useState(null);
      const [uploading, setUploading] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (isOpen) { 
            if (editingCard) {
            setCardFront(editingCard.front_content);
            setCardBack(editingCard.back_content);
            setCardImageUrl(editingCard.image_url || '');
            setCardLink(editingCard.link_url || '');
            setImageFile(null); 
            } else {
            setCardFront('');
            setCardBack('');
            setCardImageUrl('');
            setCardLink('');
            setImageFile(null);
            }
        }
      }, [editingCard, isOpen]);

      const handleImageUploadInternal = async () => {
        if (!imageFile) {
            toast({ title: "Nenhum arquivo selecionado", description: "Por favor, selecione um arquivo de imagem para fazer upload.", variant: "default" });
            return null;
        }
        if (!userId || !deckId) {
          toast({ title: "Informações ausentes", description: "ID do usuário ou do baralho não encontrado. Não é possível fazer upload.", variant: "destructive" });
          return null;
        }

        setUploading(true);
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${userId}/${deckId}/${Date.now()}.${fileExtension}`;
        
        try {
            const { data, error } = await supabase.storage
              .from('flashcard_images')
              .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false, 
              });

            if (error) {
              toast({ title: "Erro no upload da imagem", description: error.message, variant: "destructive" });
              setUploading(false);
              return null;
            }
            
            const { data: publicUrlData } = supabase.storage.from('flashcard_images').getPublicUrl(data.path);
            setUploading(false);
            if (!publicUrlData || !publicUrlData.publicUrl) {
                toast({ title: "Erro ao obter URL pública", description: "A imagem foi enviada, mas não foi possível obter a URL.", variant: "destructive" });
                return null;
            }
            return publicUrlData.publicUrl;

        } catch (error) {
            toast({ title: "Exceção no upload", description: error.message, variant: "destructive" });
            setUploading(false);
            return null;
        }
      };


      const handleSubmitInternal = async () => {
        if (!cardFront.trim() || !cardBack.trim()) {
          toast({ title: "Conteúdo faltando", description: "A frente e o verso do card são obrigatórios.", variant: "destructive" });
          return;
        }

        let finalImageUrl = cardImageUrl;

        if (imageFile) {
          const uploadedUrl = await handleImageUploadInternal();
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            toast({ title: "Falha no Upload da Imagem", description: "A imagem não pôde ser enviada. O card será salvo sem imagem ou com a URL fornecida anteriormente (se houver).", variant: "destructive" });
            // Se o upload falhar, mas havia uma URL de imagem anterior, mantemos essa URL.
            // Se não havia URL anterior e o upload falhou, finalImageUrl continuará sendo a string vazia ou a URL inválida digitada.
            // O onSubmit da página principal é quem decide o que fazer com uma URL vazia/inválida.
          }
        }
        
        onSubmit(cardFront, cardBack, finalImageUrl, cardLink);
        
        if (!uploading) { 
            onOpenChange(false);
        }
      };

      const handleClose = () => {
        if (!uploading) {
          onOpenChange(false);
        } else {
          toast({ title: "Upload em progresso", description: "Aguarde o término do upload da imagem." });
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingCard ? 'Editar Flashcard' : 'Novo Flashcard'}</DialogTitle>
              {currentDeckName && <DialogDescription>Adicionando ao baralho: {currentDeckName}</DialogDescription>}
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div>
                <label htmlFor="cardFrontModal" className="block text-sm font-medium mb-1">Frente do Card (Pergunta/Termo)</label>
                <Textarea id="cardFrontModal" value={cardFront} onChange={(e) => setCardFront(e.target.value)} placeholder="Ex: O que é uma Promise?" rows={3}/>
              </div>
              <div>
                <label htmlFor="cardBackModal" className="block text-sm font-medium mb-1">Verso do Card (Resposta/Definição)</label>
                <Textarea id="cardBackModal" value={cardBack} onChange={(e) => setCardBack(e.target.value)} placeholder="Ex: Um objeto que representa a eventual conclusão (ou falha) de uma operação assíncrona..." rows={3}/>
              </div>
              <div>
                <label htmlFor="cardImageUrlModal" className="block text-sm font-medium mb-1">URL da Imagem (Opcional)</label>
                <div className="flex items-center space-x-2">
                  <FileImage className="h-5 w-5 text-muted-foreground"/>
                  <Input 
                    id="cardImageUrlModal" 
                    value={cardImageUrl} 
                    onChange={(e) => {
                        setCardImageUrl(e.target.value);
                        if (e.target.value) setImageFile(null); 
                    }} 
                    placeholder="https://exemplo.com/imagem.png" 
                    disabled={!!imageFile || uploading}
                  />
                </div>
              </div>
              <div className="text-sm text-center text-muted-foreground my-2">OU</div>
              <div>
                <label htmlFor="cardImageUpload" className="block text-sm font-medium mb-1">Upload de Imagem (Opcional)</label>
                <div className="flex items-center space-x-2">
                    <UploadCloud className="h-5 w-5 text-muted-foreground"/>
                    <Input 
                        id="cardImageUpload" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setImageFile(file);
                                setCardImageUrl(''); 
                            } else {
                                setImageFile(null);
                                if (editingCard) setCardImageUrl(editingCard.image_url || '');
                            }
                        }}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        disabled={uploading}
                    />
                </div>
                {imageFile && <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {imageFile.name}</p>}
                {uploading && <p className="text-xs text-primary mt-1 animate-pulse">Enviando imagem...</p>}
              </div>
              <div>
                <label htmlFor="cardLinkModal" className="block text-sm font-medium mb-1">URL do Link (Opcional)</label>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-muted-foreground"/>
                  <Input id="cardLinkModal" value={cardLink} onChange={(e) => setCardLink(e.target.value)} placeholder="https://exemplo.com/artigo-relacionado" disabled={uploading} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={uploading}>Cancelar</Button>
              <Button onClick={handleSubmitInternal} disabled={uploading || (!cardFront.trim() || !cardBack.trim())}>
                {uploading ? 'Enviando Imagem...' : (editingCard ? 'Salvar Alterações' : 'Criar Flashcard')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default CardModal;
