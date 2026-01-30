
import React from 'react';
import { TrendingUp, TrendingDown, Euro } from 'lucide-react';

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
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:border-emerald-200 transition-all">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">মাসিক মোট আয়</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.income.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Monthly Expense */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:border-rose-200 transition-all">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">মাসিক মোট খরচ</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.expense.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
          <TrendingDown size={24} />
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl text-white flex justify-between items-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <p className="text-[11px] font-bold text-blue-100 uppercase mb-1 tracking-wider">বর্তমান নিট লাভ</p>
          <h3 className="text-3xl font-black mb-1">€{stats.profit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
            বিজনেস ক্যাশফ্লো
          </p>
        </div>
        <div className="bg-white/20 p-4 rounded-2xl text-white relative z-10 backdrop-blur-md border border-white/20">
          <Euro size={28} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
