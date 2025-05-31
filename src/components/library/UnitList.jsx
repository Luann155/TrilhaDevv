import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Edit3, Trash2 } from 'lucide-react';

const UnitList = ({ units, loading, onEditUnit, onDeleteUnit, onNavigateToUnit }) => {
  if (loading) {
    return <div className="flex justify-center items-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (units.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Nenhuma unidade encontrada ou correspondente à busca. Crie sua primeira unidade!</p>;
  }

  return (
    <motion.div key="units-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map(unit => (
          <motion.div key={unit.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card 
              className="h-full flex flex-col cursor-pointer hover:shadow-primary/20 transition-all duration-300 hover:border-primary/50"
              onClick={() => onNavigateToUnit(unit.id)}
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onNavigateToUnit(unit.id)}
            >
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-xl">{unit.title}</CardTitle>
                <FolderOpen className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{unit.description || "Nenhuma descrição para esta unidade."}</CardDescription>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEditUnit(unit); }}>
                  <Edit3 className="mr-2 h-4 w-4" /> Editar Unidade
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id); }}>
                  <Trash2 className="mr-2 h-4 w-4" /> Deletar Unidade
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UnitList;