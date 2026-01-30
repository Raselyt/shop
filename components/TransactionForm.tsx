
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (tx: Transaction) => void;
  userId: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, userId }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [category, setCategory] = useState('পণ্য বিক্রয়');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
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
          placeholder="যেমন: আজকের মোট বিক্রি বা দোকান ভাড়া"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">লেনদেনের ধরন</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all cursor-pointer ${type === TransactionType.INCOME ? 'text-emerald-600 focus:border-emerald-400' : 'text-rose-600 focus:border-rose-400'}`}
          >
            <option value={TransactionType.INCOME}>আয় (বিক্রি)</option>
            <option value={TransactionType.EXPENSE}>ব্যয় (খরচ)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">ক্যাটাগরি</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all cursor-pointer"
          >
            <option value="পণ্য বিক্রয়">পণ্য বিক্রয়</option>
            <option value="দোকান খরচ">দোকান খরচ</option>
            <option value="পণ্য ক্রয়">পণ্য ক্রয়</option>
            <option value="বেতন">বেতন</option>
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
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all cursor-pointer"
            required
          />
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
      >
        সেভ করুন
      </button>
    </form>
  );
};

export default TransactionForm;
