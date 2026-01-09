import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';

interface SensorHistoryChartProps {
  data: number[];
  color?: string;
  unit: string;
  height?: number;
  hideTitle?: boolean;
}

export const SensorHistoryChart = ({ data, color = '#10b981', unit, height = 300, hideTitle = false }: SensorHistoryChartProps) => {
  // Generate mock 24-hour data based on the provided trend
  const chartData = useMemo(() => {
    const points = 24 * 4; // 15 min intervals for 24 hours
    const now = new Date();
    const result = [];
    
    // Use the last real value as a baseline
    const baseValue = data[data.length - 1] || 50;
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 15 * 60 * 1000);
      // Create some random variation around the trend
      // In a real app, this would be actual historical data
      const randomVar = (Math.random() - 0.5) * 5;
      const trendFactor = i < data.length ? (data[data.length - 1 - i] - baseValue) : 0;
      
      result.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: baseValue + trendFactor + randomVar,
      });
    }
    return result;
  }, [data]);

  const gradientId = useMemo(() => `colorValue-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm" style={{ height}}>
      {!hideTitle && <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Historical Trend (Last 24 Hours)</h4>}
      <ResponsiveContainer width="100%" height={hideTitle ? "100%" : "85%"} className="-ml-2">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, 'Range']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill={`url(#${gradientId})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
