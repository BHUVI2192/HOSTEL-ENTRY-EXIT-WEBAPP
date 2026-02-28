import React from 'react';
import { Users, Clock, CheckCircle2, XCircle, Power } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const WardenDashboard: React.FC = () => {
  const { systemState, toggleWindow, passes, updatePassStatus, setCapacity } = useAppContext();

  const today = new Date().toISOString().split('T')[0];
  const todayPasses = [...passes]
    .filter(p => p.outDate === today)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const pendingPasses = passes.filter(p => p.status === 'PENDING');
  const approvedToday = passes.filter(p => p.status === 'APPROVED' && p.outDate === today).length;
  const currentlyOut = passes.filter(p => p.status === 'OUT').length;
  const rejectedToday = passes.filter(p => p.status === 'REJECTED').length;

  const stats = [
    { label: 'Pending Requests', value: pendingPasses.length.toString(), icon: Clock, color: 'text-amber-500' },
    { label: 'Approved Today', value: approvedToday.toString(), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Currently Out', value: currentlyOut.toString(), icon: Users, color: 'text-blue-500' },
    { label: 'Rejected Today', value: rejectedToday.toString(), icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-zinc-900">Outing Window Control</h2>
          <p className="text-sm text-zinc-500">Current status: {systemState.isWindowOpen ? 'Accepting Applications' : 'Window Closed'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-zinc-400 uppercase">Capacity</label>
            <input 
              type="number" 
              value={systemState.capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 rounded-lg border border-zinc-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          
          <div className="text-right hidden md:block border-l border-zinc-100 pl-6">
            <p className="text-xs font-bold text-zinc-400 uppercase">Current Count</p>
            <p className="text-sm font-bold text-zinc-900">{systemState.currentCount} / {systemState.capacity}</p>
          </div>

          <button 
            onClick={toggleWindow}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              systemState.isWindowOpen 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <Power size={20} />
            {systemState.isWindowOpen ? 'Close Window' : 'Open Window'}
          </button>
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

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Today's Outing Requests (FCFS Order)</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 italic">Sorted by submission time</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-16">S.No</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {todayPasses.map((pass, index) => (
                <tr key={pass.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-400">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-bold">
                        {pass.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{pass.studentName}</p>
                        <p className="text-xs text-zinc-500">ID: {pass.regNo} • Room: {pass.roomNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 truncate max-w-[200px]">{pass.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      pass.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                      pass.status === 'WAITLISTED' ? 'bg-amber-100 text-amber-700' : 
                      pass.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                      pass.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {pass.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {new Date(pass.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {(pass.status === 'PENDING' || pass.status === 'WAITLISTED') && (
                        <>
                          <button 
                            onClick={() => updatePassStatus(pass.id, 'APPROVED')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => updatePassStatus(pass.id, 'REJECTED')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {pass.status === 'APPROVED' && (
                        <button 
                          onClick={() => updatePassStatus(pass.id, 'REJECTED')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      {(pass.status === 'OUT' || pass.status === 'RETURNED' || pass.status === 'CANCELLED') && (
                        <span className="text-xs text-zinc-400 italic">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {todayPasses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <Users size={40} className="opacity-20" />
                      <p>No outing requests for today yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
