import React from 'react';
import Sidebar from '@/components/Sidebar';

const MobileSidebar = ({ onLinkClick }) => {
  return (
    <div className="w-full h-full bg-card text-card-foreground border-r shadow-xl overflow-y-auto">
      <Sidebar onLinkClick={onLinkClick} />
    </div>
  );
};

export default MobileSidebar;