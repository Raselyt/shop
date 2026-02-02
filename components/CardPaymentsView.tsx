
import React from 'react';
import { Transaction } from '../types';
import { CreditCard, Trash2, ArrowUpRight, ShieldCheck, Edit3 } from 'lucide-react';

interface CardPaymentsViewProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

const CardPaymentsView: React.FC<CardPaymentsViewProps> = ({ transactions, onDelete, onEdit }) => {
  const totalNet = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalGross = transactions.reduce((sum, t) => sum + (t.grossAmount || t.amount), 0);
  const totalFees = totalGross - totalNet;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-blue-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">কার্ড পেমেন্ট রিপোর্ট (মাসিক)</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">ব্যাংকে জমা হয়েছে (Net)</p>
            <h2 className="text-5xl font-black tracking-tighter">€{totalNet.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">মোট কালেকশন (Gross)</p>
              <p className="text-lg font-black text-white">€{totalGross.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest mb-1">সিস্টেম ফি (Fees)</p>
              <p className="text-lg font-black text-rose-200">-€{totalFees.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">কার্ড ট্রানজ্যাকশন হিস্ট্রি</h3>
        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">{transactions.length}টি পেমেন্ট</span>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 text-sm font-medium">এই মাসে কোনো কার্ড পেমেন্ট রেকর্ড করা হয়নি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const fee = (tx.grossAmount || tx.amount) - tx.amount;
            return (
              <div key={tx.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><ArrowUpRight size={20} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(tx)} className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => onDelete(tx.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 bg-slate-50/80 rounded-2xl p-4 items-center">
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">পেমেন্ট (Gross)</p>
                    <p className="text-xs font-black text-slate-600">€{(tx.grossAmount || tx.amount).toFixed(2)}</p>
                  </div>
                  <div className="text-center border-x border-slate-200">
                    <p className="text-[8px] font-bold text-rose-400 uppercase mb-1">ব্যাংক ফি</p>
                    <p className="text-xs font-black text-rose-400">-€{fee.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-emerald-500 uppercase mb-1">জমা (Net)</p>
                    <p className="text-sm font-black text-emerald-600">€{tx.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0"><ShieldCheck size={20} /></div>
        <p className="text-[11px] text-blue-700 leading-relaxed font-semibold italic">টিপস: এডিট বাটনে ক্লিক করে আপনি যে কোনো সময় ব্যাংকে জমার পরিমাণ আপডেট করতে পারবেন।</p>
      </div>
    </div>
  );
};

export default CardPaymentsView;
