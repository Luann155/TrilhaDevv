import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { BarChartHorizontal } from 'lucide-react';
    import { motion } from 'framer-motion';

    const StudyHoursChart = ({ data }) => {
      const dailyHours = {};
      data.forEach(entry => {
          if (entry.studied && entry.duration_minutes) {
              const date = entry.entry_date;
              dailyHours[date] = (dailyHours[date] || 0) + (entry.duration_minutes / 60);
          }
      });

      const chartData = Object.entries(dailyHours)
          .map(([date, hours]) => ({ date, hours }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (chartData.length === 0) return <p className="text-muted-foreground text-center py-4">Sem dados de horas estudadas para exibir no gráfico.</p>;

      const maxHours = Math.max(...chartData.map(d => d.hours), 0) || 1;

      return (
          <Card className="my-4">
              <CardHeader>
                  <CardTitle className="flex items-center"><BarChartHorizontal className="mr-2 h-5 w-5 text-primary"/>Horas Estudadas por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {chartData.map(({ date, hours }) => (
                          <div key={date} className="flex items-center">
                              <span className="text-xs w-20 text-muted-foreground">{new Date(date + 'T00:00:00').toLocaleDateString()}</span>
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
              </CardContent>
          </Card>
      );
    };

    export default StudyHoursChart;