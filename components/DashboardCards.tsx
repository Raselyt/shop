
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface DashboardCardsProps {
  stats: {
    income: number;
    expense: number;
    profit: number;
  };
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Monthly Income */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-emerald-500 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">মাসিক আয়</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.income.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Monthly Expense */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-rose-500 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">মাসিক খরচ</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.expense.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-rose-50 p-3 rounded-2xl text-rose-500">
          <TrendingDown size={24} />
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-blue-600 rounded-2xl p-6 shadow-lg text-white flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">নিট লাভ</p>
          <h3 className="text-3xl font-black mb-1">€{stats.profit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
            ক্যাশফ্লো স্ট্যাটাস
          </p>
        </div>
        <div className="bg-blue-500/50 p-3 rounded-2xl text-white">
          <DollarSign size={28} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
