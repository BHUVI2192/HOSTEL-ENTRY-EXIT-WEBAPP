import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, QrCode, User, MapPin, Clock, CheckCircle2, XCircle, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const GuardScanner: React.FC = () => {
  const { passes, scanPass } = useAppContext();
  const [searchId, setSearchId] = useState('');
  const [scannedPass, setScannedPass] = useState<any>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const pass = passes.find(p => p.id === searchId.toUpperCase());
    if (pass) {
      setScannedPass(pass);
    } else {
      toast.error("Pass not found. Please check the ID.");
      setScannedPass(null);
    }
  };

  const handleScanAction = (type: 'EXIT' | 'ENTRY') => {
    if (!scannedPass) return;
    
    // Validation
    if (type === 'EXIT' && scannedPass.status !== 'APPROVED') {
      toast.error(`Cannot mark exit. Pass status is ${scannedPass.status}`);
      return;
    }
    if (type === 'ENTRY' && scannedPass.status !== 'OUT') {
      toast.error("Student must be marked 'OUT' before marking entry.");
      return;
    }

    scanPass(scannedPass.id, type);
    // Refresh local state
    const updatedPass = { 
      ...scannedPass, 
      status: type === 'EXIT' ? 'OUT' : 'RETURNED',
      outScanned: type === 'EXIT' ? true : scannedPass.outScanned,
      outScannedAt: type === 'EXIT' ? new Date().toISOString() : scannedPass.outScannedAt,
      inScanned: type === 'ENTRY' ? true : scannedPass.inScanned,
      inScannedAt: type === 'ENTRY' ? new Date().toISOString() : scannedPass.inScannedAt
    };
    setScannedPass(updatedPass);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-zinc-900 text-white">
            <QrCode size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Gate Scanner</h2>
            <p className="text-zinc-500">Enter Pass ID or scan QR code to verify student outing</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Enter Pass ID (e.g. AB123CD45)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-14 pr-32 py-5 rounded-2xl border-2 border-zinc-100 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all text-lg font-mono uppercase"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={24} />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
          >
            Verify
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {scannedPass ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-zinc-900">{scannedPass.studentName}</h3>
                      <p className="text-zinc-500 font-medium">ID: {scannedPass.regNo} • Room: {scannedPass.roomNo}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                    scannedPass.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    scannedPass.status === 'OUT' ? 'bg-red-100 text-red-700' :
                    scannedPass.status === 'RETURNED' ? 'bg-blue-100 text-blue-700' :
                    'bg-zinc-100 text-zinc-600'
                  }`}>
                    {scannedPass.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-zinc-100">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Outing Date</p>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <Clock size={16} className="text-zinc-400" />
                      {scannedPass.outDate}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Requested Time</p>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <Clock size={16} className="text-zinc-400" />
                      {scannedPass.requestedOutTime}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Reason & Destination</p>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-700 leading-relaxed">
                    {scannedPass.reason}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">Scan History</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${scannedPass.outScanned ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-400'}`}>
                        <LogOut size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Exit Scan</p>
                        <p className="text-sm text-zinc-500">
                          {scannedPass.outScanned 
                            ? `Recorded at ${new Date(scannedPass.outScannedAt).toLocaleTimeString()}` 
                            : 'Not scanned yet'}
                        </p>
                      </div>
                    </div>
                    {scannedPass.outScanned && <CheckCircle2 className="text-emerald-500" size={20} />}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${scannedPass.inScanned ? 'bg-blue-50 text-blue-600' : 'bg-zinc-50 text-zinc-400'}`}>
                        <LogIn size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Entry Scan</p>
                        <p className="text-sm text-zinc-500">
                          {scannedPass.inScanned 
                            ? `Recorded at ${new Date(scannedPass.inScannedAt).toLocaleTimeString()}` 
                            : 'Not scanned yet'}
                        </p>
                      </div>
                    </div>
                    {scannedPass.inScanned && <CheckCircle2 className="text-blue-500" size={20} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">Actions</h3>
                <div className="space-y-4">
                  <button 
                    disabled={scannedPass.outScanned || scannedPass.status !== 'APPROVED'}
                    onClick={() => handleScanAction('EXIT')}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all ${
                      scannedPass.outScanned || scannedPass.status !== 'APPROVED'
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                    }`}
                  >
                    <LogOut size={20} />
                    Mark Exit
                  </button>
                  <button 
                    disabled={!scannedPass.outScanned || scannedPass.inScanned || scannedPass.status !== 'OUT'}
                    onClick={() => handleScanAction('ENTRY')}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all ${
                      !scannedPass.outScanned || scannedPass.inScanned || scannedPass.status !== 'OUT'
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                    }`}
                  >
                    <LogIn size={20} />
                    Mark Entry
                  </button>
                </div>
                
                <div className="mt-8 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-zinc-400 shrink-0" size={18} />
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Verify student ID card against pass details before marking exit or entry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Search className="text-zinc-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-zinc-400">No Pass Scanned</h3>
            <p className="text-zinc-400 max-w-xs mx-auto mt-2">Enter a Pass ID above to view student details and record gate activity.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AlertCircle: React.FC<{ className?: string, size?: number }> = ({ className, size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default GuardScanner;
