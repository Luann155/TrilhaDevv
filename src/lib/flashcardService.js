import { supabase } from './supabaseClient';

export const fetchFlashcardsForDeck = async (userId, deckId) => {
  if (!userId || !deckId) throw new Error("ID do usuário e ID do baralho são obrigatórios.");
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .order('created_at');
  if (error) throw error;
  return data || [];
};

export const createFlashcard = async (userId, deckId, frontContent, backContent, imageUrl, linkUrl) => {
  if (!userId || !deckId || !frontContent || !backContent) {
    throw new Error("ID do usuário, ID do baralho, frente e verso do card são obrigatórios.");
  }
  const cardData = { 
    user_id: userId, 
    deck_id: deckId, 
    front_content: frontContent, 
    back_content: backContent, 
    image_url: imageUrl || null, 
    link_url: linkUrl || null 
  };
  const { error } = await supabase.from('flashcards').insert(cardData);
  if (error) throw error;
};

export const updateFlashcard = async (userId, cardId, frontContent, backContent, imageUrl, linkUrl) => {
  if (!userId || !cardId || !frontContent || !backContent) {
    throw new Error("ID do usuário, ID do card, frente e verso são obrigatórios.");
  }
  const cardData = { 
    front_content: frontContent, 
    back_content: backContent, 
    image_url: imageUrl || null, 
    link_url: linkUrl || null,
    updated_at: new Date().toISOString() 
  };
  const { error } = await supabase.from('flashcards').update(cardData).eq('id', cardId).eq('user_id', userId);
  if (error) throw error;
};

export const deleteFlashcard = async (userId, cardId) => {
  if (!userId || !cardId) throw new Error("ID do usuário e ID do card são obrigatórios.");
  
  const { error: reviewsError } = await supabase
    .from('flashcard_reviews')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId);
  if (reviewsError) throw new Error(`Erro ao remover revisões do flashcard: ${reviewsError.message}`);

  const { error } = await supabase.from('flashcards').delete().eq('id', cardId).eq('user_id', userId);
  if (error) throw error;
};

export const fetchDeckStats = async (userId, deckId) => {
  if (!userId || !deckId) throw new Error("ID do usuário e ID do baralho são obrigatórios para buscar estatísticas.");
  const { data, error } = await supabase
    .from('flashcard_deck_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') { 
    throw error;
  }
  return data || { cards_total: 0, cards_reviewed: 0, cards_correct: 0, cards_incorrect: 0, deck_id: deckId, user_id: userId };
};

export const upsertDeckStats = async (userId, deckId, statsData) => {
  if (!userId || !deckId || !statsData) throw new Error("Dados insuficientes para atualizar/inserir estatísticas.");
  const dataToUpsert = {
    user_id: userId,
    deck_id: deckId,
    cards_total: statsData.cards_total || 0,
    cards_reviewed: statsData.cards_reviewed || 0,
    cards_correct: statsData.cards_correct || 0,
    cards_incorrect: statsData.cards_incorrect || 0,
    last_reviewed_at: statsData.last_reviewed_at || null,
  };
  const { error } = await supabase
    .from('flashcard_deck_stats')
    .upsert(dataToUpsert, { onConflict: 'user_id, deck_id' });
  if (error) throw error;
};

export const recordFlashcardReview = async (userId, cardId, deckId, remembered) => {
  if (!userId || !cardId || !deckId || typeof remembered !== 'boolean') {
    throw new Error("Dados insuficientes ou inválidos para registrar revisão.");
  }
  const reviewData = { user_id: userId, card_id: cardId, deck_id: deckId, remembered };
  const { error } = await supabase.from('flashcard_reviews').insert(reviewData);
  if (error) throw error;
};

export const resetDeckReviews = async (userId, deckId) => {
  if (!userId || !deckId) throw new Error("ID do usuário e ID do baralho são obrigatórios para resetar revisões.");
  const { error } = await supabase
    .from('flashcard_reviews')
    .delete()
    .eq('user_id', userId)
    .eq('deck_id', deckId);
  if (error) throw error;
};

export const fetchIncorrectFlashcardIds = async (userId, deckId) => {
    if (!userId || !deckId) throw new Error("ID do usuário e ID do baralho são obrigatórios.");
    const { data, error } = await supabase
        .from('flashcard_reviews')
        .select('card_id')
        .eq('user_id', userId)
        .eq('deck_id', deckId)
        .eq('remembered', false);
    if (error) throw error;
    return new Set(data.map(r => r.card_id));
};
