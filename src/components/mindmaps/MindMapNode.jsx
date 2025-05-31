import React, { useState, useEffect, useRef } from 'react';
    import { motion } from 'framer-motion';
    import { Move, Edit2, Trash2, Plus, CornerDownRight } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const MindMapNode = ({ 
      node, 
      onUpdatePosition, 
      index, 
      onOpenNewNodeModal,
      onOpenEditNodeModal,
      onConfirmDeleteNode,
      onStartConnection, 
      isConnecting,
      mapScale, 
      containerRef,
      onClick
    }) => {
      const [isHovered, setIsHovered] = useState(false);
    
      const handleDragEnd = (event, info) => {
        
        const newPosition = {
          x: Math.round(info.point.x), 
          y: Math.round(info.point.y), 
        };
        onUpdatePosition(node.id, newPosition);
      };
    
      return (
        <motion.div
          layoutId={node.id}
          key={node.id}
          drag
          dragMomentum={false}
          dragConstraints={containerRef} 
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            x: node.position_x || 0, 
            y: node.position_y || 0, 
            opacity: 1, 
            scale: 1 
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.03 }}
          className="absolute p-3 bg-card rounded-lg shadow-xl cursor-grab border border-primary/70 group z-10"
          style={{ 
            backgroundColor: node.color || undefined,
            minWidth: '100px', 
            maxWidth: '250px',
          }}
          whileDrag={{ scale: 1.1, zIndex: 20, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
        >
          <div className="flex items-center space-x-2">
            <Move className="h-4 w-4 text-muted-foreground self-start" />
            <p className="font-semibold text-sm select-none break-words flex-grow">{node.label}</p>
          </div>
          
          {node.image_url && (
            <div className="mt-2">
              <img-replace src={node.image_url} alt={`Imagem para ${node.label}`} className="max-w-full h-auto rounded-md object-contain max-h-32" />
            </div>
          )}

          {isHovered && !isConnecting && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 flex space-x-1 bg-background p-1 rounded-md shadow-lg border z-30"
            >
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Adicionar nó filho" onClick={(e) => { e.stopPropagation(); onOpenNewNodeModal(node);}}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar este nó" onClick={(e) => { e.stopPropagation(); onOpenEditNodeModal(node);}}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" title="Excluir este nó" onClick={(e) => { e.stopPropagation(); onConfirmDeleteNode(node.id);}}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Conectar este nó" onClick={(e) => { e.stopPropagation(); onStartConnection(node.id);}}>
                <CornerDownRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      );
    };

    export default MindMapNode;