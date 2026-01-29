
import React, { useState } from 'react';
import { User } from '../types';
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // সিমুলেটেড অথেনটিকেশন
    // বাস্তব ক্ষেত্রে এখানে API Call (Firebase/Node.js) হবে
    const mockUser: User = {
      id: btoa(email), // সিম্পল আইডি জেনারেশন
      name: isLogin ? (email.split('@')[0]) : name,
      email: email,
    };

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex bg-slate-900 p-4 rounded-[2rem] text-white shadow-2xl mb-6 transform -rotate-6">
            <Wallet size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Shop AI Sync</h1>
          <p className="text-slate-500 text-sm font-medium">আপনার ব্যবসার বিশ্বস্ত ডিজিটাল খাতা</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 p-8">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              লগইন
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              নতুন একাউন্ট
            </button>
          </div>

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
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="পাসওয়ার্ড" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              {isLogin ? 'অ্যাপে প্রবেশ করুন' : 'একাউন্ট তৈরি করুন'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <p className="text-[10px] font-bold uppercase tracking-wider">Cloud Encrypted & Secure</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
