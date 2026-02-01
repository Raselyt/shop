
import React from 'react';
import { Transaction } from '../types';
import { CreditCard, Trash2, ArrowUpRight, ShieldCheck, Percent } from 'lucide-react';

interface CardPaymentsViewProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const CardPaymentsView: React.FC<CardPaymentsViewProps> = ({ transactions, onDelete }) => {
  const totalNet = transactions.reduce((sum, t) => sum + t.amount, 0);
  // যেহেতু অ্যাপে ২% মাইনাস করে রাখা হয়, তাই অরিজিনাল অ্যামাউন্ট হবে (Net / 0.98)
  const totalGross = totalNet / 0.98;
  const totalFees = totalGross - totalNet;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Monthly Card Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-2 flex items-center gap-2">
            <CreditCard size={14} /> এই মাসের কার্ড পেমেন্ট রিপোর্ট
          </p>
          <h2 className="text-4xl font-black mb-6">€{totalNet.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h2>
          
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">মোট কালেকশন (Gross)</p>
              <p className="text-lg font-bold">€{totalGross.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">সিস্টেম ফি (2%)</p>
              <p className="text-lg font-bold text-rose-300">-€{totalFees.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
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
            const gross = tx.amount / 0.98;
            const fee = gross - tx.amount;
            return (
              <div key={tx.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })} • Gross: €{gross.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[9px] text-rose-400 font-bold flex items-center justify-end gap-1">
                      <Percent size={8} /> ফি: €{fee.toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => onDelete(tx.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
        <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
          কার্ড পেমেন্ট সেকশনে সকল হিসাব ২% ট্রানজ্যাকশন ফি বাদ দিয়ে দেখানো হচ্ছে। আপনার ব্যাংক স্টেটমেন্টের সাথে এই হিসাবটি মিলিয়ে নিন।
        </p>
      </div>
    </div>
  );
};

export default CardPaymentsView;
