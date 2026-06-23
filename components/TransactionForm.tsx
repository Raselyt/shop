
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Sparkles, TrendingUp, TrendingDown, Calculator, Percent } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (tx: Transaction) => void;
  userId: string;
  initialType?: TransactionType;
  initialData?: Transaction | null;
  avgBuyRate?: number;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, userId, initialType, initialData, avgBuyRate = 0 }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType || TransactionType.INCOME);
  const [category, setCategory] = useState('পণ্য বিক্রয়');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dollarAmount, setDollarAmount] = useState('');
  const [dollarRate, setDollarRate] = useState('');

  const isDollar = type === TransactionType.DOLLAR_BUY || type === TransactionType.DOLLAR_SELL;

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      if (initialData.grossAmount) {
        setGrossAmount(initialData.grossAmount.toString());
      }
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(initialData.date);
      setDollarAmount(initialData.dollarAmount?.toString() || '');
      setDollarRate(initialData.dollarRate?.toString() || '');
    } else if (initialType) {
      setType(initialType);
      if (initialType === TransactionType.DOLLAR_BUY) {
        setDescription('ট্যুরিস্ট থেকে ডলার ক্রয়');
        setCategory('ডলার ক্রয়');
      } else if (initialType === TransactionType.DOLLAR_SELL) {
        setDescription('ডলার বিক্রয়');
        setCategory('ডলার বিক্রয়');
      }
    }
  }, [initialData, initialType]);

  const handleDollarAmountChange = (val: string) => {
    setDollarAmount(val);
    const usd = parseFloat(val);
    const eur = parseFloat(amount);
    const rate = parseFloat(dollarRate);
    if (!isNaN(usd) && usd > 0) {
      if (!isNaN(eur) && eur > 0) {
        setDollarRate((eur / usd).toFixed(4));
      } else if (!isNaN(rate) && rate > 0) {
        setAmount((usd * rate).toFixed(2));
      }
    }
  };

  const handleEuroAmountChange = (val: string) => {
    setAmount(val);
    const eur = parseFloat(val);
    const usd = parseFloat(dollarAmount);
    const rate = parseFloat(dollarRate);
    if (!isNaN(eur) && eur > 0) {
      if (!isNaN(usd) && usd > 0) {
        setDollarRate((eur / usd).toFixed(4));
      } else if (!isNaN(rate) && rate > 0) {
        setDollarAmount((eur / rate).toFixed(2));
      }
    }
  };

  const handleDollarRateChange = (val: string) => {
    setDollarRate(val);
    const rate = parseFloat(val);
    const usd = parseFloat(dollarAmount);
    if (!isNaN(rate) && rate > 0) {
      if (!isNaN(usd) && usd > 0) {
        setAmount((usd * rate).toFixed(2));
      }
    }
  };

  const liveProfitLoss = useMemo(() => {
    if (type !== TransactionType.DOLLAR_SELL) return null;
    const usd = parseFloat(dollarAmount);
    const eur = parseFloat(amount);
    if (isNaN(usd) || isNaN(eur) || usd <= 0 || !avgBuyRate) return null;

    const buyCost = usd * avgBuyRate;
    const profit = eur - buyCost;
    const currentRate = eur / usd;

    return {
      buyCost,
      profit,
      currentRate,
      avgBuyRate
    };
  }, [dollarAmount, amount, type, avgBuyRate]);

  // Handle auto-prefilling description on type change
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === TransactionType.DOLLAR_BUY) {
      setDescription('ট্যুরিস্ট থেকে ডলার ক্রয়');
      setCategory('ডলার ক্রয়');
    } else if (newType === TransactionType.DOLLAR_SELL) {
      setDescription('ডলার বিক্রয়');
      setCategory('ডলার বিক্রয়');
    } else if (newType === TransactionType.CARD_PAYMENT) {
      setDescription('কার্ড পেমেন্ট রেকর্ড');
      setCategory('কার্ড পেমেন্ট');
    } else {
      setDescription('');
      setCategory('পণ্য বিক্রয়');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    if (isDollar && (!dollarAmount || !amount)) return;
    if (!isDollar && (type === TransactionType.CARD_PAYMENT ? !grossAmount : !amount)) return;

    const grossValue = grossAmount ? parseFloat(grossAmount) : (amount ? parseFloat(amount) : 0);
    
    let netValue;
    if (type === TransactionType.CARD_PAYMENT) {
      netValue = amount ? parseFloat(amount) : grossValue;
    } else if (isDollar) {
      netValue = parseFloat(amount);
    } else {
      netValue = parseFloat(amount);
    }
    
    const tx: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      description,
      amount: netValue,
      grossAmount: type === TransactionType.CARD_PAYMENT ? grossValue : undefined,
      type,
      category: isDollar 
        ? (type === TransactionType.DOLLAR_BUY ? 'ডলার ক্রয়' : 'ডলার বিক্রয়')
        : (type === TransactionType.CARD_PAYMENT ? 'কার্ড পেমেন্ট' : category),
      date,
      userId,
      dollarAmount: isDollar ? parseFloat(dollarAmount) : undefined,
      dollarRate: isDollar ? parseFloat(dollarRate) : undefined,
    };

    onAdd(tx);
    if (!initialData) {
      setDescription('');
      setAmount('');
      setGrossAmount('');
      setDollarAmount('');
      setDollarRate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">লেনদেনের বিবরণ</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === TransactionType.CARD_PAYMENT ? "যেমন: কার্ড পেমেন্ট রেকর্ড" : "যেমন: ক্যাশ বিক্রি"}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
          required
        />
      </div>

      <div className={`grid ${type === TransactionType.CARD_PAYMENT ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
        {type === TransactionType.CARD_PAYMENT ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider ml-1">মোট পেমেন্ট (Gross)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-blue-300">€</span>
                <input 
                  type="number" step="0.01" value={grossAmount}
                   onChange={(e) => setGrossAmount(e.target.value)}
                  placeholder="৫৭.০০"
                  className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none focus:border-blue-300"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-emerald-500 uppercase tracking-wider ml-1">ব্যাংকে জমা (ঐচ্ছিক)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-300">€</span>
                <input 
                  type="number" step="0.01" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="পরে লিখুন"
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none focus:border-emerald-300"
                />
              </div>
            </div>
          </div>
        ) : (
          !isDollar && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">পরিমাণ (€)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                <input 
                  type="number" step="0.01" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none"
                  required
                />
              </div>
            </div>
          )
        )}
        
        {! (type === TransactionType.CARD_PAYMENT) && (
          <div className={`space-y-2 ${isDollar ? 'col-span-2' : ''}`}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">লেনদেনের ধরন</label>
            <select 
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none"
            >
              <option value={TransactionType.INCOME}>নগদ আয় (Cash)</option>
              <option value={TransactionType.CARD_PAYMENT}>কার্ড পেমেন্ট (Card)</option>
              <option value={TransactionType.EXPENSE}>ব্যয় (Expense)</option>
              <option value={TransactionType.DOLLAR_BUY}>💵 ডলার ক্রয় (Dollar Buy)</option>
              <option value={TransactionType.DOLLAR_SELL}>💵 ডলার বিক্রয় (Dollar Sell)</option>
            </select>
          </div>
        )}
      </div>

      {isDollar && (
        <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">ডলারের পরিমাণ (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input 
                  type="number" step="any" value={dollarAmount}
                  onChange={(e) => handleDollarAmountChange(e.target.value)}
                  placeholder="যেমন: ১০০০"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50/50 transition-all focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">মোট ইউরো (€ তে)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                <input 
                  type="number" step="any" value={amount}
                  onChange={(e) => handleEuroAmountChange(e.target.value)}
                  placeholder="যেমন: ৯২০"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50/50 transition-all focus:border-indigo-400"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/50">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">বিনিময় হার (Rate / €)</label>
              <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">অটো-ক্যালকুলেটেড</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">€</span>
              <input 
                type="number" step="any" value={dollarRate}
                onChange={(e) => handleDollarRateChange(e.target.value)}
                placeholder="অটো হিসাব হবে"
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none text-slate-600 focus:ring-4 focus:ring-slate-200"
              />
            </div>
            <p className="text-[9px] text-slate-400 font-bold ml-1">
              টিপস: বড় ভাই, আপনি সরাসরি ডলার এবং মোট ইউরো দিলেই রেট রিয়েল-টাইমে বের হয়ে যাবে।
            </p>
          </div>

          {/* Live Profit/Loss Widget & Suggested Customer Rates */}
          {liveProfitLoss && (
            <div className="mt-4 p-4 rounded-2xl bg-indigo-950 text-white space-y-3 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-4 translate-y-4">
                <Calculator size={100} />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                  <Percent size={11} /> ব্যবসা লাভ/ক্ষতি এনালাইসার
                </span>
                <span className="text-[9px] font-bold text-slate-300">ক্রয় গড় দর: €{avgBuyRate.toFixed(4)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <p className="text-[9px] text-indigo-200 font-semibold">আপনার ক্রয় খরচ:</p>
                  <p className="text-sm font-black text-slate-200">€{liveProfitLoss.buyCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-indigo-200 font-semibold">কার্যকরী বিক্রয় দর:</p>
                  <p className="text-sm font-black text-amber-300">€{liveProfitLoss.currentRate.toFixed(4)}</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-white/70 font-semibold">নিট ফলাফল:</p>
                  <p className={`text-base font-black ${liveProfitLoss.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveProfitLoss.profit > 0 ? '+' : ''}€{liveProfitLoss.profit.toFixed(2)} {liveProfitLoss.profit >= 0 ? 'লাভ 🎉' : 'লোকসান ⚠️'}
                  </p>
                </div>
                <div className="text-right">
                  {liveProfitLoss.profit >= 0 ? (
                    <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg inline-block">
                      <TrendingUp size={18} />
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-400 p-1.5 rounded-lg inline-block">
                      <TrendingDown size={18} />
                    </span>
                  )}
                </div>
              </div>

              {/* Suggested pricing block */}
              <div className="text-[9.5px] leading-relaxed text-indigo-100 font-medium">
                💡 <span className="font-bold text-amber-300">পরবর্তী দর সাজেস্ট:</span> পরবর্তী কাস্টমার বা ট্যুরিস্টদের থেকে ডলার কিনতে চাইলে <span className="font-bold text-emerald-400">€{(liveProfitLoss.currentRate - 0.015).toFixed(4)}</span> এর নিচে কেনার ট্রাই করবেন। আর খুচরা গ্রাহকদের কাছে বিক্রয় করার চমৎকার দর হচ্ছে <span className="font-bold text-amber-300">€{(liveProfitLoss.currentRate + 0.015).toFixed(4)}</span>। এতে আপনার ভালো প্রফিট থাকবে!
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {!isDollar && type !== TransactionType.CARD_PAYMENT && (
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">ক্যাটাগরি</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold outline-none"
            >
              <option value="পণ্য বিক্রয়">পণ্য বিক্রয়</option>
              <option value="দোকান খরচ">দোকান খরচ</option>
              <option value="বিল">বিল/ভাড়া</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>
        )}
        <div className={`space-y-2 ${isDollar || type === TransactionType.CARD_PAYMENT ? 'col-span-2' : ''}`}>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">তারিখ</label>
          <input 
            type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold outline-none"
            required
          />
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98]"
      >
        {initialData ? 'আপডেট করুন' : 'সেভ করুন'}
      </button>
    </form>
  );
};

export default TransactionForm;
