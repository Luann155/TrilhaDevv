import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, PlusCircle, Edit3, Trash2, ExternalLink, Star, CheckCircle, Tag } from 'lucide-react';

const FileList = ({ files, loading, selectedUnit, onEditFile, onDeleteFile, onOpenLink, onToggleFileAttribute, onOpenFileModal }) => {
  if (loading) {
    return <div className="flex justify-center items-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <motion.div key="files-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onOpenFileModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Link à Unidade
        </Button>
      </div>
      {files.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum link encontrado nesta unidade ou correspondente à busca.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map(file => (
            <motion.div key={file.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="h-full flex flex-col hover:shadow-primary/20 transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="truncate flex-1" title={file.file_name}>{file.file_name}</span>
                    <Link2 className="h-5 w-5 text-primary ml-2 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {file.link_url && (
                    <a 
                      href={file.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-500 hover:text-blue-700 break-all line-clamp-2"
                      title={file.link_url}
                    >
                      {file.link_url}
                    </a>
                  )}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {file.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full flex items-center">
                          <Tag className="h-3 w-3 mr-1" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-col items-start space-y-2 pt-4 border-t">
                  <div className="flex w-full justify-between items-center">
                      <Button variant="ghost" size="sm" onClick={() => onToggleFileAttribute(file.id, 'is_favorite', file.is_favorite)} className={file.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}>
                          <Star className={`mr-1.5 h-4 w-4 ${file.is_favorite ? 'fill-current' : ''}`} /> Favorito
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onToggleFileAttribute(file.id, 'is_read', file.is_read)} className={file.is_read ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground hover:text-foreground'}>
                          <CheckCircle className="mr-1.5 h-4 w-4" /> {file.is_read ? 'Lido' : 'Marcar Lido'}
                      </Button>
                  </div>
                  <div className="flex w-full space-x-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpenLink(file.link_url)}>
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Abrir Link
                    </Button>
                  </div>
                  <div className="flex w-full space-x-2 pt-1">
                     <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEditFile(file)}>
                      <Edit3 className="mr-1.5 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => onDeleteFile(file)}>
                      <Trash2 className="mr-1.5 h-4 w-4" /> Deletar
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FileList;
