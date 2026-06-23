
import React from 'react';
import { TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';

interface DashboardCardsProps {
  stats: {
    income: number;
    card: number;
    expense: number;
    profit: number;
    dollarBuyCost: number;
    dollarSellRevenue: number;
    dollarTradingProfit: number;
  };
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  const shopProfit = stats.income - stats.expense;
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

      {/* Net Profit - Now reflects Total Integrated Cash Balance including Dollar Trade & Profit */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-6 shadow-xl text-white flex justify-between items-start relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="space-y-0.5">
            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest inline-block mb-1 animate-pulse">ডলার লাভ ও লেনদেন সহ</span>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">মোট ক্যাশ ব্যালেন্স ও নিট লাভ</p>
          </div>
          <h3 className="text-2xl font-black">€{stats.profit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
          
          <div className="space-y-1 pt-1.5 border-t border-indigo-800/60 mt-2 text-[9px] font-medium text-indigo-100">
            <p className="flex justify-between gap-4">
              <span className="text-indigo-300">দোকান নিট লাভ:</span>
              <span className="font-extrabold text-white">€{shopProfit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
            </p>
            {stats.dollarTradingProfit > 0 && (
              <p className="flex justify-between gap-4">
                <span className="text-emerald-400">ডলার ব্যবসার লাভ (Net):</span>
                <span className="font-extrabold text-emerald-400">+€{stats.dollarTradingProfit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
              </p>
            )}
            {stats.dollarBuyCost > 0 && (
              <p className="flex justify-between gap-4 text-[8px] text-indigo-300">
                <span>ডলার ক্রয় বাবদ খরচ:</span>
                <span className="font-bold text-rose-300">-€{stats.dollarBuyCost.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
              </p>
            )}
            {stats.dollarSellRevenue > 0 && (
              <p className="flex justify-between gap-4 text-[8px] text-indigo-300">
                <span>ডলার বিক্রয় ক্যাশ ফেরত:</span>
                <span className="font-bold text-emerald-300">+€{stats.dollarSellRevenue.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
              </p>
            )}
          </div>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl text-indigo-300 backdrop-blur-md self-start shrink-0">
          <TrendingUp size={20} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
