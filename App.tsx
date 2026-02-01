
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
  Loader2,
  Database,
  LayoutDashboard,
  CreditCard,
  Plus,
  ArrowUpRight,
  CircleDollarSign
} from 'lucide-react';
import { Transaction, TransactionType, User } from './types.ts';
import TransactionForm from './components/TransactionForm.tsx';
import DashboardCards from './components/DashboardCards.tsx';
import TrendsChart from './components/TrendsChart.tsx';
import TransactionTable from './components/TransactionTable.tsx';
import SyncModal from './components/SyncModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AIService from './services/geminiService.ts';
import CardPaymentsView from './components/CardPaymentsView.tsx';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<TransactionType>(TransactionType.INCOME);
  const [showSync, setShowSync] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().split('T')[0]);

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
      const mappedData = (data || []).map(t => {
        if (t.type === 'Income' && t.category === '__CARD__') {
          return { ...t, type: TransactionType.CARD_PAYMENT, category: 'কার্ড পেমেন্ট' };
        }
        return t;
      });
      setTransactions(mappedData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, fetchTransactions]);

  const addTransaction = async (newTx: Transaction) => {
    if (!user) return;

    const dbPayload = { ...newTx };
    if (dbPayload.type === TransactionType.CARD_PAYMENT) {
      // @ts-ignore
      dbPayload.type = 'Income'; 
      dbPayload.category = '__CARD__'; 
    }

    const { data, error } = await supabase.from('transactions').insert([dbPayload]).select();
    
    if (error) {
      alert(`ডাটা সেভ হয়নি: ${error.message}`);
    } else if (data && data.length > 0) {
      const savedTx = data[0];
      if (savedTx.type === 'Income' && savedTx.category === '__CARD__') {
        savedTx.type = TransactionType.CARD_PAYMENT;
        savedTx.category = 'কার্ড পেমেন্ট';
      }
      
      setTransactions(prev => [savedTx, ...prev]);
      setShowForm(false);
      
      const txMonth = savedTx.date.substring(0, 7);
      if (viewDate !== txMonth) {
        setViewDate(txMonth);
      }
      setSelectedDay(savedTx.date);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!id) return;
    if (window.confirm('আপনি কি নিশ্চিত যে এই হিসাবটি মুছে ফেলবেন?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('userId', user?.id);
      if (error) alert(`মুছে ফেলা যায়নি।`);
      else setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const dailyStats = useMemo(() => {
    const dayTx = transactions.filter(t => t.date === selectedDay);
    const cash = dayTx
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const card = dayTx
      .filter(t => t.type === TransactionType.CARD_PAYMENT)
      .reduce((sum, t) => sum + t.amount, 0);
    return { cash, card, total: cash + card };
  }, [transactions, selectedDay]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(viewDate));
  }, [transactions, viewDate]);

  const cardTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.type === TransactionType.CARD_PAYMENT);
  }, [filteredTransactions]);

  const stats = useMemo(() => {
    const cashIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const cardIncome = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    const cashProfit = cashIncome - totalExpense;
    return { income: cashIncome, card: cardIncome, expense: totalExpense, profit: cashProfit };
  }, [filteredTransactions, cardTransactions]);

  const getDisplayMonth = () => {
    const [y, m] = viewDate.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
  };

  const getDisplayDay = () => {
    return new Date(selectedDay).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const openForm = (type: TransactionType) => {
    setFormType(type);
    setShowForm(true);
  };

  // Fixed handleLogin: Update user state when AuthScreen signals successful authentication
  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
  };

  // Fixed handleLogout: Sign out via Supabase and clear local state
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      setTransactions([]);
      setShowProfileMenu(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
    </div>
  );

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-40 bg-slate-50 overflow-x-hidden selection:bg-blue-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 px-4 py-3 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
              <Wallet size={18} />
            </div>
            <div>
              <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">RASAL SHOP AI</h1>
              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSync(true)} className="p-2 text-slate-400 hover:text-emerald-600 transition-all"><Database size={18} /></button>
            <button onClick={fetchTransactions} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><RefreshCw size={18} /></button>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-bold border-2 border-white shadow-sm">
              {user.name[0].toUpperCase()}
            </button>
            {showProfileMenu && (
              <div className="absolute right-4 top-16 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in duration-200">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold">
                  <LogOut size={16} /> লগআউট করুন
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* আজকের ইনকাম ডিসপ্লে কার্ড - ব্রেকডাউন সহ */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden relative group transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl text-white">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">তারিখ অনুযায়ী হিসাব</h2>
                <p className="text-xs font-bold text-slate-800 mt-1">{getDisplayDay()}</p>
              </div>
            </div>
            <div className="relative">
              <input 
                type="date" 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)} 
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" 
              />
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black text-slate-600 uppercase flex items-center gap-2 pointer-events-none hover:bg-slate-100 transition-colors">
                তারিখ বদলান
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <CreditCard size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">কার্ড পেমেন্ট</span>
              </div>
              <span className="text-sm font-black text-blue-600">€{dailyStats.card.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CircleDollarSign size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">নগদ ইনকাম</span>
              </div>
              <span className="text-sm font-black text-emerald-600">€{dailyStats.cash.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-end justify-between px-1">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <ArrowUpRight size={12} className="text-emerald-500" /> আজকের মোট ইনকাম
                </p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">€{dailyStats.total.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">মাসিক রিপোর্ট: {getDisplayMonth()}</h2>
          </div>
          <input type="month" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none" />
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <DashboardCards stats={stats} />

            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" /> আয়-ব্যয় গ্রাফ
              </h2>
              <div className="h-64 w-full"><TrendsChart transactions={filteredTransactions} /></div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-slate-500" /> সাম্প্রতিক সকল লেনদেন
                </h2>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{filteredTransactions.length}টি রেকর্ড</span>
              </div>
              <TransactionTable transactions={filteredTransactions} onDelete={deleteTransaction} />
            </section>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-500">
            <CardPaymentsView transactions={cardTransactions} onDelete={deleteTransaction} />
          </div>
        )}
      </main>

      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40 items-end">
        <button 
          onClick={() => openForm(TransactionType.INCOME)} 
          className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-[1.75rem] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all border-4 border-white"
        >
          <span className="text-[11px] font-black uppercase tracking-widest">নগদ যোগ</span>
          <Plus size={22} />
        </button>
        <button 
          onClick={() => openForm(TransactionType.CARD_PAYMENT)} 
          className="flex items-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-[1.75rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all border-4 border-white"
        >
          <span className="text-[11px] font-black uppercase tracking-widest">কার্ড যোগ</span>
          <CreditCard size={22} />
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-8 py-4 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-slate-900 scale-110' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">ড্যাশবোর্ড</span>
        </button>
        <button onClick={() => setActiveTab('cards')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'cards' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
          <CreditCard size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">কার্ড ফোল্ডার</span>
        </button>
      </nav>

      {showSync && <SyncModal transactions={transactions} onImport={fetchTransactions} onClose={() => setShowSync(false)} />}
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-[3rem] md:rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[95vh] animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase">হিসাব যোগ করুন</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-xl transition-all"><Plus size={24} className="rotate-45" /></button>
            </div>
            <TransactionForm onAdd={addTransaction} userId={user.id} initialType={formType} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
