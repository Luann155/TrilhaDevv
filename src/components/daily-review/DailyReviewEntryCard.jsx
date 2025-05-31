
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component
    import { Star, Edit2, Trash2, CalendarDays, Tag } from 'lucide-react';
    import { motion } from 'framer-motion';

    // Temporary Badge component if not existing
    const TemporaryBadge = ({ variant = "secondary", className, children, ...props }) => (
      <span 
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          variant === "destructive" ? "bg-destructive text-destructive-foreground border-destructive" :
          variant === "outline" ? "text-foreground border-border" :
          "bg-secondary text-secondary-foreground border-secondary"
        } ${className}`}
        {...props}
      >
        {children}
      </span>
    );
    const ActualBadge = Badge || TemporaryBadge;


    const DailyReviewEntryCard = ({ review, onEdit, onDelete, onToggleFavorite, isSummaryMode }) => {
      const formattedDate = new Date(review.entry_date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });

      if (isSummaryMode) {
        return (
          <motion.div
            layout
            className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${review.is_favorite ? 'bg-yellow-400/10 border-yellow-500/30' : 'bg-card'}`}
            onClick={() => onEdit(review)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{formattedDate}</span>
                {review.is_favorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
              </div>
              <h3 className="text-md font-medium truncate flex-1 ml-2">{review.subject || "Registro Rápido"}</h3>
            </div>
             {review.tags && review.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {review.tags.slice(0,3).map(tag => (
                  <ActualBadge key={tag} variant="outline" className="text-xs">{tag}</ActualBadge>
                ))}
                {review.tags.length > 3 && <ActualBadge variant="outline" className="text-xs">...</ActualBadge>}
              </div>
            )}
          </motion.div>
        );
      }

      return (
        <motion.div layout>
          <Card className={`shadow-lg hover:shadow-xl transition-shadow ${review.is_favorite ? 'border-yellow-500/50 bg-yellow-400/5' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl md:text-2xl mb-1 flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary flex-shrink-0"/>
                    {formattedDate}
                  </CardTitle>
                  {review.subject && <CardDescription className="text-md font-semibold text-primary">{review.subject}</CardDescription>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(review.id, review.is_favorite)} className={`h-8 w-8 ${review.is_favorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`}>
                  <Star className={`h-5 w-5 ${review.is_favorite ? 'fill-current' : ''}`} />
                  <span className="sr-only">{review.is_favorite ? "Desfavoritar" : "Favoritar"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-2">
                {review.content}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t">
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                {review.tags && review.tags.length > 0 ? (
                  review.tags.map(tag => (
                    <ActualBadge key={tag} variant="secondary" className="cursor-default">{tag}</ActualBadge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Sem tags</span>
                )}
              </div>
              <div className="flex space-x-2 self-end sm:self-center">
                <Button variant="outline" size="sm" onClick={() => onEdit(review)}>
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(review.id)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remover
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default DailyReviewEntryCard;
  