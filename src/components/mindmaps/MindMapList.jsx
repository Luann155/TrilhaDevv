import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { PlusCircle, Edit2, Trash2, Brain } from 'lucide-react';
    import { motion } from 'framer-motion';

    const MindMapList = ({ mindMaps, loadingMaps, onOpenNewMapModal, onOpenEditMapModal, onConfirmDeleteMap }) => {
      if (loadingMaps) {
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        );
      }

      return (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold">Meus Mapas Mentais</h1>
            <Button onClick={onOpenNewMapModal}>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Mapa
            </Button>
          </div>
          
          {mindMaps.length === 0 ? (
            <Card className="text-center py-10">
              <CardHeader>
                <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <CardTitle className="text-2xl">Nenhum mapa mental encontrado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Organize suas ideias visualmente. Crie seu primeiro mapa mental!</CardDescription>
              </CardContent>
              <CardFooter className="justify-center">
                <Button onClick={onOpenNewMapModal}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Criar Meu Primeiro Mapa
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mindMaps.map((map, index) => (
                <motion.div 
                  key={map.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-primary/10 transition-shadow duration-300 flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-xl truncate">{map.title}</CardTitle>
                      <CardDescription className="h-10 overflow-hidden text-ellipsis">{map.description || 'Sem descrição'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {/* Could show number of nodes or last modified date here */}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Button asChild variant="default" size="sm" className="flex-1 mr-2">
                        <Link to={`/mapas-mentais/${map.id}`}><Brain className="mr-2 h-4 w-4" /> Abrir Mapa</Link>
                      </Button>
                      <div className="flex">
                        <Button variant="ghost" size="icon" onClick={() => onOpenEditMapModal(map)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onConfirmDeleteMap(map)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
    };

    export default MindMapList;