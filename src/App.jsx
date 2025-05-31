import React, { Suspense, lazy, useState, useEffect } from 'react';
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import { Toaster } from '@/components/ui/toaster';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { supabase } from '@/lib/supabaseClient';
    import AuthPage from '@/pages/AuthPage';
    // import DailyReviewPage from '@/pages/DailyReviewPage'; // Mantendo estático por enquanto

    const WelcomePage = lazy(() => import('@/pages/WelcomePage'));
    const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
    const TrilhaPage = lazy(() => import('@/pages/TrilhaPage'));
    const ChecklistsPage = lazy(() => import('@/pages/ChecklistsPage'));
    const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage')); 
    const MindMapsPage = lazy(() => import('@/pages/MindMapsPage'));
    const GamificationPage = lazy(() => import('@/pages/GamificationPage'));
    const HistoricoPage = lazy(() => import('@/pages/HistoricoPage'));
    const DicasPage = lazy(() => import('@/pages/DicasPage'));
    const ConfiguracoesPage = lazy(() => import('@/pages/ConfiguracoesPage'));
    const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
    const DailyReviewPage = lazy(() => import('@/pages/DailyReviewPage')); // Revertendo para lazy load
    const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );

    function App() {
      const [hasVisitedWelcome, setHasVisitedWelcome] = useLocalStorage('hasVisitedWelcomeTrilhaDev', false);
      const [session, setSession] = useState(null);
      const [loadingAuth, setLoadingAuth] = useState(true);

      useEffect(() => {
        const checkSession = async () => {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          setLoadingAuth(false); 
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
          (_event, sessionState) => {
            setSession(sessionState);
            if (_event === 'SIGNED_OUT') {
              setHasVisitedWelcome(false);
            }
          }
        );

        return () => {
          if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      }, [setHasVisitedWelcome]); 

      const handleWelcomeComplete = () => {
        setHasVisitedWelcome(true);
      };

      if (loadingAuth) {
        return <LoadingFallback />;
      }

      return (
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {!session ? (
                <>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </>
              ) : !hasVisitedWelcome ? (
                <>
                  <Route path="/" element={<WelcomePage onComplete={handleWelcomeComplete} />} />
                  <Route path="*" element={<Navigate to="/" replace />} /> 
                </>
              ) : (
                <Route path="/*" element={
                  <Layout>
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" replace />} /> 
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/trilha" element={<TrilhaPage />} />
                      <Route path="/checklists" element={<ChecklistsPage />} />
                      <Route path="/flashcards" element={<FlashcardsPage />} />
                      <Route path="/flashcards/:deckId" element={<FlashcardsPage />} />
                      <Route path="/mapas-mentais" element={<MindMapsPage />} />
                      <Route path="/mapas-mentais/:mapId" element={<MindMapsPage />} />
                      <Route path="/gamificacao" element={<GamificationPage />} />
                      <Route path="/historico" element={<HistoricoPage />} />
                      <Route path="/dicas" element={<DicasPage />} />
                      <Route path="/biblioteca" element={<LibraryPage />} />
                      <Route path="/biblioteca/:unitId" element={<LibraryPage />} />
                      <Route path="/revisao-diaria" element={<DailyReviewPage />} />
                      <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                      <Route path="/404" element={<NotFoundPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                } />
              )}
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      );
    }

    export default App;