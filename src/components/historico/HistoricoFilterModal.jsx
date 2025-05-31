
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


    const HistoricoFilterModal = ({
      isOpen,
      onOpenChange,
      onApplyFilters,
      onClearFilters,
      initialFilters
    }) => {
      const [filterStartDate, setFilterStartDate] = useState('');
      const [filterEndDate, setFilterEndDate] = useState('');
      const [filterStatus, setFilterStatus] = useState('all');
      const [filterPeriod, setFilterPeriod] = useState('month');

      useEffect(() => {
        if (isOpen && initialFilters) {
          setFilterStartDate(initialFilters.startDate || '');
          setFilterEndDate(initialFilters.endDate || '');
          setFilterStatus(initialFilters.status || 'all');
          setFilterPeriod(initialFilters.period || 'month');
        }
      }, [isOpen, initialFilters]);

      const handleApply = () => {
        onApplyFilters({
          startDate: filterPeriod === 'custom' ? filterStartDate : '',
          endDate: filterPeriod === 'custom' ? filterEndDate : '',
          status: filterStatus,
          period: filterPeriod,
        });
      };
      
      const handleClear = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterStatus('all');
        setFilterPeriod('month'); // Reset to default
        onClearFilters();
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Filtrar Histórico</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                  <Label htmlFor="filter-period-modal">Período</Label>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                      <SelectTrigger id="filter-period-modal">
                          <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="day">Hoje</SelectItem>
                          <SelectItem value="week">Esta Semana</SelectItem>
                          <SelectItem value="month">Este Mês</SelectItem>
                          <SelectItem value="year">Este Ano</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              {filterPeriod === 'custom' && (
                  <>
                      <div>
                          <Label htmlFor="filter-start-date-modal">Data Inicial</Label>
                          <Input id="filter-start-date-modal" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                      </div>
                      <div>
                          <Label htmlFor="filter-end-date-modal">Data Final</Label>
                          <Input id="filter-end-date-modal" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                      </div>
                  </>
              )}
              <div>
                <Label htmlFor="filter-status-modal">Status</Label>
                 <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger id="filter-status-modal">
                          <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="studied">Estudados</SelectItem>
                          <SelectItem value="not_studied">Não Estudados</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClear}>Limpar Filtros</Button>
              <Button onClick={handleApply}>Aplicar Filtros</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default HistoricoFilterModal;
  