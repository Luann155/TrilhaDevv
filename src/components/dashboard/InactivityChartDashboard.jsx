
import React, { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { Activity } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Progress } from '@/components/ui/progress';

    const InactivityChartDashboard = ({ userId }) => {
        const [inactiveDays, setInactiveDays] = useState(0);
        const [totalDaysInPeriod, setTotalDaysInPeriod] = useState(7);
        const [filterType, setFilterType] = useState('week'); 
        const [loading, setLoading] = useState(true);
        const { toast } = useToast();

        const fetchInactivityData = useCallback(async () => {
            if (!userId) return;
            setLoading(true);

            const today = new Date();
            let startDate, endDate;
            let daysInPeriod;

            if (filterType === 'week') {
                const dayOfWeek = today.getDay();
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const firstDayOfWeek = new Date(new Date(today).setDate(today.getDate() + diffToMonday));
                startDate = firstDayOfWeek.toISOString().split('T')[0];
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                endDate = lastDayOfWeek.toISOString().split('T')[0];
                daysInPeriod = 7;
            } else { // month
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = firstDayOfMonth.toISOString().split('T')[0];
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                endDate = lastDayOfMonth.toISOString().split('T')[0];
                daysInPeriod = lastDayOfMonth.getDate();
            }
            setTotalDaysInPeriod(daysInPeriod);

            const { data: studiedEntries, error } = await supabase
                .from('study_history')
                .select('entry_date')
                .eq('user_id', userId)
                .eq('studied', true)
                .gte('entry_date', startDate)
                .lte('entry_date', endDate);

            if (error) {
                toast({ title: "Erro ao buscar dados de inatividade", description: error.message, variant: "destructive" });
            } else {
                const studiedDates = new Set(studiedEntries.map(e => e.entry_date));
                setInactiveDays(daysInPeriod - studiedDates.size);
            }
            setLoading(false);
        }, [userId, filterType, toast]);
        
        useEffect(() => {
            fetchInactivityData();
             const channel = supabase.channel(`public:study_history_dashboard_inactivity:${userId}`)
              .on('postgres_changes', { event: '*', schema: 'public', table: 'study_history', filter: `user_id=eq.${userId}` }, fetchInactivityData)
              .subscribe();
            return () => supabase.removeChannel(channel);
        }, [fetchInactivityData, userId]);

        if (loading) return <div className="text-center p-4 col-span-1 md:col-span-2 lg:col-span-3"><div className="animate-pulse">Carregando gráfico de inatividade...</div></div>;

        const inactivityPercentage = totalDaysInPeriod > 0 ? (inactiveDays / totalDaysInPeriod) * 100 : 0;

        return (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5 text-destructive"/>Dias de Inatividade</CardTitle>
                     <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="month">Mês</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-destructive mb-2">{inactiveDays} / {totalDaysInPeriod} dias</div>
                    <Progress value={inactivityPercentage} className="h-3 bg-destructive/30 [&>div]:bg-destructive" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {filterType === 'week' ? 'Dias não estudados nesta semana.' : 'Dias não estudados neste mês.'}
                    </p>
                </CardContent>
            </Card>
        );
    };
export default InactivityChartDashboard;
