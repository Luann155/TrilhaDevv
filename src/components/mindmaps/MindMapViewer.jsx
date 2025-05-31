import React, { useRef, useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { PlusCircle, ChevronLeft, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import MindMapNode from './MindMapNode';
    import { motion, AnimatePresence } from 'framer-motion';

    const MindMapViewer = ({ 
      currentMap, 
      nodes, 
      loadingNodes, 
      onNodePositionUpdate,
      onOpenNewNodeModal,
      onOpenEditNodeModal,
      onConfirmDeleteNode,
      onUpdateNodeParent, 
      userId 
    }) => {
      const mapOuterContainerRef = useRef(null); 
      const mapInnerContainerRef = useRef(null); 
      const { toast } = useToast();
      const navigate = useNavigate();

      const [connectingNodes, setConnectingNodes] = useState({ from: null, to: null });
      const [isConnecting, setIsConnecting] = useState(false);
      const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
      const [mapScale, setMapScale] = useState(1);
      const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
      
      const getNodeRenderedCenter = useCallback((nodeId) => {
        const nodeData = nodes.find(n => n.id === nodeId);
        if (!nodeData) return { x: 0, y: 0 };
      
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
      
        if (nodeElement && mapInnerContainerRef.current) {
            const nodeRect = nodeElement.getBoundingClientRect();
            const innerContainerRect = mapInnerContainerRef.current.getBoundingClientRect();
            
            const scaledX = (nodeRect.left - innerContainerRect.left + (nodeRect.width / 2)) / mapScale;
            const scaledY = (nodeRect.top - innerContainerRect.top + (nodeRect.height / 2)) / mapScale;
            
            return { x: scaledX, y: scaledY };
        }
        
        return { 
            x: (nodeData.position_x || 0) + (nodeElement?.offsetWidth || 100) / 2, 
            y: (nodeData.position_y || 0) + (nodeElement?.offsetHeight || 50) / 2 
        };
      }, [nodes, mapScale]);
      
      const handleStartConnection = (originNodeId) => {
        setConnectingNodes({ from: originNodeId, to: null });
        setIsConnecting(true);
        toast({ title: "Modo de Conexão Ativado", description: "Clique no nó de destino para criar a ligação." });
      };

      const handleNodeClickForConnection = (targetNodeId) => {
        if (isConnecting && connectingNodes.from && connectingNodes.from !== targetNodeId) {
          onUpdateNodeParent(connectingNodes.from, targetNodeId); 
          setConnectingNodes({ from: null, to: null });
          setIsConnecting(false);
          toast({ title: "Conexão Criada!", description: "O primeiro nó agora é filho do segundo." });
        } else if (isConnecting && connectingNodes.from === targetNodeId) {
          toast({ title: "Ação Inválida", description: "Você não pode conectar um nó a si mesmo.", variant: "destructive" });
          setIsConnecting(false);
          setConnectingNodes({ from: null, to: null });
        }
      };

      useEffect(() => {
        const handleMouseMove = (event) => {
          if (isConnecting && mapInnerContainerRef.current) {
            const rect = mapInnerContainerRef.current.getBoundingClientRect();
            setMousePosition({ 
              x: (event.clientX - rect.left) / mapScale, 
              y: (event.clientY - rect.top) / mapScale 
            });
          }
        };
        if (isConnecting) {
          window.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }, [isConnecting, mapScale, mapPosition.x, mapPosition.y]);

      const handleCanvasClick = (e) => {
        if (isConnecting) {
          // Check if the click is directly on the inner or outer map container
          if (e.target === mapInnerContainerRef.current || e.target === mapOuterContainerRef.current) {
            setIsConnecting(false);
            setConnectingNodes({ from: null, to: null });
            toast({ title: "Modo de Conexão Desativado" });
          }
        }
      };

      const zoomIn = () => setMapScale(prev => Math.min(prev * 1.2, 3)); 
      const zoomOut = () => setMapScale(prev => Math.max(prev / 1.2, 0.3)); 
      const resetZoomAndPan = () => {
        setMapScale(1);
        setMapPosition({x:0, y:0});
      };

      const handleNodePositionUpdateInternal = (nodeId, newRawPosition) => {
        if (!mapInnerContainerRef.current) return;
    
        const innerRect = mapInnerContainerRef.current.getBoundingClientRect();
        
        const relativeX = (newRawPosition.x - innerRect.left) / mapScale;
        const relativeY = (newRawPosition.y - innerRect.top) / mapScale;
    
        onNodePositionUpdate(nodeId, { x: relativeX, y: relativeY });
      };
      
      if (!currentMap) return null;

      return (
        <div className="space-y-2 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-md border">
            <Button variant="outline" onClick={() => navigate('/mapas-mentais')} className="h-9">
              <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-center truncate max-w-[150px] sm:max-w-xs md:max-w-md">{currentMap.title}</h1>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={zoomIn} title="Aumentar Zoom"><ZoomIn className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={zoomOut} title="Diminuir Zoom"><ZoomOut className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={resetZoomAndPan} title="Resetar Zoom/Pan"><LocateFixed className="h-4 w-4"/></Button>
              <Button onClick={() => onOpenNewNodeModal(null)} size="sm" className="h-9">
                <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nó</span>
              </Button>
            </div>
          </div>

          {loadingNodes ? (
            <div className="flex-grow flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div 
                className="flex-grow relative overflow-hidden border-2 border-dashed border-primary/30 bg-muted/20 rounded-md" 
                ref={mapOuterContainerRef}
                onClick={handleCanvasClick} // Attach click listener here for canvas clicks
            >
                <motion.div 
                    ref={mapInnerContainerRef}
                    className="absolute w-full h-full origin-top-left cursor-grab active:cursor-grabbing"
                    style={{ 
                      transformOrigin: '0 0', 
                      scale: mapScale, 
                      x: mapPosition.x, 
                      y: mapPosition.y,
                    }}
                    drag 
                    onDrag={(event, info) => {
                        setMapPosition({ x: mapPosition.x + info.delta.x, y: mapPosition.y + info.delta.y });
                    }}
                    dragConstraints={{ left: -1500, right: 1500, top: -1000, bottom: 1000 }} 
                    dragMomentum={false}
                >
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ transformOrigin: '0 0' }}>
                        <AnimatePresence>
                            {nodes.map(node => {
                            if (node.parent_node_id) {
                                const parentNode = nodes.find(p => p.id === node.parent_node_id);
                                if (parentNode) {
                                const start = getNodeRenderedCenter(parentNode.id);
                                const end = getNodeRenderedCenter(node.id);
                                return (
                                    <motion.line
                                    key={`line-${parentNode.id}-${node.id}`}
                                    x1={start.x}
                                    y1={start.y}
                                    x2={end.x}
                                    y2={end.y}
                                    stroke="var(--foreground)"
                                    strokeWidth="2" 
                                    opacity={0.8}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    exit={{ opacity: 0 }}
                                    />
                                );
                                }
                            }
                            return null;
                            })}
                        </AnimatePresence>
                        {isConnecting && connectingNodes.from && (
                        <line
                            x1={getNodeRenderedCenter(connectingNodes.from).x}
                            y1={getNodeRenderedCenter(connectingNodes.from).y}
                            x2={mousePosition.x}
                            y2={mousePosition.y}
                            stroke="var(--primary)" // Solid primary color line
                            strokeWidth="2.5"
                            opacity={0.7} // Slightly transparent to differentiate
                        />
                        )}
                    </svg>

                    <AnimatePresence>
                      {nodes.map((node, index) => (
                          <MindMapNode 
                              key={node.id}
                              node={node} 
                              onUpdatePosition={handleNodePositionUpdateInternal}
                              index={index}
                              onOpenNewNodeModal={onOpenNewNodeModal}
                              onOpenEditNodeModal={onOpenEditNodeModal}
                              onConfirmDeleteNode={onConfirmDeleteNode}
                              onStartConnection={handleStartConnection}
                              mapScale={mapScale} 
                              containerRef={mapInnerContainerRef}
                              userId={userId}
                              onClick={(e) => { 
                                e.stopPropagation(); // Prevent canvas click when clicking node
                                handleNodeClickForConnection(node.id); 
                              }}
                              data-node-id={node.id}
                          />
                      ))}
                    </AnimatePresence>
                </motion.div>
            </div>
          )}
        </div>
      );
    };

    export default MindMapViewer;