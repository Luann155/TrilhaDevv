import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { PlusCircle, ChevronLeft, Layers, Edit2, Trash2, ListFilter } from 'lucide-react';
    import ConfirmationDialog from '@/components/ConfirmationDialog';
    import DeckList from '@/components/flashcards/DeckList';
    import DeckModal from '@/components/flashcards/DeckModal';
    import CardModal from '@/components/flashcards/CardModal';
    import FlashcardViewer from '@/components/flashcards/FlashcardViewer';
    import { gamificationService } from '@/lib/gamificationService';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { fetchDecksForUser, createDeck, updateDeck, deleteDeck } from '@/lib/flashcardDeckService';
    import { 
      fetchFlashcardsForDeck, 
      createFlashcard, 
      updateFlashcard, 
      deleteFlashcard, 
      fetchDeckStats, 
      upsertDeckStats, 
      recordFlashcardReview, 
      resetDeckReviews,
      fetchIncorrectFlashcardIds
    } from '@/lib/flashcardService';


    const FlashcardsPage = () => {
      const { deckId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();

      const [decks, setDecks] = useState([]);
      const [currentDeck, setCurrentDeck] = useState(null);
      const [allFlashcardsInDeck, setAllFlashcardsInDeck] = useState([]);
      const [filteredFlashcards, setFilteredFlashcards] = useState([]);
      const [deckStats, setDeckStatsState] = useState(null); 
      
      const [loadingDecks, setLoadingDecks] = useState(true);
      const [loadingCards, setLoadingCards] = useState(false);

      const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
      const [editingDeck, setEditingDeck] = useState(null);

      const [isCardModalOpen, setIsCardModalOpen] = useState(false);
      const [editingCard, setEditingCard] = useState(null);

      const [isConfirmDeleteDeckOpen, setIsConfirmDeleteDeckOpen] = useState(false);
      const [deckToDelete, setDeckToDelete] = useState(null);
      const [isConfirmDeleteCardOpen, setIsConfirmDeleteCardOpen] = useState(false);
      const [cardToDelete, setCardToDelete] = useState(null);
      const [userId, setUserId] = useState(null);
      const [studyMode, setStudyMode] = useState('all'); 

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setUserId(user.id);
          else toast({ title: "Erro de Autenticação", description: "Usuário não autenticado. Por favor, faça login novamente.", variant: "destructive" });
        };
        getUser();
      }, [toast]);

      const loadDecks = useCallback(async () => {
        if (!userId) return;
        setLoadingDecks(true);
        try {
          const userDecks = await fetchDecksForUser(userId);
          setDecks(userDecks);
        } catch (error) {
          toast({ title: "Erro ao buscar baralhos", description: error.message, variant: "destructive" });
          setDecks([]);
        }
        setLoadingDecks(false);
      }, [userId, toast]);
      

      const applyCardFilter = useCallback(async (cards, mode, currentDeckForFilter) => {
        if (!currentDeckForFilter || !userId) {
          setFilteredFlashcards(cards); 
          return;
        }
        if (mode === 'all') {
            setFilteredFlashcards(cards);
            return;
        }
        if (mode === 'incorrect') {
            setLoadingCards(true);
            try {
                const incorrectIdsSet = await fetchIncorrectFlashcardIds(userId, currentDeckForFilter.id);
                const incorrectOnlyCards = cards.filter(card => incorrectIdsSet.has(card.id));
                
                if(incorrectOnlyCards.length === 0 && cards.length > 0){
                    toast({ title: "Parabéns!", description: "Você não tem cards marcados como incorretos para revisar neste baralho!"});
                    setFilteredFlashcards(cards); 
                    setStudyMode('all');
                } else {
                   setFilteredFlashcards(incorrectOnlyCards);
                }
            } catch (error) {
                toast({ title: "Erro ao buscar cards incorretos", description: error.message, variant: "destructive" });
                setFilteredFlashcards(cards);
            } finally {
                setLoadingCards(false);
            }
        }
      }, [userId, toast]);


      const loadFlashcardsAndStats = useCallback(async (currentDeckIdToLoad) => {
        if (!currentDeckIdToLoad || !userId) return;
        setLoadingCards(true);
        let fetchedCards = [];
        try {
          fetchedCards = await fetchFlashcardsForDeck(userId, currentDeckIdToLoad);
          setAllFlashcardsInDeck(fetchedCards);
          const deckForFilter = decks.find(d => d.id === currentDeckIdToLoad);
          await applyCardFilter(fetchedCards, studyMode, deckForFilter);

          const stats = await fetchDeckStats(userId, currentDeckIdToLoad);
          setDeckStatsState({ ...stats, cards_total: fetchedCards.length });

        } catch (error) {
          toast({ title: "Erro ao carregar dados do baralho", description: error.message, variant: "destructive" });
          setAllFlashcardsInDeck([]);
          setFilteredFlashcards([]);
          setDeckStatsState({ cards_total: 0, cards_reviewed: 0, cards_correct: 0, cards_incorrect: 0, deck_id: currentDeckIdToLoad, user_id: userId });
        } finally {
          setLoadingCards(false);
        }
      }, [userId, studyMode, applyCardFilter, toast, decks]);

      useEffect(() => {
        if (userId) loadDecks();
      }, [loadDecks, userId]);

      useEffect(() => {
        if (deckId && decks.length > 0 && userId) {
          const foundDeck = decks.find(d => d.id === deckId);
          setCurrentDeck(foundDeck);
          if (foundDeck) {
            loadFlashcardsAndStats(deckId);
          } else if (!loadingDecks && deckId) {
            toast({ title: "Baralho não encontrado", description: "O baralho que você tentou acessar não existe ou foi removido.", variant: "destructive" });
            navigate('/flashcards');
          }
        } else if (!deckId) {
          setCurrentDeck(null);
          setAllFlashcardsInDeck([]);
          setFilteredFlashcards([]);
          setDeckStatsState(null);
        }
      }, [deckId, decks, loadFlashcardsAndStats, navigate, toast, loadingDecks, userId]);

      useEffect(() => {
        if (allFlashcardsInDeck.length > 0 && currentDeck) {
            applyCardFilter(allFlashcardsInDeck, studyMode, currentDeck);
        }
      }, [studyMode, allFlashcardsInDeck, applyCardFilter, currentDeck]);
      
      const handleDeckSubmit = async (name, description) => {
        if (!name.trim() || !userId) {
          toast({ title: "Erro de Validação", description: "O nome do baralho é obrigatório.", variant: "destructive" });
          return;
        }
        try {
          if (editingDeck) {
            await updateDeck(userId, editingDeck.id, name, description);
            toast({ title: "Baralho atualizado!", description: `Baralho "${name}" foi salvo.` });
          } else {
            await createDeck(userId, name, description);
            toast({ title: "Baralho criado!", description: `Baralho "${name}" foi salvo.` });
          }
          loadDecks();
          setIsDeckModalOpen(false);
          setEditingDeck(null);
        } catch (error) {
          toast({ title: `Erro ao salvar baralho`, description: error.message, variant: "destructive" });
        }
      };
      
      const openEditDeckModalHandler = (deck) => {
        setEditingDeck(deck);
        setIsDeckModalOpen(true);
      };
      
      const openNewDeckModalHandler = () => {
        setEditingDeck(null);
        setIsDeckModalOpen(true);
      };

      const confirmDeleteDeckHandler = async () => {
        if (!deckToDelete || !userId) return;
        try {
          await deleteDeck(userId, deckToDelete.id);
          toast({ title: "Baralho removido!", description: `O baralho "${deckToDelete.name}" foi removido.` });
          loadDecks();
          if (currentDeck && currentDeck.id === deckToDelete.id) {
            navigate('/flashcards');
          }
        } catch (error) {
          toast({ title: "Erro ao remover baralho", description: error.message, variant: "destructive" });
        } finally {
          setDeckToDelete(null);
          setIsConfirmDeleteDeckOpen(false);
        }
      };

      const handleCardSubmit = async (front, back, image, link) => {
        if (!front.trim() || !back.trim() || !userId) {
          toast({ title: "Erro de Validação", description: "Frente e Verso do card são obrigatórios.", variant: "destructive" });
          return;
        }
        if (!currentDeck) {
          toast({ title: "Nenhum Baralho Selecionado", description: "Selecione um baralho para adicionar o card.", variant: "destructive" });
          return;
        }
        
        try {
          if (editingCard) {
            await updateFlashcard(userId, editingCard.id, front, back, image, link);
            toast({ title: "Flashcard atualizado!", description: "Suas alterações foram salvas." });
          } else {
            await createFlashcard(userId, currentDeck.id, front, back, image, link);
            toast({ title: "Flashcard criado!", description: `Adicionado ao baralho "${currentDeck.name}".` });
          }
          loadFlashcardsAndStats(currentDeck.id);
          setIsCardModalOpen(false);
          setEditingCard(null);
        } catch (error) {
          toast({ title: `Erro ao salvar flashcard`, description: error.message, variant: "destructive" });
        }
      };
      
      const openEditCardModalHandler = (card) => {
        setEditingCard(card);
        setIsCardModalOpen(true);
      };

      const openNewCardModalHandler = () => {
        setEditingCard(null);
        setIsCardModalOpen(true);
      };

      const confirmDeleteCardHandler = async () => {
        if (!cardToDelete || !userId || !currentDeck) return;
        try {
          await deleteFlashcard(userId, cardToDelete.id);
          toast({ title: "Flashcard removido!" });
          loadFlashcardsAndStats(currentDeck.id);
        } catch (error) {
          toast({ title: "Erro ao remover flashcard", description: error.message, variant: "destructive" });
        } finally {
          setCardToDelete(null);
          setIsConfirmDeleteCardOpen(false);
        }
      };

      const handleAnswerCard = async (cardId, remembered) => {
        if (!userId || !currentDeck || !deckStats) return;
    
        try {
            await recordFlashcardReview(userId, cardId, currentDeck.id, remembered);
            
            const newStatsData = {
                ...deckStats,
                cards_reviewed: (deckStats.cards_reviewed || 0) + 1,
                cards_correct: remembered ? (deckStats.cards_correct || 0) + 1 : (deckStats.cards_correct || 0),
                cards_incorrect: !remembered ? (deckStats.cards_incorrect || 0) + 1 : (deckStats.cards_incorrect || 0),
                last_reviewed_at: new Date().toISOString(),
                cards_total: allFlashcardsInDeck.length 
            };
            
            await upsertDeckStats(userId, currentDeck.id, newStatsData);
            setDeckStatsState(newStatsData);

            if (remembered) {
              await gamificationService.addPoints(userId, 1, "Flashcard acertado"); 
            }
            
            if (newStatsData.cards_reviewed > 0 && newStatsData.cards_reviewed % 10 === 0) {
              await gamificationService.addXP(userId, 5, "Revisão de 10 flashcards"); 
            }
            if (newStatsData.cards_reviewed === newStatsData.cards_total && newStatsData.cards_total > 0 && studyMode === 'all') {
              toast({title: "Baralho Concluído!", description: "Você revisou todos os cards deste baralho."});
              await gamificationService.addXP(userId, 20, "Conclusão de baralho de flashcards"); 
            } else if (studyMode === 'incorrect' && filteredFlashcards.length <= 1 && remembered) { 
               const remainingIncorrect = filteredFlashcards.filter(fc => fc.id !== cardId);
               if(remainingIncorrect.length === 0) {
                  toast({title: "Cards Incorretos Revisados!", description: "Você revisou todos os cards que havia errado!"});
                  await gamificationService.addXP(userId, 10, "Revisão de todos os flashcards errados"); 
                  setStudyMode('all'); 
               }
            }
        } catch (error) {
            toast({ title: "Erro ao processar resposta", description: error.message, variant: "destructive" });
        }
      };

      const handleResetDeckProgress = async () => {
        if (!userId || !currentDeck) return;
        try {
            await resetDeckReviews(userId, currentDeck.id);
            const resetStatsData = {
                user_id: userId,
                deck_id: currentDeck.id,
                cards_total: allFlashcardsInDeck.length,
                cards_reviewed: 0,
                cards_correct: 0,
                cards_incorrect: 0,
                last_reviewed_at: null
            };
            await upsertDeckStats(userId, currentDeck.id, resetStatsData);
            setDeckStatsState(resetStatsData);
            toast({ title: "Progresso Resetado!", description: "O progresso deste baralho foi reiniciado." });
            await loadFlashcardsAndStats(currentDeck.id); 
        } catch (error) {
            toast({ title: "Erro ao resetar progresso", description: error.message, variant: "destructive" });
        }
      };
      
      const pageTitle = deckId && currentDeck ? currentDeck.name : "Meus Baralhos de Flashcards";
      
      return (
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              {deckId && (
                <Button variant="outline" size="icon" className="mr-3" onClick={() => {navigate('/flashcards'); setStudyMode('all');}}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-3xl font-bold truncate max-w-xs sm:max-w-md md:max-w-lg">{pageTitle}</h1>
            </div>
            {deckId && currentDeck && (
                <div className="flex items-center gap-2">
                   <Select value={studyMode} onValueChange={setStudyMode}>
                        <SelectTrigger className="w-[180px]">
                            <ListFilter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Modo de Estudo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Cards</SelectItem>
                            <SelectItem value="incorrect">Apenas Errados</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={openNewCardModalHandler}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Flashcard
                    </Button>
                </div>
            )}
            {!deckId && (
                 <Button onClick={openNewDeckModalHandler}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Baralho
                </Button>
            )}
          </div>

          {deckId && currentDeck ? (
            <FlashcardViewer
              currentDeck={currentDeck}
              flashcards={filteredFlashcards}
              loadingCards={loadingCards}
              onOpenCardModal={openNewCardModalHandler}
              onOpenEditCardModal={openEditCardModalHandler}
              onConfirmDeleteCard={(card) => { setCardToDelete(card); setIsConfirmDeleteCardOpen(true); }}
              onAnswerCard={handleAnswerCard}
              deckStats={deckStats}
              onResetDeckProgress={handleResetDeckProgress}
              studyMode={studyMode}
            />
          ) : (
            <DeckList 
              decks={decks}
              loadingDecks={loadingDecks}
              onOpenDeckModal={openNewDeckModalHandler}
              onOpenEditDeckModal={openEditDeckModalHandler}
              onConfirmDeleteDeck={(deck) => { setDeckToDelete(deck); setIsConfirmDeleteDeckOpen(true); }}
            />
          )}

          <DeckModal 
            isOpen={isDeckModalOpen}
            onOpenChange={setIsDeckModalOpen}
            onSubmit={handleDeckSubmit}
            editingDeck={editingDeck}
          />
          
          <CardModal
            isOpen={isCardModalOpen}
            onOpenChange={setIsCardModalOpen}
            onSubmit={handleCardSubmit} 
            editingCard={editingCard}
            currentDeckName={currentDeck?.name}
            userId={userId}
            deckId={currentDeck?.id}
          />

          <ConfirmationDialog
            isOpen={isConfirmDeleteDeckOpen}
            onOpenChange={setIsConfirmDeleteDeckOpen}
            onConfirm={confirmDeleteDeckHandler}
            title="Confirmar Exclusão de Baralho"
            description={`Tem certeza que deseja remover o baralho "${deckToDelete?.name}"? Todos os flashcards contidos nele também serão removidos. Esta ação não pode ser desfeita.`}
          />
          <ConfirmationDialog
            isOpen={isConfirmDeleteCardOpen}
            onOpenChange={setIsConfirmDeleteCardOpen}
            onConfirm={confirmDeleteCardHandler}
            title="Confirmar Exclusão de Flashcard"
            description="Tem certeza que deseja remover este flashcard? Esta ação não pode ser desfeita."
          />
        </div>
      );
    };

    export default FlashcardsPage;