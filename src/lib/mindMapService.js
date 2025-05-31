import { supabase } from './supabaseClient';

// Mind Maps CRUD
export const fetchMindMapsForUser = async (userId) => {
  if (!userId) throw new Error("ID do usuário é obrigatório.");
  const { data, error } = await supabase
    .from('mind_maps')
    .select('*')
    .eq('user_id', userId)
    .order('title');
  if (error) throw error;
  return data || [];
};

export const createMindMap = async (userId, title, description) => {
  if (!userId || !title) throw new Error("ID do usuário e título do mapa são obrigatórios.");
  const mapData = { user_id: userId, title, description: description || null };
  const { data, error } = await supabase.from('mind_maps').insert(mapData).select().single();
  if (error) throw error;
  return data;
};

export const updateMindMap = async (userId, mapId, title, description) => {
  if (!userId || !mapId || !title) throw new Error("ID do usuário, ID do mapa e título são obrigatórios.");
  const mapData = { title, description: description || null, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('mind_maps').update(mapData).eq('id', mapId).eq('user_id', userId);
  if (error) throw error;
};

export const deleteMindMap = async (userId, mapId) => {
  if (!userId || !mapId) throw new Error("ID do usuário e ID do mapa são obrigatórios.");

  const { error: nodesError } = await supabase
    .from('mind_map_nodes')
    .delete()
    .eq('user_id', userId)
    .eq('map_id', mapId);
  if (nodesError) throw new Error(`Erro ao remover nós do mapa: ${nodesError.message}`);

  const { error: mapError } = await supabase.from('mind_maps').delete().eq('id', mapId).eq('user_id', userId);
  if (mapError) throw new Error(`Erro ao remover mapa mental: ${mapError.message}`);
};


// Mind Map Nodes CRUD
export const fetchNodesForMap = async (userId, mapId) => {
  if (!userId || !mapId) throw new Error("ID do usuário e ID do mapa são obrigatórios para buscar nós.");
  const { data, error } = await supabase
    .from('mind_map_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('map_id', mapId)
    .order('created_at');
  if (error) throw error;
  return data || [];
};

export const createNode = async (userId, mapId, label, parentNodeId = null, position = { x: 50, y: 50 }, color = '#FFFFFF', imageUrl = null) => {
  if (!userId || !mapId || !label) {
    throw new Error("ID do usuário, ID do mapa e rótulo do nó são obrigatórios.");
  }
  const nodeData = { 
    user_id: userId, 
    map_id: mapId, 
    label, 
    parent_node_id: parentNodeId,
    position_x: Math.round(position.x),
    position_y: Math.round(position.y),
    color: color,
    image_url: imageUrl
  };
  const { error } = await supabase.from('mind_map_nodes').insert(nodeData);
  if (error) throw error;
};

export const updateNode = async (userId, nodeId, updates) => {
  if (!userId || !nodeId || !updates) throw new Error("ID do usuário, ID do nó e dados de atualização são obrigatórios.");
  
  const validUpdates = { ...updates };
  if(typeof updates.position_x !== 'undefined') validUpdates.position_x = Math.round(updates.position_x);
  if(typeof updates.position_y !== 'undefined') validUpdates.position_y = Math.round(updates.position_y);
  
  validUpdates.updated_at = new Date().toISOString();
  
  delete validUpdates.id;
  delete validUpdates.user_id;
  delete validUpdates.map_id;
  delete validUpdates.created_at;

  const { error } = await supabase.from('mind_map_nodes').update(validUpdates).eq('id', nodeId).eq('user_id', userId);
  if (error) throw error;
};


export const updateNodePosition = async (userId, nodeId, position) => {
  if (!userId || !nodeId || position.x == null || position.y == null) {
    throw new Error("ID do usuário, ID do nó e posições X, Y são obrigatórios.");
  }
  const { error } = await supabase
    .from('mind_map_nodes')
    .update({ 
        position_x: Math.round(position.x), 
        position_y: Math.round(position.y), 
        updated_at: new Date().toISOString() 
    })
    .eq('id', nodeId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const deleteNodeRecursively = async (userId, nodeId) => {
  if (!userId || !nodeId) throw new Error("ID do usuário e ID do nó são obrigatórios.");

  const { data: children, error: findChildrenError } = await supabase
    .from('mind_map_nodes')
    .select('id')
    .eq('user_id', userId)
    .eq('parent_node_id', nodeId);

  if (findChildrenError) throw new Error(`Erro ao buscar nós filhos: ${findChildrenError.message}`);

  if (children && children.length > 0) {
     for (const child of children) {
        await deleteNodeRecursively(userId, child.id); // Recursively delete children
     }
  }
  
  const { error: deleteError } = await supabase
    .from('mind_map_nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', userId);
  if (deleteError) throw new Error(`Erro ao remover nó: ${deleteError.message}`);
};