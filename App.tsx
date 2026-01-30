
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
  ChevronDown,
  Loader2,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard
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

  // Today's specific stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.date === today);
    const income = todayTxs.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = todayTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { income, expense, profit: income - expense };
  }, [transactions]);

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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">লোডিং হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10 bg-slate-50 overflow-x-hidden selection:bg-blue-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 px-4 py-3 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
              <Wallet size={18} />
            </div>
            <div>
              <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">RASAL SHOP AI</h1>
              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSync(true)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
              title="Sync Data"
            >
              <Database size={18} />
            </button>
            <button 
              onClick={fetchTransactions}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
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
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in duration-200">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ইউজার প্রোফাইল</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  </div>
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
        {/* Today's Summary Banner */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-500">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">আজকের সারাংশ</p>
              <h2 className="text-sm font-black text-slate-800">মোট লাভ: <span className={todayStats.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>€{todayStats.profit.toLocaleString('en-EU')}</span></h2>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-right">
              <p className="text-[8px] font-bold text-emerald-500 uppercase">বিক্রি</p>
              <p className="text-xs font-black text-slate-700">€{todayStats.income.toLocaleString('en-EU')}</p>
            </div>
            <div className="w-px h-8 bg-slate-100 mx-1 self-center"></div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-rose-500 uppercase">খরচ</p>
              <p className="text-xs font-black text-slate-700">€{todayStats.expense.toLocaleString('en-EU')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-slate-400" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">{getDisplayMonth()}</h2>
          </div>
          <input 
            type="month" 
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          />
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                <Sparkles size={16} className="text-blue-300" />
              </div>
              <h3 className="text-sm font-bold tracking-tight">AI বিজনেস ইন্টেলিজেন্স</h3>
            </div>
            <div className="min-h-[3rem]">
              <p className="text-xs leading-relaxed text-slate-200 font-medium">
                {aiInsight || "আপনার লেনদেনের ডাটা বিশ্লেষণ করে ব্যক্তিগত ব্যবসায়িক পরামর্শ পেতে নিচের বাটনে ক্লিক করুন।"}
              </p>
            </div>
            <button 
              onClick={handleGetAiInsight}
              disabled={isAiLoading}
              className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> অপেক্ষা করুন...
                </>
              ) : 'বিশ্লেষণ করুন'}
            </button>
          </div>
        </div>

        <DashboardCards stats={stats} />

        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> আয়-ব্যয় গ্রাফ
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase">আয়</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase">ব্যয়</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <TrendsChart transactions={filteredTransactions} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <History size={14} className="text-slate-500" /> সাম্প্রতিক লেনদেনসমূহ
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg uppercase tracking-wider">{filteredTransactions.length}টি এন্ট্রি</span>
          </div>
          <TransactionTable transactions={filteredTransactions} onDelete={deleteTransaction} />
        </section>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowForm(true)} 
        className="fixed bottom-6 right-6 w-16 h-16 bg-slate-900 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center z-40 border-4 border-white active:scale-90 transition-all hover:bg-indigo-600 shadow-indigo-200"
      >
        <PlusCircle size={28} />
      </button>

      {showSync && <SyncModal transactions={transactions} onImport={handleImportTransactions} onClose={() => setShowSync(false)} />}
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-[3rem] md:rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[95vh] animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">হিসাব যোগ করুন</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">নতুন লেনদেনের বিবরণ দিন</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
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
