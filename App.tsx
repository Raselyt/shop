
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  TrendingUp, 
  LogOut, 
  History,
  Sparkles,
  RefreshCw,
  Calendar,
  User as UserIcon,
  ChevronDown,
  Loader2,
  Database
} from 'lucide-react';
import { Transaction, TransactionType, User } from './types.ts';
import TransactionForm from './components/TransactionForm.tsx';
import DashboardCards from './components/DashboardCards.tsx';
import TrendsChart from './components/TrendsChart.tsx';
import TransactionTable from './components/TransactionTable.tsx';
import SyncModal from './components/SyncModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AIService from './services/geminiService.ts';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // চেক সেশন
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        });
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    setAiInsight(null);
    setShowProfileMenu(false);
  };

  const addTransaction = async (newTx: Transaction) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([newTx])
      .select();

    if (error) {
      alert(`ডাটা সেভ হয়নি: ${error.message}`);
    } else if (data && data.length > 0) {
      setTransactions(prev => [data[0], ...prev]);
      setShowForm(false);
    }
  };

  const handleImportTransactions = async (importedData: any[]) => {
    if (!user || !Array.isArray(importedData) || importedData.length === 0) {
      alert('ইমপোর্ট করার জন্য সঠিক ডাটা পাওয়া যায়নি।');
      return;
    }

    setLoading(true);
    
    // ডাটা ক্লিজিং এবং বর্তমান ইউজার আইডির সাথে ম্যাপিং
    const transactionsToInsert = importedData.map(tx => ({
      id: crypto.randomUUID(),
      description: tx.description || 'বিবরণ নেই',
      amount: Number(tx.amount) || 0,
      type: tx.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      category: tx.category || 'অন্যান্য',
      date: tx.date || new Date().toISOString().split('T')[0],
      userId: user.id
    }));

    try {
      const { error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);

      if (error) throw error;

      await fetchTransactions();
      alert(`সফলভাবে ${transactionsToInsert.length}টি ডাটা ইমপোর্ট করা হয়েছে!`);
    } catch (err: any) {
      alert(`ইমপোর্ট ব্যর্থ হয়েছে: ${err.message}`);
    } finally {
      setLoading(false);
      setShowSync(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!id) return;
    
    if (window.confirm('আপনি কি নিশ্চিত যে এই হিসাবটি মুছে ফেলবেন?')) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('userId', user?.id);

      if (error) {
        alert(`মুছে ফেলা যায়নি।`);
      } else {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    }
  };

  const handleGetAiInsight = async () => {
    if (filteredTransactions.length === 0) {
      setAiInsight("বিশ্লেষণের জন্য এই মাসে কোনো ডাটা নেই।");
      return;
    }
    setIsAiLoading(true);
    try {
      const insight = await AIService.analyzeBusiness(filteredTransactions);
      setAiInsight(insight);
    } catch (err) {
      setAiInsight("AI বিশ্লেষণ ব্যর্থ হয়েছে।");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(viewDate));
  }, [transactions, viewDate]);

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income: totalIncome,
      expense: totalExpense,
      profit: totalIncome - totalExpense
    };
  }, [filteredTransactions]);

  const getDisplayMonth = () => {
    const [y, m] = viewDate.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">লোডিং হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10 bg-slate-50 animate-in fade-in duration-500">
      <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Wallet size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-900 uppercase tracking-tighter">RASAL SHOP AI</h1>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                Supabase Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSync(true)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Sync Data"
            >
              <Database size={18} />
            </button>
            <button 
              onClick={fetchTransactions}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <ChevronDown size={12} className={`text-slate-400 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold">
                    <LogOut size={16} /> লগআউট করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">{getDisplayMonth()}</h2>
          </div>
          <input 
            type="month" 
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none"
          />
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-300" />
              <h3 className="text-sm font-bold">AI বিজনেস ইনসাইট</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-200">
              {aiInsight || "এই মাসের হিসাব বিশ্লেষণ করতে নিচের বাটনটি চাপুন।"}
            </p>
            <button 
              onClick={handleGetAiInsight}
              disabled={isAiLoading}
              className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isAiLoading ? 'অপেক্ষা করুন...' : 'বিশ্লেষণ করুন'}
            </button>
          </div>
        </div>

        <DashboardCards stats={stats} />

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" /> প্রবৃদ্ধি গ্রাফ
          </h2>
          <div className="h-64 w-full">
            <TrendsChart transactions={filteredTransactions} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History size={14} className="text-slate-500" /> লেনদেনসমূহ
          </h2>
          <TransactionTable transactions={filteredTransactions} onDelete={deleteTransaction} />
        </section>
      </main>

      <button onClick={() => setShowForm(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 border-4 border-white">
        <PlusCircle size={24} />
      </button>

      {showSync && <SyncModal transactions={transactions} onImport={handleImportTransactions} onClose={() => setShowSync(false)} />}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-md rounded-t-[3rem] md:rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">নতুন হিসাব যোগ করুন</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400">
                <PlusCircle size={24} className="rotate-45" />
              </button>
            </div>
            <TransactionForm onAdd={addTransaction} userId={user.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
