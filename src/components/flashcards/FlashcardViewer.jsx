import React, { useState, useEffect, useRef } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Progress } from '@/components/ui/progress';
    import { Edit2, Trash2, RotateCcw, Check, X, Eye, Image as ImageIcon } from 'lucide-react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

    const FlashcardViewer = ({
      currentDeck,
      flashcards,
      loadingCards,
      onOpenCardModal,
      onOpenEditCardModal,
      onConfirmDeleteCard,
      onAnswerCard,
      deckStats,
      onResetDeckProgress,
      studyMode
    }) => {
      const [currentIndex, setCurrentIndex] = useState(0);
      const [isFlipped, setIsFlipped] = useState(false);
      const [showAnswerButtons, setShowAnswerButtons] = useState(false);
      const [direction, setDirection] = useState(0);
      const cardContainerRef = useRef(null);

      useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowAnswerButtons(false);
      }, [flashcards, currentDeck, studyMode]);

      const currentCard = flashcards && flashcards.length > 0 ? flashcards[currentIndex] : null;

      const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
          setShowAnswerButtons(true);
        }
      };

      const handleNextCard = (remembered) => {
        if (currentCard) {
          onAnswerCard(currentCard.id, remembered);
        }
        setDirection(1);
        setShowAnswerButtons(false);
        setIsFlipped(false);
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0); 
        }
      };
      
      const cardVariants = {
        enter: (direction) => {
          return {
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
          };
        },
        center: {
          zIndex: 1,
          x: 0,
          opacity: 1,
          scale: 1,
        },
        exit: (direction) => {
          return {
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
          };
        },
      };

      const flipVariants = {
        front: { rotateY: 0 },
        back: { rotateY: 180 },
      };

      if (loadingCards) {
        return (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        );
      }

      if (!currentDeck || !flashcards || flashcards.length === 0) {
        return (
          <Card className="text-center py-10">
            <CardHeader>
              <CardTitle className="text-2xl">Nenhum flashcard neste baralho</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Adicione alguns flashcards para começar a estudar!</CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={onOpenCardModal}>Adicionar Primeiro Flashcard</Button>
            </CardFooter>
          </Card>
        );
      }
      
      const progressValue = deckStats && deckStats.cards_total > 0 ? (deckStats.cards_reviewed / deckStats.cards_total) * 100 : 0;

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Card {currentIndex + 1} de {flashcards.length}
            </div>
            <div className="w-full sm:w-1/2">
              <Progress value={progressValue} className="w-full" />
              <div className="text-xs text-muted-foreground mt-1 text-center">
                Revisados: {deckStats?.cards_reviewed || 0}/{deckStats?.cards_total || 0} | 
                Corretos: {deckStats?.cards_correct || 0} | 
                Incorretos: {deckStats?.cards_incorrect || 0}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onResetDeckProgress}>
              <RotateCcw className="mr-2 h-4 w-4" /> Resetar Progresso
            </Button>
          </div>

          <div ref={cardContainerRef} className="relative h-[350px] sm:h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                }}
                className="absolute w-[calc(100%-2rem)] sm:w-[450px] md:w-[500px] h-[300px] sm:h-[350px] md:h-[400px]"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="relative w-full h-full cursor-pointer"
                  onClick={handleFlip}
                  style={{ transformStyle: 'preserve-3d' }}
                  initial={false}
                  animate={isFlipped ? 'back' : 'front'}
                  variants={flipVariants}
                  transition={{ duration: 0.6 }}
                >
                  {/* Frente do Card */}
                  <motion.div
                    className="absolute w-full h-full bg-card rounded-xl shadow-2xl p-6 flex flex-col justify-center items-center text-center border-2 border-primary/50"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold">{currentCard?.front_content}</p>
                    {currentCard?.image_url && !isFlipped && (
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-4 text-primary hover:text-primary/80">
                            <ImageIcon className="mr-2 h-4 w-4" /> Ver Imagem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Imagem do Flashcard</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center items-center p-4">
                            <img-replace src={currentCard.image_url} alt="Imagem do flashcard" className="max-w-full max-h-[70vh] rounded-md object-contain"/>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </motion.div>

                  {/* Verso do Card */}
                  <motion.div
                    className="absolute w-full h-full bg-card rounded-xl shadow-2xl p-6 flex flex-col justify-center items-center text-center border-2 border-secondary/50"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-lg sm:text-xl md:text-2xl">{currentCard?.back_content}</p>
                    {currentCard?.image_url && isFlipped && (
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-4 text-primary hover:text-primary/80">
                            <ImageIcon className="mr-2 h-4 w-4" /> Ver Imagem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Imagem do Flashcard</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center items-center p-4">
                            <img-replace src={currentCard.image_url} alt="Imagem do flashcard" className="max-w-full max-h-[70vh] rounded-md object-contain"/>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {currentCard?.link_url && isFlipped && (
                      <a href={currentCard.link_url} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm text-blue-500 hover:underline">
                        Saber mais...
                      </a>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {showAnswerButtons && isFlipped && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center space-x-4 mt-6"
            >
              <Button variant="destructive" size="lg" onClick={() => handleNextCard(false)} className="w-32 sm:w-40">
                <X className="mr-2 h-5 w-5" /> Não Lembrei
              </Button>
              <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white w-32 sm:w-40" size="lg" onClick={() => handleNextCard(true)}>
                <Check className="mr-2 h-5 w-5" /> Lembrei!
              </Button>
            </motion.div>
          )}
          {!showAnswerButtons && !isFlipped && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={handleFlip}>
                <Eye className="mr-2 h-4 w-4" /> Mostrar Resposta
              </Button>
            </div>
          )}

          <div className="flex justify-center space-x-2 mt-8">
            <Button variant="outline" size="sm" onClick={() => onOpenEditCardModal(currentCard)}>
              <Edit2 className="mr-2 h-4 w-4" /> Editar Card
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onConfirmDeleteCard(currentCard)}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir Card
            </Button>
          </div>
        </div>
      );
    };

    export default FlashcardViewer;