
import React from 'react';
import { RefreshCw, Copy, Clipboard, Download, Upload } from 'lucide-react';
import { Transaction } from '../types';

interface SyncModalProps {
  transactions: Transaction[];
  onImport: (data: Transaction[]) => void;
  onClose: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ transactions, onImport, onClose }) => {
  
  const toBase64 = (str: string) => {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      console.error('Encoding error:', e);
      return null;
    }
  };

  const fromBase64 = (str: string) => {
    try {
      return decodeURIComponent(atob(str).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      console.error('Decoding error:', e);
      return null;
    }
  };

  const handleExportCode = async () => {
    if (transactions.length === 0) {
      alert('কপি করার জন্য কোনো ডাটা নেই।');
      return;
    }
    const jsonStr = JSON.stringify(transactions);
    const code = toBase64(jsonStr);
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      alert('কোডটি কপি করা হয়েছে।');
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert('কোডটি কপি করা হয়েছে।');
    }
  };

  const handleImportCode = () => {
    const code = prompt('আপনার সিঙ্ক কোডটি এখানে পেস্ট করুন:');
    if (!code || code.trim() === "") return;
    
    try {
      const decodedStr = fromBase64(code.trim());
      if (!decodedStr) throw new Error('Invalid data');
      const decoded = JSON.parse(decodedStr);
      if (Array.isArray(decoded)) {
        if (window.confirm(`${decoded.length}টি হিসাব ইমপোর্ট করতে চান?`)) {
          onImport(decoded);
        }
      }
    } catch (e) {
      alert('ভুল কোড দেওয়া হয়েছে।');
    }
  };

  const handleDownloadFile = () => {
    if (transactions.length === 0) {
      alert('কোনো ডাটা নেই।');
      return;
    }
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopBackup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const decoded = JSON.parse(result);
        if (Array.isArray(decoded)) {
          onImport(decoded);
        }
      } catch (err) {
        alert('সঠিক ফাইল নয়।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 my-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-50 p-5 rounded-3xl text-emerald-500">
            <RefreshCw size={40} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">ডাটা সিঙ্কিং</h2>
          <p className="text-slate-500 text-xs mt-2 px-2">অন্য ডিভাইসে আপনার সব হিসাব ট্রান্সফার করুন।</p>
        </div>

        <div className="space-y-3 mb-6">
          <button onClick={handleExportCode} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Copy size={18} /> কোড কপি করুন
          </button>
          <button onClick={handleImportCode} className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Clipboard size={18} /> কোড পেস্ট করুন
          </button>
        </div>

        <div className="space-y-3 mb-8 pt-4 border-t border-slate-100">
          <button onClick={handleDownloadFile} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Download size={18} /> ফাইল ডাউনলোড
          </button>
          <label className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <Upload size={18} /> ফাইল আপলোড
            <input type="file" accept=".json" onChange={handleUploadFile} className="hidden" />
          </label>
        </div>

        <button onClick={onClose} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors">
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
};

export default SyncModal;
