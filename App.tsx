
import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Transaction, TransactionType, User } from './types';
import TransactionForm from './components/TransactionForm';
import DashboardCards from './components/DashboardCards';
import TrendsChart from './components/TrendsChart';
import TransactionTable from './components/TransactionTable';
import SyncModal from './components/SyncModal';
import AuthScreen from './components/AuthScreen';
import AIService from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Load user from session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('shop_ai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load transactions based on logged in user
  useEffect(() => {
    if (user) {
      const allData = localStorage.getItem('shop_ai_cloud_data');
      if (allData) {
        const parsed = JSON.parse(allData);
        // Filter transactions strictly for this user's ID
        const userTxs = parsed.filter((t: Transaction) => t.userId === user.id);
        setTransactions(userTxs);
      }
    } else {
      setTransactions([]);
    }
  }, [user]);

  const saveToCloud = (newTransactions: Transaction[]) => {
    if (!user) return;
    
    // Simulate cloud storage in LocalStorage
    const allData = JSON.parse(localStorage.getItem('shop_ai_cloud_data') || '[]');
    // Keep data of other users, replace only current user's data
    const otherUsersData = allData.filter((t: Transaction) => t.userId !== user.id);
    const updatedData = [...otherUsersData, ...newTransactions];
    
    localStorage.setItem('shop_ai_cloud_data', JSON.stringify(updatedData));
    setTransactions(newTransactions);
  };

  const handleLogin = (newUser: User) => {
    localStorage.setItem('shop_ai_user', JSON.stringify(newUser));
    setUser(newUser);
    // Refresh date to current month on login
    const now = new Date();
    setViewDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleLogout = () => {
    // Clear all states and local storage for current session
    localStorage.removeItem('shop_ai_user');
    setUser(null);
    setTransactions([]);
    setAiInsight(null);
    setShowProfileMenu(false);
    setShowForm(false);
    setShowSync(false);
  };

  const addTransaction = (newTx: Transaction) => {
    if (!user) return;
    const txWithUser = { ...newTx, userId: user.id };
    saveToCloud([txWithUser, ...transactions]);
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('এই হিসাবটি মুছে ফেলতে চান?')) {
      const updated = transactions.filter(t => t.id !== id);
      saveToCloud(updated);
    }
  };

  const handleImportData = (newData: Transaction[]) => {
    if (user) {
      const txsWithId = newData.map(t => ({ ...t, userId: user.id }));
      saveToCloud(txsWithId);
      setShowSync(false);
    }
  };

  const handleGetAiInsight = async () => {
    if (filteredTransactions.length === 0) {
      setAiInsight("এই মাসে কোনো ডাটা নেই।");
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
              <h1 className="text-xs font-black text-slate-900 uppercase tracking-tighter">SHOP AI SYNC</h1>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                Connected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSync(true)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
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
                <span className="text-[10px] font-bold text-slate-700 hidden sm:inline">{user.name}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">ইউজার ইমেইল</p>
                      <p className="text-[11px] font-bold text-slate-800 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
                    >
                      <LogOut size={16} />
                      লগআউট করুন
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Month Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">{getDisplayMonth()}</h2>
          </div>
          <input 
            type="month" 
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* AI Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Sparkles size={16} className="text-blue-300" />
              </div>
              <h3 className="text-sm font-bold">AI বিজনেস ইনসাইট</h3>
            </div>
            
            {aiInsight ? (
              <p className="text-xs leading-relaxed text-slate-200 animate-in fade-in slide-in-from-left duration-300">
                {aiInsight}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">এই মাসের হিসাব বিশ্লেষণ করতে বাটনটি চাপুন</p>
            )}

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
            <TrendingUp size={14} className="text-emerald-500" />
            প্রবৃদ্ধি গ্রাফ
          </h2>
          <div className="h-64 w-full">
            <TrendsChart transactions={filteredTransactions} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History size={14} className="text-slate-500" />
            লেনদেনসমূহ
          </h2>
          <TransactionTable transactions={filteredTransactions} onDelete={deleteTransaction} />
        </section>
      </main>

      <button 
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 z-40 border-4 border-white"
      >
        <PlusCircle size={24} />
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-[3rem] md:rounded-[2.5rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">নতুন হিসাব যোগ করুন</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <PlusCircle size={24} className="rotate-45" />
              </button>
            </div>
            <TransactionForm onAdd={addTransaction} userId={user.id} />
          </div>
        </div>
      )}

      {showSync && (
        <SyncModal 
          transactions={transactions} 
          onImport={handleImportData} 
          onClose={() => setShowSync(false)} 
        />
      )}
    </div>
  );
};

export default App;
