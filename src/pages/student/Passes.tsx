import React, { useState } from 'react';
import { Ticket, Calendar, Clock, ChevronRight, X, QrCode as QrIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

const MyPasses: React.FC = () => {
  const { passes, updatePassStatus } = useAppContext();
  const { user } = useAuth();
  const [selectedPass, setSelectedPass] = useState<string | null>(null);

  const studentPasses = passes.filter(p => p.studentId === user?.id);
  const activePass = studentPasses.find(p => p.id === selectedPass);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'OUT': return 'bg-blue-100 text-blue-700';
      case 'RETURNED': return 'bg-zinc-100 text-zinc-600';
      case 'CANCELLED': return 'bg-zinc-100 text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">My Outing Passes</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {studentPasses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-zinc-200 text-center">
            <Ticket size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">You haven't applied for any outings yet.</p>
          </div>
        ) : (
          studentPasses.map((pass) => (
            <div 
              key={pass.id} 
              onClick={() => setSelectedPass(pass.id)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Ticket size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{pass.reason}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Calendar size={14} />
                      {pass.outDate}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock size={14} />
                      {pass.requestedOutTime}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {pass.outScanned ? (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                        Exited: {new Date(pass.outScannedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-wider border border-zinc-100">
                        Not yet exited
                      </span>
                    )}
                    {pass.inScanned ? (
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                        Returned: {new Date(pass.inScannedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : pass.outScanned ? (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                        Out - not returned
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(pass.status)}`}>
                  {pass.status}
                </span>
                <ChevronRight className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {activePass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPass(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Outing Pass Details</h3>
                <button onClick={() => setSelectedPass(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 flex flex-col items-center text-center">
                {activePass.status === 'APPROVED' || activePass.status === 'OUT' ? (
                  <>
                    <div className="p-4 bg-white border-4 border-emerald-500 rounded-3xl mb-6 shadow-xl shadow-emerald-500/10">
                      <QRCodeSVG value={activePass.qrData || ''} size={200} />
                    </div>
                    <div className="space-y-1 mb-8">
                      <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Pass ID</p>
                      <p className="text-2xl font-mono font-bold text-zinc-900">{activePass.id}</p>
                    </div>
                  </>
                ) : (
                  <div className="py-12">
                    <QrIcon size={64} className="mx-auto text-zinc-200 mb-4" />
                    <p className="text-zinc-500">QR Code is only available for approved passes.</p>
                  </div>
                )}

                <div className="w-full grid grid-cols-2 gap-4 text-left bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase">Student</p>
                    <p className="text-sm font-bold text-zinc-900">{activePass.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase">Status</p>
                    <p className={`text-sm font-bold ${getStatusColor(activePass.status).split(' ')[1]}`}>{activePass.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Reason</p>
                    <p className="text-sm font-bold text-zinc-900">{activePass.reason}</p>
                  </div>
                </div>

                {activePass.status === 'APPROVED' && (
                  <button 
                    onClick={() => {
                      updatePassStatus(activePass.id, 'CANCELLED');
                      setSelectedPass(null);
                    }}
                    className="w-full py-4 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors border border-red-100"
                  >
                    Cancel Outing
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPasses;
