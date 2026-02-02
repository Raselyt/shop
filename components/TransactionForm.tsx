
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (tx: Transaction) => void;
  userId: string;
  initialType?: TransactionType;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, userId, initialType }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType || TransactionType.INCOME);
  const [category, setCategory] = useState('পণ্য বিক্রয়');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialType) {
      setType(initialType);
    }
  }, [initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const finalAmount = parseFloat(amount);
    
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: finalAmount,
      type,
      category,
      date,
      userId
    };

    onAdd(newTx);
    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">লেনদেনের বিবরণ</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="যেমন: আজকের কার্ড পেমেন্ট"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">পরিমাণ (€)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">লেনদেনের ধরন</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none ${type === TransactionType.CARD_PAYMENT ? 'text-blue-600 border-blue-200' : ''}`}
          >
            <option value={TransactionType.INCOME}>নগদ আয় (Cash)</option>
            <option value={TransactionType.CARD_PAYMENT}>কার্ড পেমেন্ট (Card)</option>
            <option value={TransactionType.EXPENSE}>ব্যয় (Expense)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">তারিখ</label>
          <input 
            type="date" 
            value={date}
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
        সেভ করুন
      </button>
    </form>
  );
};

export default TransactionForm;
