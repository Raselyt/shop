
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (tx: Transaction) => void;
  userId: string;
  initialType?: TransactionType;
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, userId, initialType, initialData }) => {
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

  useEffect(() => {
    if (isDollar) {
      const usd = parseFloat(dollarAmount);
      const rate = parseFloat(dollarRate);
      if (!isNaN(usd) && !isNaN(rate)) {
        setAmount((usd * rate).toFixed(2));
      } else {
        setAmount('');
      }
    }
  }, [dollarAmount, dollarRate, type, isDollar]);

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
    if (isDollar && (!dollarAmount || !dollarRate)) return;
    if (!isDollar && (type === TransactionType.CARD_PAYMENT ? !grossAmount : !amount)) return;

    const grossValue = grossAmount ? parseFloat(grossAmount) : (amount ? parseFloat(amount) : 0);
    
    let netValue;
    if (type === TransactionType.CARD_PAYMENT) {
      netValue = amount ? parseFloat(amount) : grossValue;
    } else if (isDollar) {
      netValue = parseFloat(dollarAmount) * parseFloat(dollarRate);
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
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">ডলারের পরিমাণ (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number" step="0.01" value={dollarAmount}
                onChange={(e) => setDollarAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">বিনিময় হার (Rate/€)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
              <input 
                type="number" step="0.01" value={dollarRate}
                onChange={(e) => setDollarRate(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                required
              />
            </div>
          </div>
          <div className="col-span-2 space-y-2 pt-4 mt-2 border-t border-slate-200/60">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">মোট বিক্রয়/ক্রয় মূল্য (€ তে)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">€</span>
              <input 
                type="number" disabled value={amount}
                className="w-full bg-slate-100/80 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-extrabold text-slate-700 opacity-90 cursor-not-allowed"
              />
            </div>
          </div>
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
