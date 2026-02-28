import React from 'react';
import { Ticket, Clock, CheckCircle2, AlertCircle, ArrowRight, Users, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const StudentDashboard: React.FC = () => {
  const { systemState, passes } = useAppContext();
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const todayPass = passes.find(p => p.studentId === user?.id && p.outDate === today && p.status !== 'CANCELLED' && p.status !== 'REJECTED');
  
  const pendingCount = passes.filter(p => p.studentId === user?.id && p.status === 'PENDING').length;
  const approvedCount = passes.filter(p => p.studentId === user?.id && p.status === 'APPROVED').length;
  const remainingSlots = Math.max(0, systemState.capacity - systemState.currentCount);

  const stats = [
    { label: 'Remaining Slots', value: remainingSlots.toString(), icon: Users, color: remainingSlots > 0 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Pending Requests', value: pendingCount.toString(), icon: Clock, color: 'text-amber-500' },
    { label: 'Approved Outings', value: approvedCount.toString(), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Total Outings', value: passes.filter(p => p.studentId === user?.id).length.toString(), icon: AlertCircle, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Today's Outing Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-1 md:col-span-2 p-8 rounded-3xl shadow-sm border flex flex-col justify-between gap-6 ${
          systemState.isWindowOpen 
            ? 'bg-white border-emerald-100' 
            : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${systemState.isWindowOpen ? 'bg-emerald-500 text-white' : 'bg-zinc-400 text-white'}`}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                  Outing Window is {systemState.isWindowOpen ? 'OPEN' : 'CLOSED'}
                </h2>
                <p className="text-zinc-500 font-medium">
                  {systemState.isWindowOpen 
                    ? `Applications are being accepted. ${remainingSlots} slots remaining.`
                    : `Next window opens at ${systemState.openingTime} today.`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Capacity</p>
              <p className="text-xl font-bold text-zinc-900">{systemState.currentCount} / {systemState.capacity}</p>
            </div>
          </div>

          {!todayPass ? (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
              <p className="text-zinc-500 italic">You haven't applied for an outing today.</p>
              {systemState.isWindowOpen && (
                <Link 
                  to="/student/apply"
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  Apply Now <ArrowRight size={18} />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  todayPass.status === 'APPROVED' ? 'bg-emerald-500' : 
                  todayPass.status === 'WAITLISTED' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <p className="font-bold text-zinc-900">
                  Your pass is <span className={
                    todayPass.status === 'APPROVED' ? 'text-emerald-600' : 
                    todayPass.status === 'WAITLISTED' ? 'text-amber-600' : 'text-blue-600'
                  }>{todayPass.status}</span>
                </p>
              </div>
              <Link to="/student/passes" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                View Details <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* QR Preview Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
          {todayPass && (todayPass.status === 'APPROVED' || todayPass.status === 'OUT') ? (
            <>
              <div className="bg-white p-3 rounded-2xl mb-4 shadow-xl shadow-white/5">
                <QRCodeSVG value={todayPass.qrData || ''} size={120} />
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Pass ID</p>
              <p className="text-lg font-mono font-bold text-emerald-400">{todayPass.id}</p>
            </>
          ) : (
            <div className="relative z-10">
              <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                <Ticket size={32} className="text-zinc-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">No Active QR</h3>
              <p className="text-zinc-500 text-sm">QR code will appear here once your pass is approved.</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-zinc-50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {passes.filter(p => p.studentId === user?.id).slice(0, 3).map((pass) => (
              <div key={pass.id} className="flex items-start gap-4 pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  pass.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-600'
                }`}>
                  {pass.status === 'APPROVED' ? <CheckCircle2 size={18} /> : <Ticket size={18} />}
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Outing {pass.status.charAt(0) + pass.status.slice(1).toLowerCase()}</p>
                  <p className="text-sm text-zinc-500">Your request for {pass.reason} was {pass.status.toLowerCase()}.</p>
                  <p className="text-xs text-zinc-400 mt-1">{new Date(pass.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {passes.filter(p => p.studentId === user?.id).length === 0 && (
              <p className="text-zinc-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>

        {!todayPass && !systemState.isWindowOpen && (
          <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Missed the window?</h2>
              <p className="text-zinc-400 mb-8 max-w-xs">You didn't get a pass today. Outing registration is currently closed. Please wait for the next window.</p>
              <div className="flex items-center gap-2 text-zinc-500 text-sm italic">
                <Clock size={16} /> Window opens daily at {systemState.openingTime}
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50"></div>
          </div>
        )}

        {todayPass && (todayPass.status === 'APPROVED' || todayPass.status === 'OUT') && (
          <div className="bg-emerald-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Active Pass Found</h2>
              <p className="text-emerald-100 mb-8 max-w-xs">You have an approved outing pass for today. You can view your QR code in the "My Passes" section.</p>
              <Link 
                to="/student/passes"
                className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors inline-block"
              >
                View Pass
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
