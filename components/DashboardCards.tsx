
import React from 'react';
import { TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';

interface DashboardCardsProps {
  stats: {
    income: number;
    card: number;
    expense: number;
    profit: number;
  };
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Cash Income */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">নগদ (Cash) আয়</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.income.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-500">
          <Wallet size={20} />
        </div>
      </div>

      {/* Card Payments */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">কার্ড পেমেন্ট (Net)</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.card.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[8px] text-blue-500 font-bold mt-1 uppercase tracking-tighter italic">* কার্ড ফোল্ডারে বিস্তারিত</p>
        </div>
        <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-500">
          <CreditCard size={20} />
        </div>
      </div>

      {/* Monthly Expense */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">মাসিক মোট খরচ</p>
          <h3 className="text-2xl font-black text-slate-800">€{stats.expense.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-rose-50 p-3.5 rounded-2xl text-rose-500">
          <TrendingDown size={20} />
        </div>
      </div>

      {/* Net Profit - Now only reflects Cash Profit */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl text-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-blue-100 uppercase mb-1 tracking-wider">মোট নগদ নিট লাভ</p>
          <h3 className="text-2xl font-black mb-1">€{stats.profit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[8px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-300 animate-pulse"></span>
            নগদ ব্যালেন্স (কার্ড বাদে)
          </p>
        </div>
        <div className="bg-white/20 p-3.5 rounded-2xl text-white backdrop-blur-md">
          <TrendingUp size={24} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
