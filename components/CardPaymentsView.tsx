
import React from 'react';
import { Transaction } from '../types';
import { CreditCard, Trash2, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface CardPaymentsViewProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const CardPaymentsView: React.FC<CardPaymentsViewProps> = ({ transactions, onDelete }) => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Monthly Card Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-2 flex items-center gap-2">
            <CreditCard size={14} /> এই মাসের কার্ড পেমেন্ট রিপোর্ট
          </p>
          <h2 className="text-4xl font-black mb-6">€{totalAmount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h2>
          
          <div className="pt-6 border-t border-white/10">
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">মোট কার্ড কালেকশন</p>
            <p className="text-sm font-medium text-blue-50 tracking-wide">আপনার POS মেশিনে প্রাপ্ত মোট পেমেন্ট এখানে যুক্ত করুন।</p>
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
            return (
              <div key={tx.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</p>
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
          আপনার ব্যাংক অ্যাকাউন্টে জমা হওয়া প্রকৃত অ্যামাউন্ট ট্র্যাক করার জন্য এই সেকশনটি ব্যবহার করুন।
        </p>
      </div>
    </div>
  );
};

export default CardPaymentsView;
