import React, { useState, useEffect } from 'react';
    import { Outlet, useLocation, Navigate } from 'react-router-dom';
    import Sidebar from '@/components/Sidebar';
    import MobileSidebar from '@/components/MobileSidebar';
    import { Toaster } from '@/components/ui/toaster';
    import { motion, AnimatePresence } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { Button } from '@/components/ui/button';
    import { Menu, X } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';

    const Layout = ({ children }) => {
      const location = useLocation();
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/1e9da85f-0f3d-41c2-8d4c-abdb48609b38/313196da4c6c4ff2c3deb79423d2ed81.png";

      const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
      };

      return (
        <div className="flex min-h-screen bg-background">
          <div className="hidden md:flex md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm shadow-sm p-3 flex items-center justify-between h-[60px]">
            <div className="flex items-center space-x-2">
              <img src={logoUrl} alt="Trilha Dev Logo Icon" className="h-8 w-auto" />
              <span className="text-xl font-bold text-primary">Trilha Dev</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-foreground">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden fixed inset-0 z-40 pt-[60px]" 
              >
                <MobileSidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto pt-[76px] md:pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children || <Outlet />}
              </motion.div>
            </AnimatePresence>
          </main>
          <Toaster />
        </div>
      );
    };

    export default Layout;