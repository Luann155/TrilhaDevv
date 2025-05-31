
import { supabase } from './supabaseClient';

export const fetchDecksForUser = async (userId) => {
  if (!userId) throw new Error("ID do usuário é obrigatório.");
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data || [];
};

export const createDeck = async (userId, name, description) => {
  if (!userId || !name) throw new Error("ID do usuário e nome do baralho são obrigatórios.");
  const deckData = { user_id: userId, name, description: description || null };
  const { error } = await supabase.from('flashcard_decks').insert(deckData);
  if (error) throw error;
};

export const updateDeck = async (userId, deckId, name, description) => {
  if (!userId || !deckId || !name) throw new Error("ID do usuário, ID do baralho e nome são obrigatórios.");
  const deckData = { user_id: userId, name, description: description || null, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('flashcard_decks').update(deckData).eq('id', deckId).eq('user_id', userId);
  if (error) throw error;
};

export const deleteDeck = async (userId, deckId) => {
  if (!userId || !deckId) throw new Error("ID do usuário e ID do baralho são obrigatórios.");

  // Primeiro, remover cards associados para evitar erro de chave estrangeira
  const { error: cardsError } = await supabase
    .from('flashcards')
    .delete()
    .eq('user_id', userId)
    .eq('deck_id', deckId);
  if (cardsError) throw new Error(`Erro ao remover flashcards do baralho: ${cardsError.message}`);

  // Depois, remover reviews associados
  const { error: reviewsError } = await supabase
    .from('flashcard_reviews')
    .delete()
    .eq('user_id', userId)
    .eq('deck_id', deckId);
  if (reviewsError) throw new Error(`Erro ao remover revisões do baralho: ${reviewsError.message}`);
  
  // Depois, remover estatísticas associadas
  const { error: statsError } = await supabase
    .from('flashcard_deck_stats')
    .delete()
    .eq('user_id', userId)
    .eq('deck_id', deckId);
  if (statsError) throw new Error(`Erro ao remover estatísticas do baralho: ${statsError.message}`);


  const { error: deckError } = await supabase.from('flashcard_decks').delete().eq('id', deckId).eq('user_id', userId);
  if (deckError) throw new Error(`Erro ao remover baralho: ${deckError.message}`);
};
