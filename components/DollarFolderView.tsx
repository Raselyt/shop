import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import GeminiService, { ExtractedDollarTx } from '../services/geminiService';
import { 
  CircleDollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2, 
  Plus, 
  FolderPlus,
  Scale,
  Sparkles,
  Loader2,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface DollarFolderViewProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
  onOpenForm: (type: TransactionType) => void;
  onMigrate?: (updates: { id: string; type: TransactionType; category: string; description: string }[]) => Promise<void>;
}

const DollarFolderView: React.FC<DollarFolderViewProps> = ({ 
  transactions, 
  onDelete, 
  onEdit, 
  onOpenForm,
  onMigrate
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ExtractedDollarTx[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});
  const [showMigrationAssistant, setShowMigrationAssistant] = useState(true);

  const dollarTx = useMemo(() => {
    return transactions.filter(t => t.type === TransactionType.DOLLAR_BUY || t.type === TransactionType.DOLLAR_SELL);
  }, [transactions]);

  // Candidates for migration: standard transactions containing dollar, usd, euro keywords in descriptions
  const dollarCandidates = useMemo(() => {
    return transactions.filter(t => 
      t.type !== TransactionType.DOLLAR_BUY && 
      t.type !== TransactionType.DOLLAR_SELL && 
      t.type !== TransactionType.CARD_PAYMENT &&
      /dollar|ডলার|usd|\$|euro|ইউরো|€/i.test(t.description)
    );
  }, [transactions]);

  const stats = useMemo(() => {
    const boughtUsd = dollarTx
      .filter(t => t.type === TransactionType.DOLLAR_BUY)
      .reduce((sum, t) => sum + (t.dollarAmount || 0), 0);

    const boughtCost = dollarTx
      .filter(t => t.type === TransactionType.DOLLAR_BUY)
      .reduce((sum, t) => sum + t.amount, 0);

    const soldUsd = dollarTx
      .filter(t => t.type === TransactionType.DOLLAR_SELL)
      .reduce((sum, t) => sum + (t.dollarAmount || 0), 0);

    const soldRevenue = dollarTx
      .filter(t => t.type === TransactionType.DOLLAR_SELL)
      .reduce((sum, t) => sum + t.amount, 0);

    const avgBuyRate = boughtUsd > 0 ? boughtCost / boughtUsd : 0;
    const avgSellRate = soldUsd > 0 ? soldRevenue / soldUsd : 0;
    
    // Profit based on sold dollars: (Sell Rate - Buy Rate) * Sold Dollars
    const profit = soldUsd > 0 ? (avgSellRate - avgBuyRate) * soldUsd : 0;

    const remainingUsd = boughtUsd - soldUsd;

    return {
      boughtUsd,
      boughtCost,
      soldUsd,
      soldRevenue,
      avgBuyRate,
      avgSellRate,
      profit,
      remainingUsd
    };
  }, [dollarTx]);

  const handleStartAIAnalysis = async () => {
    if (dollarCandidates.length === 0) return;
    setAnalyzing(true);
    
    const candidatesPayload = dollarCandidates.map(c => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
      type: c.type // e.g., 'Expense' or 'Income'
    }));

    try {
      const results = await GeminiService.parseDollarTransactions(candidatesPayload);
      setAiSuggestions(results);
      // Select all suggested updates by default
      const initialSelection: Record<string, boolean> = {};
      results.forEach(res => {
        initialSelection[res.id] = true;
      });
      setSelectedSuggestions(initialSelection);
    } catch (err) {
      console.error("AI analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleSuggestion = (id: string) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const executeMigration = async () => {
    if (!onMigrate) return;
    
    const updatesToApply = aiSuggestions
      .filter(s => selectedSuggestions[s.id])
      .map(s => {
        const payloadType = s.type === 'DOLLAR_BUY' ? TransactionType.DOLLAR_BUY : TransactionType.DOLLAR_SELL;
        const categoryString = s.type === 'DOLLAR_BUY' 
          ? `__DOLLAR_BUY:${s.dollarRate.toFixed(4)}:${s.dollarAmount}__`
          : `__DOLLAR_SELL:${s.dollarRate.toFixed(4)}:${s.dollarAmount}__`;

        return {
          id: s.id,
          type: payloadType,
          category: categoryString,
          description: s.description
        };
      });

    if (updatesToApply.length === 0) {
      alert("কোনো সাজেশন সিলেক্ট করা হয়নি!");
      return;
    }

    try {
      await onMigrate(updatesToApply);
      setAiSuggestions([]);
      setShowMigrationAssistant(false);
    } catch (err) {
      console.error("Migration execution error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Banner / Card for Candidate Conversion */}
      {showMigrationAssistant && dollarCandidates.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#311042] rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden transition-all duration-300">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
            <Sparkles size={250} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 p-2 rounded-xl text-indigo-950 font-black flex items-center justify-center animate-bounce">
                <Sparkles size={16} />
              </span>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">AI হিস্টোরি অ্যাসিস্ট্যান্ট</span>
                <h3 className="text-base font-black text-white">ডলার ও ইউরো লেনদেন ব্যাক-ক্যালকুলেশন রূপান্তরকারী</h3>
              </div>
            </div>

            <p className="text-xs text-indigo-100 font-medium leading-relaxed">
              বড় ভাই, আমরা আপনার ডেসক্রিপশনের রের্কডে <span className="text-amber-300 font-bold">{dollarCandidates.length}টি ডলার/ইউরো লেনদেন</span> খুঁজে পেয়েছি! 
              (যেমন: {dollarCandidates.slice(0, 2).map(c => `"${c.description}"`).join(', ')})। 
              উন্নত Gemini AI দিয়ে এগুলোকে নতুন ডলার হিসাব মডিউলে অটো-রূপান্তর করতে চান?
            </p>

            {aiSuggestions.length === 0 ? (
              <div className="flex flex-col gap-3">
                {/* Preliminary List of candidates */}
                <div className="bg-white/10 rounded-2xl p-4 divide-y divide-white/10 max-h-48 overflow-y-auto">
                  {dollarCandidates.map(c => (
                    <div key={c.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white">{c.description}</p>
                        <p className="text-[10px] text-white/60">{new Date(c.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <span className="font-extrabold text-amber-300">€{c.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleStartAIAnalysis}
                  disabled={analyzing}
                  className="flex items-center justify-center gap-2 w-full bg-amber-400 text-indigo-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg hover:bg-amber-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> ডাটা এনালাইসিস চলছে...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} /> AI দিয়ে ডিকোড ও সাজান
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">ডিকোডকৃত ফলাফল (রিভিউ করুন):</h4>
                <div className="bg-white/10 rounded-2xl p-4 divide-y divide-white/10 max-h-64 overflow-y-auto space-y-3">
                  {aiSuggestions.map((s) => {
                    const original = dollarCandidates.find(c => c.id === s.id);
                    const isSelected = !!selectedSuggestions[s.id];
                    return (
                      <div key={s.id} className={`pt-2.5 flex items-start gap-3 text-xs transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`}>
                        <button 
                          onClick={() => handleToggleSuggestion(s.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-amber-400 border-amber-400 text-indigo-950' : 'border-white/30 text-transparent'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-baseline">
                            <p className="font-black text-amber-300">{s.type === 'DOLLAR_BUY' ? 'ডলার ক্রয়' : 'ডলার বিক্রয়'}</p>
                            <span className="text-[11px] font-extrabold text-[#fda4af]">€{original?.amount.toFixed(2)}</span>
                          </div>
                          <div className="text-[11px] font-bold text-white/95">
                            মূল বিবরণ: <span className="italic text-white/70 font-medium">"{original?.description}"</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 text-[10px] space-y-1 mt-1 border border-white/5">
                            <p className="font-extrabold text-white flex justify-between">
                              <span>extracted dollar:</span>
                              <span className="text-emerald-400 text-xs font-black">${s.dollarAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </p>
                            <p className="font-extrabold text-white flex justify-between">
                              <span>back calculations exchange rate:</span>
                              <span className="text-indigo-200">€{s.dollarRate?.toFixed(4)}</span>
                            </p>
                            <span className="text-[9px] font-light text-white/50 block">polished desc: {s.description}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={executeMigration}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg hover:bg-emerald-400 transition-all active:scale-95"
                  >
                    <Check size={15} /> মাইগ্রেশন নিশ্চিত করুন
                  </button>
                  <button 
                    onClick={() => setAiSuggestions([])}
                    className="px-4 flex items-center justify-center gap-2 bg-white/10 text-white font-bold text-xs uppercase rounded-xl hover:bg-white/20 transition-all"
                  >
                    <RefreshCw size={15} /> আবার
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Dollars Bought Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">মোট ডলার ক্রয়</span>
            <h3 className="text-2xl font-black text-slate-800">${stats.boughtUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] font-bold text-slate-500">ক্রয় মূল্য: €{stats.boughtCost.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
            {stats.boughtUsd > 0 && (
              <span className="inline-block text-[8px] font-extrabold text-[#7c3aed] bg-indigo-50 px-2 py-0.5 rounded-full uppercase">গড় দর: €{stats.avgBuyRate.toFixed(4)}</span>
            )}
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
            <TrendingDown size={22} />
          </div>
        </div>

        {/* Total Dollars Sold Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">মোট ডলার বিক্রয়</span>
            <h3 className="text-2xl font-black text-slate-800">${stats.soldUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] font-bold text-slate-500">বিক্রয় মূল্য: €{stats.soldRevenue.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
            {stats.soldUsd > 0 && (
              <span className="inline-block text-[8px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">গড় দর: €{stats.avgSellRate.toFixed(4)}</span>
            )}
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-500">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Profit and Inventory Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2rem] p-6 shadow-xl text-white flex justify-between items-center relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block">ডলার ব্যবসা নিট লাভ</span>
            <h3 className="text-3xl font-black text-white">€{stats.profit.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide flex items-center gap-1">
                <Scale size={11} /> অবশিষ্ট স্টক: ${stats.remainingUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {stats.profit > 0 ? (
                <span className="text-[8px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">লাভজনক অবস্থায় আছেন</span>
              ) : stats.profit < 0 ? (
                <span className="text-[8px] font-extrabold px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full">লোকসান হয়েছে</span>
              ) : (
                <span className="text-[8px] font-extrabold px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded-full">বিক্রি শুরু করুন</span>
              )}
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl text-indigo-300 backdrop-blur-md">
            <CircleDollarSign size={28} />
          </div>
        </div>
      </section>

      {/* Instant Action Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">বিদেশি ডলার লেনদেন যুক্ত করুন</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">ট্যুরিস্টদের থেকে ডলার ক্রয় বা বিক্রয় হিসাব সাথে সাথে এন্ট্রি দিন।</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => onOpenForm(TransactionType.DOLLAR_BUY)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <FolderPlus size={15} /> ডলার ক্রয়
          </button>
          <button 
            onClick={() => onOpenForm(TransactionType.DOLLAR_SELL)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-600 text-white font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95"
          >
            <CircleDollarSign size={15} /> ডলার বিক্রয়
          </button>
        </div>
      </div>

      {/* Transaction List for Dollars */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">চলতি মাসের ডলার লেনদেনের রেকর্ড</h3>
        {dollarTx.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <CircleDollarSign size={32} />
            </div>
            <p className="text-slate-400 text-sm font-medium">কোনো ডলার লেনদেন পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">বিবরণ ও তারিখ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ডলার হিসাব (USD)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট পরিশোধ/আদায় (€)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dollarTx.map((tx) => {
                    const isBuy = tx.type === TransactionType.DOLLAR_BUY;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl shadow-sm ${
                              isBuy ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {isBuy ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                {new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-extrabold text-slate-700">
                          {isBuy ? '-' : '+'}${tx.dollarAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">দর: €{tx.dollarRate?.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-base font-black ${isBuy ? 'text-indigo-600' : 'text-amber-600'}`}>
                            {isBuy ? '-' : '+'}€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => onEdit(tx)} 
                            className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 bg-slate-50/50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => onDelete(tx.id)} 
                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 bg-slate-50/50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DollarFolderView;
