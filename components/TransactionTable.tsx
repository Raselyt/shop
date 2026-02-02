
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2, ShoppingBag, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
          <ShoppingBag size={32} />
        </div>
        <p className="text-slate-400 text-sm font-medium">এই মাসে কোনো লেনদেন নেই।</p>
      </div>
    );
  }

  const getTransactionStyles = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return { icon: <ArrowUpRight size={16} />, colorClass: 'bg-emerald-50 text-emerald-600', textClass: 'text-emerald-600', label: '+' };
      case TransactionType.CARD_PAYMENT:
        return { icon: <CreditCard size={16} />, colorClass: 'bg-blue-50 text-blue-600', textClass: 'text-blue-600', label: '+' };
      case TransactionType.EXPENSE:
        return { icon: <ArrowDownRight size={16} />, colorClass: 'bg-rose-50 text-rose-600', textClass: 'text-rose-600', label: '-' };
      default:
        return { icon: <ArrowUpRight size={16} />, colorClass: 'bg-slate-50 text-slate-600', textClass: 'text-slate-600', label: '' };
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">বিবরণ ও তারিখ</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">পরিমাণ (€)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const styles = getTransactionStyles(tx.type);
              const isCard = tx.type === TransactionType.CARD_PAYMENT;
              return (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${styles.colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                        {styles.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })} • 
                          <span className={`ml-1 px-2 py-0.5 rounded-full ${isCard ? 'bg-blue-50 text-blue-500' : 'bg-slate-100'}`}>
                            {isCard ? 'কার্ড পেমেন্ট' : tx.category}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className={`text-base font-black ${styles.textClass}`}>
                        {styles.label}€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                      </span>
                      {isCard && tx.grossAmount && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">
                          Gross: €{tx.grossAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => onDelete(tx.id)} 
                      className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 bg-slate-50/50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
