import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, PlusCircle, Search, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

import UnitList from '@/components/library/UnitList';
import FileList from '@/components/library/FileList'; // Renamed to LinkList conceptually
import UnitModal from '@/components/library/UnitModal';
import FileModal from '@/components/library/FileModal'; // Renamed to LinkModal conceptually
import { CardDescription } from '@/components/ui/card';


const LibraryPage = () => {
  const [units, setUnits] = useState([]);
  const [links, setLinks] = useState([]); // Changed from files to links
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false); // Changed from isFileModalOpen
  const [editingLink, setEditingLink] = useState(null); // Changed from editingFile

  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(false); // Changed from loadingFiles
  
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();
  const { unitId: routeUnitId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        navigate('/auth');
      }
    };
    getUser();
  }, [toast, navigate]);

  const fetchUnits = useCallback(async () => {
    if (!userId) return;
    setLoadingUnits(true);
    const { data, error } = await supabase
      .from('library_units')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar unidades", description: error.message, variant: "destructive" });
    } else {
      setUnits(data || []);
    }
    setLoadingUnits(false);
  }, [userId, toast]);

  const fetchLinksForUnit = useCallback(async (unitId) => { // Changed from fetchFilesForUnit
    if (!userId || !unitId) {
      setLinks([]); 
      return;
    }
    setLoadingLinks(true);
    const { data, error } = await supabase
      .from('library_files') // Table name remains library_files as per DB schema
      .select('*')
      .eq('user_id', userId)
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar links da unidade", description: error.message, variant: "destructive" });
      setLinks([]);
    } else {
      setLinks(data || []);
    }
    setLoadingLinks(false);
  }, [userId, toast]);

  useEffect(() => {
    if (userId) {
      fetchUnits();
    }
  }, [userId, fetchUnits]);

  useEffect(() => {
    if (routeUnitId) {
      const unit = units.find(u => u.id === routeUnitId);
      if (unit) {
        if (selectedUnit?.id !== unit.id) { 
          setSelectedUnit(unit);
          fetchLinksForUnit(routeUnitId); // Changed from fetchFilesForUnit
        }
      } else if (units.length > 0 && !loadingUnits && userId) { 
         const unitExists = units.some(u => u.id === routeUnitId);
         if (!unitExists) {
            navigate('/biblioteca', { replace: true });
         }
      }
    } else {
      setSelectedUnit(null);
      setLinks([]); 
      setLoadingLinks(false); 
    }
  }, [routeUnitId, units, fetchLinksForUnit, navigate, loadingUnits, userId, selectedUnit]);


  const handleUnitSubmit = async (unitData) => {
    let newUnitId = null;
    if (editingUnit) {
      const { error } = await supabase.from('library_units').update({ title: unitData.title, description: unitData.description }).eq('id', editingUnit.id);
      if (error) {
        toast({ title: `Erro ao atualizar unidade`, description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: `Unidade Atualizada!`, description: `A unidade "${unitData.title}" foi salva.` });
    } else {
      const { data: newUnitData, error } = await supabase.from('library_units').insert({ ...unitData, user_id: userId }).select().single();
      if (error) {
        toast({ title: `Erro ao criar unidade`, description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: `Unidade Criada!`, description: `A unidade "${unitData.title}" foi salva.` });
      newUnitId = newUnitData.id;
    }

    setIsUnitModalOpen(false);
    setEditingUnit(null);
    await fetchUnits(); 

    if (newUnitId) {
      navigate(`/biblioteca/${newUnitId}`); 
    }
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setIsUnitModalOpen(true);
  };

  const handleDeleteUnit = async (unitIdToDelete) => {
    const { data: linksToDelete, error: fetchLinksError } = await supabase
      .from('library_files')
      .select('id')
      .eq('unit_id', unitIdToDelete)
      .eq('user_id', userId);

    if (fetchLinksError) {
      toast({ title: "Erro ao buscar links para deletar", description: fetchLinksError.message, variant: "destructive" });
      return;
    }

    if (linksToDelete && linksToDelete.length > 0) {
      const linkIds = linksToDelete.map(l => l.id);
      const { error: deleteLinksError } = await supabase
        .from('library_files')
        .delete()
        .in('id', linkIds);
      if (deleteLinksError) {
        toast({ title: "Erro ao deletar links da unidade", description: deleteLinksError.message, variant: "destructive" });
        return;
      }
    }
    
    const { error } = await supabase.from('library_units').delete().eq('id', unitIdToDelete);
    if (error) {
      toast({ title: "Erro ao deletar unidade", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Unidade Deletada", description: "A unidade e seus links foram removidos." });
      fetchUnits();
      if (selectedUnit?.id === unitIdToDelete) {
        navigate('/biblioteca', { replace: true });
      }
    }
  };
  
  const handleLinkSubmit = async (linkData) => { // Changed from handleFileUpload, removed fileToUpload param
    if (!selectedUnit) {
      toast({ title: "Erro", description: "Nenhuma unidade selecionada.", variant: "destructive" });
      return false;
    }

    const dataToUpsert = {
      user_id: userId,
      unit_id: selectedUnit.id,
      file_name: linkData.fileName, // This is now the link's name/title
      link_url: linkData.linkUrl,
      tags: linkData.tagsArray,
      updated_at: new Date().toISOString()
    };

    if (editingLink) { // Changed from editingFile
        const { error: dbError } = await supabase.from('library_files').update(dataToUpsert)
        .eq('id', editingLink.id);

        if (dbError) {
            toast({ title: "Erro ao atualizar link", description: dbError.message, variant: "destructive" });
            return false;
        } else {
            toast({ title: "Link Atualizado!", description: `"${linkData.fileName}" foi atualizado.` });
            fetchLinksForUnit(selectedUnit.id);
            return true; 
        }
    } else {
        const newLinkData = {
            ...dataToUpsert,
            created_at: new Date().toISOString() 
        };
        
        const { error: dbError } = await supabase.from('library_files').insert(newLinkData);

        if (dbError) {
            toast({ title: "Erro ao salvar link", description: dbError.message, variant: "destructive" });
            return false;
        } else {
            toast({ title: "Link Adicionado!", description: `"${linkData.fileName}" foi salvo na unidade.` });
            fetchLinksForUnit(selectedUnit.id);
            return true;
        }
    }
  };

  const handleEditLink = (link) => { // Changed from handleEditFile
    setEditingLink(link); // Changed from setEditingFile
    setIsLinkModalOpen(true); // Changed from setIsFileModalOpen
  };

  const handleDeleteLink = async (linkToDelete) => { // Changed from handleDeleteFile
    if (!selectedUnit) return;
    
    const { error: dbError } = await supabase.from('library_files').delete().eq('id', linkToDelete.id);
    if (dbError) {
      toast({ title: "Erro ao deletar link", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Link Deletado", description: `"${linkToDelete.file_name}" foi removido.` });
      fetchLinksForUnit(selectedUnit.id);
    }
  };

  const handleOpenLink = (linkUrl) => { // Changed from handlePreviewFile
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({ title: "URL Inválida", description: "Este link não possui uma URL válida.", variant: "destructive" });
    }
  };

  const toggleLinkAttribute = async (linkId, attributeName, currentValue) => { // Changed from toggleFileAttribute
    if (!selectedUnit) return;
    const updateData = {};
    updateData[attributeName] = !currentValue;

    const { error } = await supabase
      .from('library_files')
      .update(updateData)
      .eq('id', linkId);

    if (error) {
      toast({ title: `Erro ao atualizar ${attributeName}`, description: error.message, variant: "destructive" });
    } else {
      fetchLinksForUnit(selectedUnit.id);
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLinks = links.filter(link => // Changed from filteredFiles
    link.file_name.toLowerCase().includes(searchTerm.toLowerCase()) || // file_name is now link name
    (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loadingUnits && !userId) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando usuário...</p></div>;
  }
  if (loadingUnits && userId && units.length === 0 && !selectedUnit && !routeUnitId) {
     return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div></div>;
  }


  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {selectedUnit ? selectedUnit.title : "Biblioteca de Unidades"}
          </h1>
          <div className="flex gap-2">
            {selectedUnit && (
              <Button variant="outline" onClick={() => navigate('/biblioteca')}>
                <FolderOpen className="mr-2 h-4 w-4" /> Ver Todas Unidades
              </Button>
            )}
            <Button onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Unidade
            </Button>
          </div>
        </div>
        {selectedUnit && (
          <CardDescription className="text-center sm:text-left mb-4 -mt-4">{selectedUnit.description}</CardDescription>
        )}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Buscar por título, descrição ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-full"
            aria-label="Buscar na biblioteca"
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedUnit ? (
          <FileList 
            files={filteredLinks} // Changed from files to filteredLinks
            loading={loadingLinks} // Changed from loadingFiles
            selectedUnit={selectedUnit}
            onEditFile={handleEditLink} // Changed from onEditFile
            onDeleteFile={handleDeleteLink} // Changed from onDeleteFile
            onOpenLink={handleOpenLink} // Changed from onPreviewFile
            onToggleFileAttribute={toggleLinkAttribute} // Changed from onToggleFileAttribute
            onOpenFileModal={() => { setEditingLink(null); setIsLinkModalOpen(true); }} // Changed from onOpenFileModal
          />
        ) : (
          <UnitList
            units={filteredUnits}
            loading={loadingUnits}
            onEditUnit={handleEditUnit}
            onDeleteUnit={handleDeleteUnit}
            onNavigateToUnit={(unitId) => navigate(`/biblioteca/${unitId}`)}
          />
        )}
      </AnimatePresence>

      <UnitModal
        isOpen={isUnitModalOpen}
        onOpenChange={setIsUnitModalOpen}
        onSubmit={handleUnitSubmit}
        editingUnit={editingUnit}
      />

      <FileModal // Name kept for consistency, but it's a LinkModal now
        isOpen={isLinkModalOpen} // Changed from isFileModalOpen
        onOpenChange={setIsLinkModalOpen} // Changed from setIsFileModalOpen
        onSubmit={handleLinkSubmit} // Changed from handleFileUpload
        editingFile={editingLink} // Changed from editingFile
        selectedUnit={selectedUnit}
        userId={userId} // userId is not directly used in FileModal but good to pass if needed later
      />
      
      {/* PdfPreviewModal is removed as it's no longer needed */}

    </div>
  );
};

export default LibraryPage;