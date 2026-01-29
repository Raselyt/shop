
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
      <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-emerald-500 relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">মাসিক আয়</p>
            <h3 className="text-2xl font-bold text-slate-800">€{stats.income.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-emerald-50 p-2 rounded-full text-emerald-500">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 opacity-10 text-emerald-500 rotate-12 transition-transform group-hover:scale-125">
          <TrendingUp size={64} />
        </div>
      </div>

      {/* Monthly Expense */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-rose-500 relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">মাসিক খরচ</p>
            <h3 className="text-2xl font-bold text-slate-800">€{stats.expense.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-rose-50 p-2 rounded-full text-rose-500">
            <TrendingDown size={20} />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 opacity-10 text-rose-500 -rotate-12 transition-transform group-hover:scale-125">
          <TrendingDown size={64} />
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-blue-600 rounded-2xl p-5 shadow-lg text-white md:col-span-1 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">নিট লাভ</p>
          <h3 className="text-3xl font-bold mb-1">€{stats.profit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-blue-200 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-300"></span>
            পজিটিভ ক্যাশফ্লো
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 opacity-20 text-white">
          <DollarSign size={80} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
