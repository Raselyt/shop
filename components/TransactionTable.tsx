
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
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">বিবরণ ও তারিখ</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">পরিমাণ (€)</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const styles = getTransactionStyles(tx.type);
              const isCard = tx.type === TransactionType.CARD_PAYMENT;
              return (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${styles.colorClass} shadow-sm`}>
                        {styles.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })} • 
                          <span className={`ml-1 px-1.5 py-0.5 rounded ${isCard ? 'bg-blue-50 text-blue-500' : 'bg-slate-100'}`}>
                            {isCard ? 'কার্ড পেমেন্ট' : tx.category}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${styles.textClass}`}>
                        {styles.label}€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                      </span>
                      {isCard && (
                        <span className="text-[8px] text-slate-300 font-bold uppercase italic mt-0.5">
                          Net (২% বাদে)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => onDelete(tx.id)} 
                      className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 bg-slate-50/50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={16} />
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
