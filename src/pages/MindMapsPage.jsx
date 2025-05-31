import React, { useState, useEffect, useCallback, useRef } from 'react';
    import { useParams, useNavigate, Link } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { PlusCircle, Brain, ChevronLeft, Maximize, Download, Share2 } from 'lucide-react';
    import MindMapList from '@/components/mindmaps/MindMapList';
    import MindMapViewer from '@/components/mindmaps/MindMapViewer';
    import MapModal from '@/components/mindmaps/MapModal';
    import NodeModal from '@/components/mindmaps/NodeModal';
    import ConfirmationDialog from '@/components/ConfirmationDialog';
    import { 
      fetchMindMapsForUser, 
      createMindMap, 
      updateMindMap, 
      deleteMindMap,
      fetchNodesForMap,
      createNode,
      updateNode,
      updateNodePosition,
      deleteNodeRecursively
    } from '@/lib/mindMapService';

    const MindMapsPage = () => {
      const { mapId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();

      const [mindMaps, setMindMaps] = useState([]);
      const [currentMap, setCurrentMap] = useState(null);
      const [nodes, setNodes] = useState([]); 
      
      const [loadingMaps, setLoadingMaps] = useState(true);
      const [loadingNodes, setLoadingNodes] = useState(false);

      const [isMapModalOpen, setIsMapModalOpen] = useState(false);
      const [editingMap, setEditingMap] = useState(null);
      
      const [isConfirmDeleteMapOpen, setIsConfirmDeleteMapOpen] = useState(false);
      const [mapToDelete, setMapToDelete] = useState(null);

      const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
      const [editingNode, setEditingNode] = useState(null);
      const [parentNodeForNewNode, setParentNodeForNewNode] = useState(null);

      const [userId, setUserId] = useState(null);

      useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setUserId(user.id);
          else toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
        };
        getUser();
      }, [toast]);

      const loadMindMaps = useCallback(async () => {
        if (!userId) return;
        setLoadingMaps(true);
        try {
          const userMaps = await fetchMindMapsForUser(userId);
          setMindMaps(userMaps);
        } catch (error) {
          toast({ title: "Erro ao buscar mapas mentais", description: error.message, variant: "destructive" });
          setMindMaps([]);
        }
        setLoadingMaps(false);
      }, [userId, toast]);

      const loadMapNodes = useCallback(async (currentMapIdToLoad) => {
        if (!currentMapIdToLoad || !userId) return;
        setLoadingNodes(true);
        try {
          const mapNodes = await fetchNodesForMap(userId, currentMapIdToLoad);
          setNodes(mapNodes);
        } catch (error) {
          toast({ title: "Erro ao buscar nós do mapa", description: error.message, variant: "destructive" });
          setNodes([]);
        }
        setLoadingNodes(false);
      }, [userId, toast]);

      useEffect(() => {
        if (userId) loadMindMaps();
      }, [loadMindMaps, userId]);

      useEffect(() => {
        if (mapId && mindMaps.length > 0 && userId) {
          const foundMap = mindMaps.find(m => m.id === mapId);
          setCurrentMap(foundMap);
          if (foundMap) {
            loadMapNodes(mapId);
          } else if (!loadingMaps && mapId) {
            toast({ title: "Mapa Mental não encontrado", description: "O mapa que você tentou acessar não existe ou foi removido.", variant: "destructive" });
            navigate('/mapas-mentais');
          }
        } else if (!mapId) {
          setCurrentMap(null);
          setNodes([]);
        }
      }, [mapId, mindMaps, loadMapNodes, navigate, toast, loadingMaps, userId]);

      const handleMapSubmit = async (title, description) => {
        if (!title.trim() || !userId) {
          toast({ title: "Erro de Validação", description: "Título do mapa é obrigatório.", variant: "destructive" });
          return;
        }
        try {
          let newMapId = null;
          if (editingMap) {
            await updateMindMap(userId, editingMap.id, title, description);
            toast({ title: "Mapa Mental atualizado!", description: `Mapa "${title}" foi salvo.` });
          } else {
            const createdMap = await createMindMap(userId, title, description);
            newMapId = createdMap.id;
            toast({ title: "Mapa Mental criado!", description: `Mapa "${title}" foi salvo.` });
            await handleNodeSubmit(newMapId, 'Nó Raiz', null, { x: 200, y: 100}, true);
          }
          await loadMindMaps();
          setIsMapModalOpen(false);
          setEditingMap(null);
          if (newMapId && !editingMap) {
            navigate(`/mapas-mentais/${newMapId}`);
          } else if (editingMap) {
            loadMapNodes(editingMap.id);
          }
        } catch (error) {
          toast({ title: `Erro ao salvar mapa mental`, description: error.message, variant: "destructive" });
        }
      };
      
      const openEditMapModalHandler = (map) => {
        setEditingMap(map);
        setIsMapModalOpen(true);
      };
      
      const openNewMapModalHandler = () => {
        setEditingMap(null);
        setIsMapModalOpen(true);
      };

      const confirmDeleteMapHandler = async () => {
        if (!mapToDelete || !userId) return;
        try {
          await deleteMindMap(userId, mapToDelete.id);
          toast({ title: "Mapa Mental removido!", description: `O mapa "${mapToDelete.title}" foi removido.` });
          loadMindMaps();
          if (currentMap && currentMap.id === mapToDelete.id) {
            navigate('/mapas-mentais');
          }
        } catch (error) {
          toast({ title: "Erro ao remover mapa mental", description: error.message, variant: "destructive" });
        } finally {
          setMapToDelete(null);
          setIsConfirmDeleteMapOpen(false);
        }
      };

      const handleNodeSubmit = async (targetMapId = currentMap?.id, label, parentId = parentNodeForNewNode?.id, position, isRoot = false, color, imageUrl) => {
        if (!label.trim() || !userId) {
          toast({ title: "Erro de Validação", description: "Rótulo do nó é obrigatório.", variant: "destructive" });
          return;
        }
        if (!targetMapId) {
          toast({ title: "Nenhum Mapa Selecionado", description: "Selecione um mapa para adicionar o nó.", variant: "destructive" });
          return;
        }
        
        let finalPosition = position;
        if (!finalPosition) {
            if (parentNodeForNewNode && nodes.find(n => n.id === parentNodeForNewNode.id)) {
                const parentPos = nodes.find(n => n.id === parentNodeForNewNode.id);
                finalPosition = { x: (parentPos.position_x || 0) + 100, y: (parentPos.position_y || 0) + 50 + Math.random()*20-10 };
            } else {
                 finalPosition = { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 };
            }
        }
        
        try {
          if (editingNode) {
            await updateNode(userId, editingNode.id, { label, parent_node_id: parentId, color, image_url: imageUrl });
            toast({ title: "Nó atualizado!", description: `Nó "${label}" salvo.`});
          } else {
            await createNode(userId, targetMapId, label, parentId, finalPosition, color, imageUrl);
            if (!isRoot) toast({ title: "Nó adicionado!", description: `Nó "${label}" adicionado.` });
          }
          loadMapNodes(targetMapId);
          setIsNodeModalOpen(false);
          setEditingNode(null);
          setParentNodeForNewNode(null);
        } catch (error) {
          toast({ title: "Erro ao salvar nó", description: error.message, variant: "destructive" });
        }
      };
      
      const handleNodePositionUpdate = async (nodeId, newPosition) => {
        if (!userId || !currentMap) return;
        try {
          await updateNodePosition(userId, nodeId, newPosition);
          // Optimistic update for smoother UI
          setNodes(prevNodes => prevNodes.map(n => n.id === nodeId ? {...n, position_x: newPosition.x, position_y: newPosition.y} : n));
          // No toast for frequent updates like dragging
        } catch (error) {
          toast({ title: 'Erro ao salvar posição do nó', description: error.message, variant: 'destructive' });
          loadMapNodes(currentMap.id); 
        }
      };

      const handleUpdateNodeParent = async (childNodeId, parentNodeId) => {
        if (!userId || !currentMap) return;
        try {
          await updateNode(userId, childNodeId, { parent_node_id: parentNodeId });
          toast({ title: "Conexão Criada!", description: "Nó conectado como filho." });
          loadMapNodes(currentMap.id);
        } catch (error) {
          toast({ title: "Erro ao conectar nós", description: error.message, variant: "destructive" });
        }
      };
      
      const openNewNodeModalHandler = (parentNode = null) => {
        setEditingNode(null);
        setParentNodeForNewNode(parentNode);
        setIsNodeModalOpen(true);
      };

      const openEditNodeModalHandler = (node) => {
        setEditingNode(node);
        setParentNodeForNewNode(nodes.find(n => n.id === node.parent_node_id) || null);
        setIsNodeModalOpen(true);
      };

      const confirmDeleteNodeHandler = async (nodeId) => {
        if (!userId || !currentMap) return;
        try {
          await deleteNodeRecursively(userId, nodeId); 
          toast({ title: "Nó removido!" });
          loadMapNodes(currentMap.id);
        } catch (error) {
          toast({ title: "Erro ao remover nó", description: error.message, variant: "destructive" });
        }
      };

      return (
        <div className="container mx-auto p-1 sm:p-4 h-[calc(100vh-var(--header-height,60px)-0.5rem)] sm:h-[calc(100vh-var(--header-height,80px)-2rem)]">
          {mapId && currentMap ? (
            <MindMapViewer
              currentMap={currentMap}
              nodes={nodes}
              loadingNodes={loadingNodes}
              onNodePositionUpdate={handleNodePositionUpdate}
              onOpenNewNodeModal={openNewNodeModalHandler}
              onOpenEditNodeModal={openEditNodeModalHandler}
              onConfirmDeleteNode={confirmDeleteNodeHandler}
              onUpdateNodeParent={handleUpdateNodeParent}
              userId={userId}
            />
          ) : (
            <MindMapList 
              mindMaps={mindMaps}
              loadingMaps={loadingMaps}
              onOpenNewMapModal={openNewMapModalHandler}
              onOpenEditMapModal={openEditMapModalHandler}
              onConfirmDeleteMap={(map) => { setMapToDelete(map); setIsConfirmDeleteMapOpen(true); }}
            />
          )}

          <MapModal
            isOpen={isMapModalOpen}
            onOpenChange={setIsMapModalOpen}
            onSubmit={handleMapSubmit}
            editingMap={editingMap}
          />
          
          <NodeModal
            isOpen={isNodeModalOpen}
            onOpenChange={setIsNodeModalOpen}
            onSubmit={(label, color, imageUrl) => handleNodeSubmit(currentMap?.id, label, parentNodeForNewNode?.id, null, false, color, imageUrl)}
            editingNode={editingNode}
            currentMapName={currentMap?.title}
            parentNodeLabel={parentNodeForNewNode?.label}
          />

          <ConfirmationDialog
            isOpen={isConfirmDeleteMapOpen}
            onOpenChange={setIsConfirmDeleteMapOpen}
            onConfirm={confirmDeleteMapHandler}
            title="Confirmar Exclusão de Mapa Mental"
            description={`Tem certeza que deseja remover o mapa mental "${mapToDelete?.title}"? Todos os nós contidos nele também serão removidos. Esta ação não pode ser desfeita.`}
          />
        </div>
      );
    };

    export default MindMapsPage;