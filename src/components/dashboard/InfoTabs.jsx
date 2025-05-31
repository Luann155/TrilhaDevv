import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const InfoTabs = ({ dashboardData, onSaveSetting }) => {
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusInput, setFocusInput] = useState(dashboardData.focusOfWeek || '');

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [tipInput, setTipInput] = useState(dashboardData.quickTip || '');

  const handleSaveFocus = () => {
    onSaveSetting('focus_of_week', focusInput);
    setIsFocusModalOpen(false);
  };
  
  const handleSaveTip = () => {
    onSaveSetting('quick_tip', tipInput);
    setIsTipModalOpen(false);
  };
  
  React.useEffect(() => {
    setFocusInput(dashboardData.focusOfWeek || '');
    setTipInput(dashboardData.quickTip || '');
  }, [dashboardData.focusOfWeek, dashboardData.quickTip]);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Tabs defaultValue="focus" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-2">
            <TabsTrigger value="focus" className="text-sm sm:text-base">Foco da Semana</TabsTrigger>
            <TabsTrigger value="tips" className="text-sm sm:text-base">Dica Rápida</TabsTrigger>
          </TabsList>
          <TabsContent value="focus">
            <Card className="min-h-[180px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center"><Sparkles className="h-5 w-5 text-primary mr-2" />Foco da Semana</CardTitle>
                  <CardDescription>Metas e objetivos para os próximos 7 dias.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsFocusModalOpen(true)}><Edit2 className="h-4 w-4 mr-1"/>Editar</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-base">{dashboardData.focusOfWeek}</p>
                <p className="text-sm text-muted-foreground">Lembre-se: a consistência é mais importante que a intensidade!</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tips">
            <Card className="min-h-[180px]">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="flex items-center"><Zap className="h-5 w-5 text-yellow-400 mr-2" />Dica Rápida</CardTitle>
                    <CardDescription>Pequenos truques para impulsionar seu aprendizado.</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" onClick={() => setIsTipModalOpen(true)}><Edit2 className="h-4 w-4 mr-1"/>Editar</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-base">{dashboardData.quickTip}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={isFocusModalOpen} onOpenChange={setIsFocusModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Foco da Semana</DialogTitle></DialogHeader>
          <Textarea value={focusInput} onChange={(e) => setFocusInput(e.target.value)} placeholder="Qual será seu foco esta semana?" className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFocusModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveFocus}>Salvar Foco</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTipModalOpen} onOpenChange={setIsTipModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Dica Rápida</DialogTitle></DialogHeader>
          <Textarea value={tipInput} onChange={(e) => setTipInput(e.target.value)} placeholder="Compartilhe uma dica útil!" className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTipModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveTip}>Salvar Dica</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InfoTabs;