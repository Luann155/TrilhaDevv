import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Edit2, Trash2, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const DeckList = ({ decks, loadingDecks, onOpenDeckModal, onOpenEditDeckModal, onConfirmDeleteDeck }) => {
  if (loadingDecks) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <Card className="text-center py-10">
        <CardHeader>
          <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Nenhum baralho encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Parece que você ainda não criou nenhum baralho. Que tal começar agora?</CardDescription>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => onOpenDeckModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Meu Primeiro Baralho
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map(deck => (
        <motion.div key={deck.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-primary/10 transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-xl truncate">{deck.name}</CardTitle>
              <CardDescription className="h-10 overflow-hidden text-ellipsis">{deck.description || 'Sem descrição'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Future: show card count or progress */}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button asChild variant="default" size="sm" className="flex-1 mr-2">
                <Link to={`/flashcards/${deck.id}`}><BookOpen className="mr-2 h-4 w-4" /> Estudar</Link>
              </Button>
              <div className="flex">
                <Button variant="ghost" size="icon" onClick={() => onOpenEditDeckModal(deck)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onConfirmDeleteDeck(deck)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default DeckList;