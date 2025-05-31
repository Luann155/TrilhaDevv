
import React, { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { BarChartHorizontal } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { motion } from 'framer-motion';

    const StudyHoursChartDashboard = ({ userId }) => {
        const [chartData, setChartData] = useState([]);
        const [loadingChart, setLoadingChart] = useState(true);
        const [filterType, setFilterType] = useState('week'); 
        const { toast } = useToast();

        const fetchChartData = useCallback(async () => {
            if (!userId) return;
            setLoadingChart(true);
            
            const today = new Date();
            let startDate, endDate;

            if (filterType === 'day') {
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
            } else if (filterType === 'week') {
                const dayOfWeek = today.getDay();
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
                const firstDayOfWeek = new Date(new Date(today).setDate(today.getDate() + diffToMonday)); // Use new Date() to avoid mutating original `today`
                startDate = firstDayOfWeek.toISOString().split('T')[0];
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                endDate = lastDayOfWeek.toISOString().split('T')[0];
            } else { // month
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = firstDayOfMonth.toISOString().split('T')[0];
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                endDate = lastDayOfMonth.toISOString().split('T')[0];
            }


            const { data, error } = await supabase
                .from('study_history')
                .select('entry_date, duration_minutes')
                .eq('user_id', userId)
                .eq('studied', true)
                .gte('entry_date', startDate)
                .lte('entry_date', endDate)
                .order('entry_date', { ascending: true });

            if (error) {
                toast({ title: "Erro ao buscar dados do gráfico", description: error.message, variant: "destructive" });
                setChartData([]);
            } else {
                const dailyHours = {};
                data.forEach(entry => {
                    if (entry.duration_minutes) {
                        dailyHours[entry.entry_date] = (dailyHours[entry.entry_date] || 0) + (entry.duration_minutes / 60);
                    }
                });
                setChartData(Object.entries(dailyHours).map(([date, hours]) => ({ date, hours })));
            }
            setLoadingChart(false);
        }, [userId, toast, filterType]);

        useEffect(() => {
            fetchChartData();
            const channel = supabase.channel(`public:study_history_dashboard_chart:${userId}`)
              .on('postgres_changes', { event: '*', schema: 'public', table: 'study_history', filter: `user_id=eq.${userId}` }, fetchChartData)
              .subscribe();
            return () => supabase.removeChannel(channel);
        }, [fetchChartData, userId]);

        if (loadingChart) return <div className="text-center p-4 col-span-1 md:col-span-2 lg:col-span-3"><div className="animate-pulse">Carregando gráfico de horas...</div></div>;
        
        const maxHours = Math.max(...chartData.map(d => d.hours), 0) || 1;

        return (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center"><BarChartHorizontal className="mr-2 h-5 w-5 text-primary"/>Horas Estudadas</CardTitle>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Dia</SelectItem>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="month">Mês</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {chartData.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Sem dados de horas estudadas para este período.</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {chartData.map(({ date, hours }) => (
                                <div key={date} className="flex items-center">
                                    <span className="text-xs w-24 text-muted-foreground">{new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                    <div className="flex-1 bg-muted rounded-full h-5 ml-2">
                                        <motion.div 
                                            className="bg-primary h-5 rounded-full flex items-center justify-end pr-2"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(hours / maxHours) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        >
                                          <span className="text-xs text-primary-foreground font-medium">{hours.toFixed(1)}h</span>
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

export default StudyHoursChartDashboard;
