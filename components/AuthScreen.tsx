
import React, { useState } from 'react';
import { User } from '../types';
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ইমেইল থেকে স্পেস কমানো এবং ছোট হাতের অক্ষরে রূপান্তর (মোবাইলের জন্য অত্যন্ত গুরুত্বপূর্ণ)
    const cleanedEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password: password,
        });

        if (authError) {
          if (authError.message.includes('Email not confirmed')) {
            throw new Error('আপনার ইমেইলটি এখনও কনফার্ম করা হয়নি। দয়া করে আপনার ইনবক্স চেক করুন।');
          }
          throw authError;
        }

        if (data.user) {
          onLogin({
            id: data.user.id,
            name: data.user.user_metadata.name || cleanedEmail.split('@')[0],
            email: data.user.email || '',
          });
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanedEmail,
          password: password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (authError) throw authError;

        if (data.user) {
          alert('একাউন্ট তৈরি হয়েছে! এখন লগইন করুন।');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' 
        ? 'ভুল ইমেইল অথবা পাসওয়ার্ড দেওয়া হয়েছে।' 
        : err.message || 'অথেনটিকেশন সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <div className="inline-flex bg-slate-900 p-4 rounded-[2rem] text-white shadow-2xl mb-6 transform -rotate-6">
            <Wallet size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Shop AI Sync</h1>
          <p className="text-slate-500 text-sm font-medium">সুপারবেজ পাওয়ারড বিজনেস খাতা</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 p-8">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              লগইন
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              নতুন একউন্ট
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="আপনার নাম" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  required
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="ইমেইল অ্যাড্রেস" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                autoComplete="email"
                spellCheck="false"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="পাসওয়ার্ড" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'অ্যাপে প্রবেশ করুন' : 'তৈরি করুন')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <p className="text-[10px] font-bold uppercase tracking-wider">Secure Supabase Login</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
