
import React from 'react';
import { RefreshCw, Copy, Clipboard, Download, Upload } from 'lucide-react';
import { Transaction } from '../types';

interface SyncModalProps {
  transactions: Transaction[];
  onImport: (data: Transaction[]) => void;
  onClose: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ transactions, onImport, onClose }) => {
  
  // Unicode safe Base64 encoding (বাংলা অক্ষরের জন্য প্রয়োজন)
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

  // Unicode safe Base64 decoding
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

    if (!code) {
      alert('কোড তৈরি করতে সমস্যা হয়েছে।');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        alert('কোডটি ক্লিপবোর্ডে কপি করা হয়েছে। অন্য ডিভাইসে এটি পেস্ট করুন।');
      } else {
        // Fallback for browsers that don't support navigator.clipboard
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert('কোডটি কপি করা হয়েছে।');
      }
    } catch (err) {
      alert('কপি করা সম্ভব হয়নি। ম্যানুয়ালি ফাইল ব্যাকআপ ব্যবহার করুন।');
    }
  };

  const handleImportCode = () => {
    const code = prompt('আপনার সিঙ্ক কোডটি এখানে পেস্ট করুন:');
    if (!code || code.trim() === "") return;
    
    try {
      const decodedStr = fromBase64(code.trim());
      if (!decodedStr) throw new Error('Invalid base64');
      
      const decoded = JSON.parse(decodedStr);
      if (Array.isArray(decoded)) {
        if (window.confirm(`${decoded.length}টি হিসাব পাওয়া গেছে। আপনি কি এগুলো ইমপোর্ট করতে চান?`)) {
          onImport(decoded);
          alert('সফলভাবে ইমপোর্ট হয়েছে!');
        }
      } else {
        throw new Error('Invalid data format');
      }
    } catch (e) {
      alert('ভুল কোড দেওয়া হয়েছে। দয়া করে সঠিক কোডটি কপি করে আনুন।');
      console.error('Import error:', e);
    }
  };

  const handleDownloadFile = () => {
    if (transactions.length === 0) {
      alert('ডাউনলোড করার জন্য কোনো ডাটা নেই।');
      return;
    }
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopBackup_${new Date().toISOString().split('T')[0]}.json`;
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
          alert('ফাইল থেকে ডাটা সফলভাবে নেওয়া হয়েছে!');
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        alert('ফাইলের ফরম্যাট সঠিক নয়। শুধুমাত্র .json ফাইল আপলোড করুন।');
      }
    };
    reader.readAsText(file);
    // Reset input value to allow uploading same file again
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-50 p-6 rounded-3xl">
            <RefreshCw size={48} className="text-emerald-500" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tighter">ডাটা সিঙ্কিং</h2>
          <p className="text-slate-500 text-sm px-4">
            অন্য ডিভাইসে আপনার সব হিসাব ট্রান্সফার করার জন্য নিচের অপশনগুলো ব্যবহার করুন।
          </p>
        </div>

        {/* Option 1: Code */}
        <div className="space-y-3 mb-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">অপশন ১: কোড ব্যবহার করুন</p>
          <button 
            onClick={handleExportCode}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-200"
          >
            <Copy size={20} />
            কোড কপি করুন (Export)
          </button>
          <button 
            onClick={handleImportCode}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Clipboard size={20} />
            কোড পেস্ট করুন (Import)
          </button>
        </div>

        {/* Option 2: File */}
        <div className="space-y-3 mb-10 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">অপশন ২: ফাইল ব্যাকআপ (বেশি নিরাপদ)</p>
          <button 
            onClick={handleDownloadFile}
            className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
          >
            <Download size={20} />
            ফাইল ডাউনলোড করুন
          </button>
          <label className="w-full bg-[#f0fdf4] hover:bg-[#dcfce7] text-emerald-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer">
            <Upload size={20} />
            ফাইল আপলোড করুন
            <input type="file" accept=".json" onChange={handleUploadFile} className="hidden" />
          </label>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button 
            onClick={onClose}
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2 px-4"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
