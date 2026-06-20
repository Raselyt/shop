
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
import DollarFolderView from './components/DollarFolderView.tsx';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<TransactionType>(TransactionType.INCOME);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showSync, setShowSync] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'dollars'>('dashboard');
  
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
        if (t.category && t.category.startsWith('__CARD_GROSS:')) {
          const grossValue = parseFloat(t.category.replace('__CARD_GROSS:', '').replace('__', ''));
          return { 
            ...t, 
            type: TransactionType.CARD_PAYMENT, 
            category: 'কার্ড পেমেন্ট',
            grossAmount: grossValue 
          };
        }
        if (t.category && t.category.startsWith('__DOLLAR_BUY:')) {
          const parts = t.category.replace('__DOLLAR_BUY:', '').replace('__', '').split(':');
          const rateValue = parseFloat(parts[0] || '0');
          const usdAmount = parseFloat(parts[1] || '0');
          return {
            ...t,
            type: TransactionType.DOLLAR_BUY,
            category: 'ডলার ক্রয়',
            dollarRate: rateValue,
            dollarAmount: usdAmount
          };
        }
        if (t.category && t.category.startsWith('__DOLLAR_SELL:')) {
          const parts = t.category.replace('__DOLLAR_SELL:', '').replace('__', '').split(':');
          const rateValue = parseFloat(parts[0] || '0');
          const usdAmount = parseFloat(parts[1] || '0');
          return {
            ...t,
            type: TransactionType.DOLLAR_SELL,
            category: 'ডলার বিক্রয়',
            dollarRate: rateValue,
            dollarAmount: usdAmount
          };
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

  const addTransaction = async (tx: Transaction) => {
    if (!user) return;

    const isEditing = !!editingTransaction;
    let dbType = tx.type;
    let dbCategory = tx.category;

    if (tx.type === TransactionType.CARD_PAYMENT) {
      dbType = TransactionType.INCOME;
      dbCategory = `__CARD_GROSS:${tx.grossAmount || tx.amount}__`;
    } else if (tx.type === TransactionType.DOLLAR_BUY) {
      dbType = TransactionType.EXPENSE;
      dbCategory = `__DOLLAR_BUY:${tx.dollarRate || 0}:${tx.dollarAmount || 0}__`;
    } else if (tx.type === TransactionType.DOLLAR_SELL) {
      dbType = TransactionType.INCOME;
      dbCategory = `__DOLLAR_SELL:${tx.dollarRate || 0}:${tx.dollarAmount || 0}__`;
    }

    const dbPayload: any = {
      description: tx.description,
      amount: tx.amount,
      type: dbType,
      category: dbCategory,
      date: tx.date,
      userId: user.id
    };

    let result;
    if (isEditing && editingTransaction) {
      result = await supabase
        .from('transactions')
        .update(dbPayload)
        .eq('id', editingTransaction.id)
        .select();
    } else {
      result = await supabase.from('transactions').insert([dbPayload]).select();
    }
    
    const { data, error } = result;

    if (error) {
      alert(`ডাটা সেভ হয়নি: ${error.message}`);
    } else if (data && data.length > 0) {
      const savedRaw = data[0];
      let processedTx = { ...savedRaw };

      if (processedTx.category && processedTx.category.startsWith('__CARD_GROSS:')) {
        const grossValue = parseFloat(processedTx.category.replace('__CARD_GROSS:', '').replace('__', ''));
        processedTx.type = TransactionType.CARD_PAYMENT;
        processedTx.category = 'কার্ড পেমেন্ট';
        processedTx.grossAmount = grossValue;
      } else if (processedTx.category && processedTx.category.startsWith('__DOLLAR_BUY:')) {
        const parts = processedTx.category.replace('__DOLLAR_BUY:', '').replace('__', '').split(':');
        processedTx.type = TransactionType.DOLLAR_BUY;
        processedTx.category = 'ডলার ক্রয়';
        processedTx.dollarRate = parseFloat(parts[0] || '0');
        processedTx.dollarAmount = parseFloat(parts[1] || '0');
      } else if (processedTx.category && processedTx.category.startsWith('__DOLLAR_SELL:')) {
        const parts = processedTx.category.replace('__DOLLAR_SELL:', '').replace('__', '').split(':');
        processedTx.type = TransactionType.DOLLAR_SELL;
        processedTx.category = 'ডলার বিক্রয়';
        processedTx.dollarRate = parseFloat(parts[0] || '0');
        processedTx.dollarAmount = parseFloat(parts[1] || '0');
      }
      
      if (isEditing) {
        setTransactions(prev => prev.map(t => t.id === processedTx.id ? processedTx : t));
      } else {
        setTransactions(prev => [processedTx, ...prev]);
      }

      setShowForm(false);
      setEditingTransaction(null);
      
      const txMonth = processedTx.date.substring(0, 7);
      if (viewDate !== txMonth) setViewDate(txMonth);
      setSelectedDay(processedTx.date);
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

  const startEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormType(tx.type);
    setShowForm(true);
  };

  // Fix: Added handleLogout to resolve error on line 222
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfileMenu(false);
  };

  // Fix: Added openForm to resolve errors on lines 298 and 301
  const openForm = (type: TransactionType) => {
    setFormType(type);
    setShowForm(true);
  };

  const migrateDollarTransactions = async (updates: { id: string; type: TransactionType; category: string; description: string }[]) => {
    if (!user) return;
    setLoading(true);
    try {
      for (const update of updates) {
        let dbType = update.type === TransactionType.DOLLAR_BUY ? TransactionType.EXPENSE : TransactionType.INCOME;
        await supabase
          .from('transactions')
          .update({
            type: dbType,
            category: update.category,
            description: update.description
          })
          .eq('id', update.id);
      }
      await fetchTransactions();
    } catch (err) {
      console.error('Migration failed:', err);
      alert('মাইগ্রেশন সম্পন্ন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const dailyStats = useMemo(() => {
    const dayTx = transactions.filter(t => t.date === selectedDay);
    const cash = dayTx.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const card = dayTx.filter(t => t.type === TransactionType.CARD_PAYMENT).reduce((sum, t) => sum + t.amount, 0);
    return { cash, card, total: cash + card };
  }, [transactions, selectedDay]);

  const filteredTransactions = useMemo(() => transactions.filter(t => t.date.startsWith(viewDate)), [transactions, viewDate]);
  const cardTransactions = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.CARD_PAYMENT), [filteredTransactions]);

  const stats = useMemo(() => {
    const cashIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const cardIncome = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    
    const dollarBuyCost = filteredTransactions
      .filter(t => t.type === TransactionType.DOLLAR_BUY)
      .reduce((sum, t) => sum + t.amount, 0);

    const dollarSellRevenue = filteredTransactions
      .filter(t => t.type === TransactionType.DOLLAR_SELL)
      .reduce((sum, t) => sum + t.amount, 0);

    const dollarBoughtUsd = filteredTransactions
      .filter(t => t.type === TransactionType.DOLLAR_BUY)
      .reduce((sum, t) => sum + (t.dollarAmount || 0), 0);

    const dollarSoldUsd = filteredTransactions
      .filter(t => t.type === TransactionType.DOLLAR_SELL)
      .reduce((sum, t) => sum + (t.dollarAmount || 0), 0);

    const avgBuyRate = dollarBoughtUsd > 0 ? dollarBuyCost / dollarBoughtUsd : 0;
    const avgSellRate = dollarSoldUsd > 0 ? dollarSellRevenue / dollarSoldUsd : 0;
    const dollarTradingProfit = dollarSoldUsd > 0 ? (avgSellRate - avgBuyRate) * dollarSoldUsd : 0;

    // Normal net cash profit (income - expense) minus the dollar purchases cost as requested!
    const profit = cashIncome - totalExpense - dollarBuyCost;

    return { 
      income: cashIncome, 
      card: cardIncome, 
      expense: totalExpense, 
      profit,
      dollarBuyCost,
      dollarSellRevenue,
      dollarTradingProfit
    };
  }, [filteredTransactions, cardTransactions]);

  const getDisplayMonth = () => {
    const [y, m] = viewDate.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-slate-900 animate-spin" /></div>;
  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen pb-40 bg-slate-50 overflow-x-hidden selection:bg-blue-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 px-4 py-3 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><Wallet size={18} /></div>
            <div>
              <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">RASAL SHOP AI</h1>
              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSync(true)} className="p-2 text-slate-400 hover:text-emerald-600 transition-all"><Database size={18} /></button>
            <button onClick={fetchTransactions} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><RefreshCw size={18} /></button>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-bold border-2 border-white shadow-sm">{user.name[0].toUpperCase()}</button>
            {showProfileMenu && (
              <div className="absolute right-4 top-16 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in duration-200">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold"><LogOut size={16} /> লগআউট করুন</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden relative group transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl text-white"><Calendar size={18} /></div>
              <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">তারিখ অনুযায়ী হিসাব</h2>
                <p className="text-xs font-bold text-slate-800 mt-1">{new Date(selectedDay).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="relative">
              <input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black text-slate-600 uppercase flex items-center gap-2 pointer-events-none hover:bg-slate-100 transition-colors">তারিখ বদলান</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><CreditCard size={14} /></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">কার্ড পেমেন্ট</span>
              </div>
              <span className="text-sm font-black text-blue-600">€{dailyStats.card.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><CircleDollarSign size={14} /></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">নগদ ইনকাম</span>
              </div>
              <span className="text-sm font-black text-emerald-600">€{dailyStats.cash.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-end justify-between px-1">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><ArrowUpRight size={12} className="text-emerald-500" /> আজকের মোট ইনকাম</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">€{dailyStats.total.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner"><TrendingUp size={24} /></div>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3"><h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">মাসিক রিপোর্ট: {getDisplayMonth()}</h2></div>
          <input type="month" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none" />
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <DashboardCards stats={stats} />
            
            {stats.dollarBuyCost > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-5 rounded-3xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5"><CircleDollarSign size={15} className="text-indigo-600" /> ডলার ব্যবসা সামারি</h4>
                  <p className="text-[11px] text-indigo-800 font-bold mt-1">
                    আপনি এই মাসে মোট {filteredTransactions.filter(t => t.type === TransactionType.DOLLAR_BUY).reduce((sum, t) => sum + (t.dollarAmount || 0), 0)} ডলার কিনেছেন।
                  </p>
                </div>
                <button onClick={() => setActiveTab('dollars')} className="text-[9px] font-black bg-indigo-600 text-white uppercase tracking-widest px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition-colors">হিসাব দেখুন</button>
              </div>
            )}

            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> আয়-ব্যয় গ্রাফ</h2>
              <div className="h-64 w-full"><TrendsChart transactions={filteredTransactions.filter(t => t.type !== TransactionType.DOLLAR_BUY && t.type !== TransactionType.DOLLAR_SELL)} /></div>
            </section>
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={14} className="text-slate-500" /> সাম্প্রতিক সকল লেনদেন</h2>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{filteredTransactions.length}টি রেকর্ড</span>
              </div>
              <TransactionTable transactions={filteredTransactions} onDelete={deleteTransaction} onEdit={startEdit} />
            </section>
          </div>
        ) : activeTab === 'cards' ? (
          <div className="animate-in slide-in-from-right duration-500">
            <CardPaymentsView transactions={cardTransactions} onDelete={deleteTransaction} onEdit={startEdit} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-500">
            <DollarFolderView transactions={filteredTransactions} onDelete={deleteTransaction} onEdit={startEdit} onOpenForm={openForm} onMigrate={migrateDollarTransactions} />
          </div>
        )}
      </main>

      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40 items-end">
        {activeTab === 'dollars' ? (
          <>
            <button onClick={() => { setEditingTransaction(null); openForm(TransactionType.DOLLAR_SELL); }} className="flex items-center gap-3 bg-amber-600 text-white px-6 py-4 rounded-[1.75rem] shadow-xl hover:bg-amber-700 active:scale-95 transition-all border-4 border-white">
              <span className="text-[11px] font-black uppercase tracking-widest">ডলার বিক্রি</span><CircleDollarSign size={22} />
            </button>
            <button onClick={() => { setEditingTransaction(null); openForm(TransactionType.DOLLAR_BUY); }} className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-[1.75rem] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all border-4 border-white">
              <span className="text-[11px] font-black uppercase tracking-widest">ডলার ক্রয়</span><Plus size={22} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { setEditingTransaction(null); openForm(TransactionType.INCOME); }} className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-[1.75rem] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all border-4 border-white">
              <span className="text-[11px] font-black uppercase tracking-widest">নগদ যোগ</span><Plus size={22} />
            </button>
            <button onClick={() => { setEditingTransaction(null); openForm(TransactionType.CARD_PAYMENT); }} className="flex items-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-[1.75rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all border-4 border-white">
              <span className="text-[11px] font-black uppercase tracking-widest">কার্ড যোগ</span><CreditCard size={22} />
            </button>
          </>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-8 py-4 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-slate-900 scale-110' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} /><span className="text-[9px] font-black uppercase tracking-widest">ড্যাশবোর্ড</span>
        </button>
        <button onClick={() => setActiveTab('cards')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'cards' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
          <CreditCard size={24} /><span className="text-[9px] font-black uppercase tracking-widest">কার্ড ফোল্ডার</span>
        </button>
        <button onClick={() => setActiveTab('dollars')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dollars' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <CircleDollarSign size={24} /><span className="text-[9px] font-black uppercase tracking-widest">ডলার হিসাব</span>
        </button>
      </nav>

      {showSync && <SyncModal transactions={transactions} onImport={fetchTransactions} onClose={() => setShowSync(false)} />}
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-[3rem] md:rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[95vh] animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase">{editingTransaction ? 'হিসাব পরিবর্তন করুন' : 'হিসাব যোগ করুন'}</h2>
              <button onClick={() => { setShowForm(false); setEditingTransaction(null); }} className="text-slate-400 p-2 hover:bg-slate-50 rounded-xl transition-all"><Plus size={24} className="rotate-45" /></button>
            </div>
            <TransactionForm onAdd={addTransaction} userId={user.id} initialType={formType} initialData={editingTransaction} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
