import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { PlusCircle, Filter, Star, Edit3, BookOpen, CalendarDays, Search, Tag, LayoutList as ListCollapse, List, BarChart2 } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import DailyReviewModal from '@/components/daily-review/DailyReviewModal';
    import DailyReviewEntryCard from '@/components/daily-review/DailyReviewEntryCard';
    import ConfirmationDialog from '@/components/ConfirmationDialog';

    const DailyReviewPage = () => {
      const [reviews, setReviews] = useState([]);
      const [filteredReviews, setFilteredReviews] = useState([]);
      const [loading, setLoading] = useState(true);
      const [userId, setUserId] = useState(null);
      const { toast } = useToast();

      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingReview, setEditingReview] = useState(null);
      
      const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
      const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

      const [searchTerm, setSearchTerm] = useState('');
      const [selectedDate, setSelectedDate] = useState('');
      const [selectedTags, setSelectedTags] = useState([]);
      const [filterFavorites, setFilterFavorites] = useState(false);
      const [allTags, setAllTags] = useState([]);
      const [isSummaryMode, setIsSummaryMode] = useState(false);

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserId(user.id);
          } else {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
          }
        };
        getUser();
      }, [toast]);

      const fetchReviews = useCallback(async () => {
        if (!userId) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const { data, error } = await supabase
          .from('daily_reviews')
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false });

        if (error) {
          toast({ title: "Erro ao buscar revisões", description: error.message, variant: "destructive" });
          setReviews([]);
        } else {
          setReviews(data || []);
          const uniqueTags = new Set();
          (data || []).forEach(review => {
            (review.tags || []).forEach(tag => uniqueTags.add(tag));
          });
          setAllTags(Array.from(uniqueTags).sort());
        }
        setLoading(false);
      }, [userId, toast]);

      useEffect(() => {
        if (userId) {
          fetchReviews();
        }
      }, [userId, fetchReviews]);

      useEffect(() => {
        let currentReviews = [...reviews];
        if (selectedDate) {
          currentReviews = currentReviews.filter(review => review.entry_date === selectedDate);
        }
        if (searchTerm) {
          currentReviews = currentReviews.filter(review =>
            review.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.content?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (selectedTags.length > 0) {
          currentReviews = currentReviews.filter(review =>
            selectedTags.every(tag => review.tags?.includes(tag))
          );
        }
        if (filterFavorites) {
          currentReviews = currentReviews.filter(review => review.is_favorite);
        }
        setFilteredReviews(currentReviews);
      }, [reviews, searchTerm, selectedDate, selectedTags, filterFavorites]);

      const handleAddOrUpdateReview = async (formData) => {
        if (!userId) return;

        const reviewData = {
          ...formData,
          user_id: userId,
          tags: formData.tags || [],
        };

        let error;
        if (editingReview) {
          const { error: updateError } = await supabase
            .from('daily_reviews')
            .update(reviewData)
            .eq('id', editingReview.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from('daily_reviews')
            .insert(reviewData);
          error = insertError;
        }

        if (error) {
          toast({ title: `Erro ao ${editingReview ? 'atualizar' : 'adicionar'} revisão`, description: error.message, variant: "destructive" });
        } else {
          toast({ title: `Revisão ${editingReview ? 'Atualizada' : 'Adicionada'}!`, description: "Seu registro de estudo foi salvo." });
          fetchReviews();
          setIsModalOpen(false);
          setEditingReview(null);
        }
      };

      const handleEditReview = (review) => {
        setEditingReview(review);
        setIsModalOpen(true);
      };

      const handleDeleteReview = (id) => {
        setReviewToDeleteId(id);
        setIsConfirmDeleteDialogOpen(true);
      };

      const confirmDeleteReview = async () => {
        if (!reviewToDeleteId) return;
        const { error } = await supabase
          .from('daily_reviews')
          .delete()
          .eq('id', reviewToDeleteId);

        if (error) {
          toast({ title: "Erro ao remover revisão", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Revisão Removida", description: "O registro de estudo foi removido." });
          fetchReviews();
        }
        setIsConfirmDeleteDialogOpen(false);
        setReviewToDeleteId(null);
      };

      const toggleFavorite = async (reviewId, currentIsFavorite) => {
        const { error } = await supabase
          .from('daily_reviews')
          .update({ is_favorite: !currentIsFavorite })
          .eq('id', reviewId);
        
        if (error) {
          toast({ title: "Erro ao favoritar", description: error.message, variant: "destructive" });
        } else {
          fetchReviews();
        }
      };
      
      const handleTagFilterChange = (tag) => {
        setSelectedTags(prev => 
          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
      };

      const datesWithEntries = reviews.map(r => r.entry_date);
      const frequencyData = reviews.reduce((acc, review) => {
        const month = new Date(review.entry_date + 'T00:00:00').toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});


      if (loading && !userId) return <div className="flex justify-center items-center h-screen"><p>Carregando usuário...</p></div>;
      if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div></div>;

      return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 flex items-center">
              <BookOpen className="mr-3 h-10 w-10" /> Revisão Diária de Estudos
            </h1>
            <Button onClick={() => { setEditingReview(null); setIsModalOpen(true); }} size="lg" className="shadow-lg hover:shadow-primary/40 transition-shadow">
              <PlusCircle className="mr-2 h-5 w-5" /> Novo Registro
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" />Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search-term" className="flex items-center mb-1"><Search className="mr-1 h-4 w-4"/>Buscar Palavra-chave</Label>
                  <Input
                    id="search-term"
                    type="text"
                    placeholder="Ex: Python, API, Design..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date-filter" className="flex items-center mb-1"><CalendarDays className="mr-1 h-4 w-4"/>Filtrar por Data</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label className="flex items-center mb-2"><Tag className="mr-1 h-4 w-4"/>Filtrar por Tags</Label>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto p-1 rounded-md border">
                    {allTags.length > 0 ? allTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleTagFilterChange(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    )) : <p className="text-xs text-muted-foreground">Nenhuma tag encontrada.</p>}
                  </div>
                </div>
                 <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="favorite-filter"
                    checked={filterFavorites}
                    onCheckedChange={setFilterFavorites}
                  />
                  <Label htmlFor="favorite-filter" className="flex items-center"><Star className="mr-1 h-4 w-4 text-yellow-400"/>Apenas Favoritos</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="summary-mode"
                    checked={isSummaryMode}
                    onCheckedChange={setIsSummaryMode}
                  />
                  <Label htmlFor="summary-mode" className="flex items-center">
                    {isSummaryMode ? <ListCollapse className="mr-1 h-4 w-4"/> : <List className="mr-1 h-4 w-4"/>}
                    Modo Resumo
                  </Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-1 shadow-md">
              <CardHeader><CardTitle className="text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5"/>Calendário</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Destaques para dias com registros ({datesWithEntries.length} dias).
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.from(new Set(datesWithEntries)).slice(0,15).map(date => (
                    <span key={date} className="text-xs bg-primary/20 text-primary-foreground p-1 rounded">
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short'})}
                    </span>
                  ))}
                  {datesWithEntries.length > 15 && <span className="text-xs p-1">...</span>}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 shadow-md">
              <CardHeader><CardTitle className="text-lg flex items-center"><BarChart2 className="mr-2 h-5 w-5"/>Frequência de Estudo</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(frequencyData).map(([month, count]) => (
                    <div key={month} className="text-sm p-2 bg-secondary rounded">
                      <span className="font-semibold">{month}:</span> {count} {count === 1 ? 'registro' : 'registros'}
                    </div>
                  ))}
                  {Object.keys(frequencyData).length === 0 && <p className="text-sm text-muted-foreground">Sem dados para gráfico.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <AnimatePresence>
            {filteredReviews.length > 0 ? (
              <motion.div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {filteredReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <DailyReviewEntryCard
                      review={review}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                      onToggleFavorite={toggleFavorite}
                      isSummaryMode={isSummaryMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Card className="text-center p-8 shadow-md">
                  <CardContent>
                    <Edit3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">Nenhum registro encontrado.</p>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou adicione seu primeiro registro de estudo!</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <DailyReviewModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSubmit={handleAddOrUpdateReview}
            editingReview={editingReview}
            allTags={allTags}
          />

          <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onOpenChange={setIsConfirmDeleteDialogOpen}
            onConfirm={confirmDeleteReview}
            title="Confirmar Exclusão"
            description="Tem certeza que deseja excluir este registro de revisão? Esta ação não pode ser desfeita."
          />
        </div>
      );
    };

    export default DailyReviewPage;