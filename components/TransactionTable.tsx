
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
          <ShoppingBag size={32} />
        </div>
        <p className="text-slate-400 text-sm">কোনো লেনদেন পাওয়া যায়নি। নতুন লেনদেন যোগ করুন।</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">বিবরণ ও তারিখ</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">পরিমাণ</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {tx.type === TransactionType.INCOME ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })} • {tx.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tx.id);
                      }}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-slate-50 rounded-xl transition-all active:scale-90 inline-flex items-center justify-center border border-slate-100"
                      aria-label="মুছে ফেলুন"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
