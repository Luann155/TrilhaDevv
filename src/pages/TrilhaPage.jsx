import React, { useState } from 'react';
import { TrilhaProvider, useTrilha } from '@/contexts/TrilhaContext';
import TrilhaHeader from '@/components/trilha/TrilhaHeader';
import TrilhaGrid from '@/components/trilha/TrilhaGrid';
import SessaoEstudoModal from '@/components/trilha/SessaoEstudoModal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import TrilhaFilterModal from '@/components/trilha/TrilhaFilterModal';

const TrilhaPageContent = () => {
  const { 
    isConfirmUncheckOpen, 
    setIsConfirmUncheckOpen, 
    itemToUncheck, 
    proceedToggleComplete,
    weeklyProgress,
    currentDisplayDate,
    getWeekNumber
  } = useTrilha();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <TrilhaHeader onOpenFilterModal={() => setIsFilterModalOpen(true)} />
      
      {weeklyProgress && weeklyProgress.week_fully_marked && (
        <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg text-center">
          <p className="font-semibold text-green-700 dark:text-green-300">
            🎉 Parabéns! Você completou todas as sessões planejadas para a Semana {getWeekNumber(currentDisplayDate)}! 🎉
          </p>
        </div>
      )}

      <TrilhaGrid />
      <SessaoEstudoModal />
      <TrilhaFilterModal 
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
      />
      {itemToUncheck && (
        <ConfirmationDialog
          isOpen={isConfirmUncheckOpen}
          onOpenChange={setIsConfirmUncheckOpen}
          onConfirm={() => proceedToggleComplete(itemToUncheck, false)}
          title="Desmarcar Sessão?"
          description="Tem certeza que deseja marcar esta sessão de estudo como pendente?"
          confirmText="Sim, desmarcar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}

const TrilhaPage = () => {
  return (
    <TrilhaProvider>
      <TrilhaPageContent />
    </TrilhaProvider>
  );
};

export default TrilhaPage;
