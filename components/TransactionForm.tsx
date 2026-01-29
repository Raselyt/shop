
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (tx: Transaction) => void;
  // Added userId prop to satisfy the Transaction interface requirements
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

    // Added userId to the object to fix the missing property error
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">বিবরণ</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="যেমন: পণ্য বিক্রয়"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">পরিমাণ (€)</label>
          <input 
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ধরন</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value={TransactionType.INCOME}>আয় (Income)</option>
            <option value={TransactionType.EXPENSE}>ব্যয় (Expense)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ক্যাটাগরি</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="পণ্য বিক্রয়">পণ্য বিক্রয়</option>
            <option value="ভাড়া">ভাড়া</option>
            <option value="বেতন">বেতন</option>
            <option value="বিল">বিল</option>
            <option value="অন্যান্য">অন্যান্য</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">তারিখ</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] mt-2"
      >
        Save Record
      </button>
    </form>
  );
};

export default TransactionForm;
