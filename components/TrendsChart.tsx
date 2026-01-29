
import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Transaction, TransactionType } from '../types';

interface TrendsChartProps {
  transactions: Transaction[];
}

const TrendsChart: React.FC<TrendsChartProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const dailyMap: Record<string, { income: number; expense: number }> = {};
    
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(tx => {
      const dateKey = tx.date;
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { income: 0, expense: 0 };
      }
      if (tx.type === TransactionType.INCOME) {
        dailyMap[dateKey].income += tx.amount;
      } else {
        dailyMap[dateKey].expense += tx.amount;
      }
    });

    return Object.entries(dailyMap).map(([date, values]) => ({
      name: new Date(date).getDate(), // Only show day of month for cleaner look
      fullName: new Date(date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }),
      আয়: values.income,
      ব্যয়: values.expense
    }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-300 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        এই মাসের গ্রাফ দেখানোর জন্য কোনো লেনদেন নেই
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8' }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8' }} 
        />
        <Tooltip 
          labelFormatter={(value, items) => items[0]?.payload?.fullName || value}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontSize: '12px'
          }}
        />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '0', paddingBottom: '20px' }} />
        <Area 
          type="monotone" 
          dataKey="আয়" 
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorIncome)" 
          strokeWidth={3}
        />
        <Area 
          type="monotone" 
          dataKey="ব্যয়" 
          stroke="#f43f5e" 
          fillOpacity={1} 
          fill="url(#colorExpense)" 
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendsChart;
