import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ApplyOuting: React.FC = () => {
  const { applyForOuting, systemState } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reason: '',
    destination: '',
    outDate: new Date().toISOString().split('T')[0],
  });

  if (!systemState.isWindowOpen) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Registration Closed</h2>
          <p className="text-zinc-500 mb-8">The outing registration window is currently closed. Please check back later.</p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim() || !formData.destination.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.reason.length < 10) {
      toast.error("Please provide a more detailed reason (min 10 characters).");
      return;
    }

    applyForOuting({
      studentId: user?.id || 'unknown',
      studentName: user?.name || 'Unknown Student',
      regNo: user?.regNo || 'N/A',
      roomNo: user?.roomNo || 'N/A',
      reason: `${formData.reason} (Destination: ${formData.destination})`,
      outDate: formData.outDate,
      requestedOutTime: "after 5 PM", // Fixed for now as per requirements
    });

    navigate('/student/passes');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <h2 className="text-2xl font-bold text-zinc-900 mb-8">Outing Application Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Full Name</label>
              <input 
                type="text" 
                value={user?.name || ''} 
                disabled
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Registration / USN</label>
              <input 
                type="text" 
                value={user?.regNo || ''} 
                disabled
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Room Number</label>
              <input 
                type="text" 
                value={user?.roomNo || ''} 
                disabled
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Outing Date</label>
              <input 
                type="date" 
                value={formData.outDate}
                onChange={(e) => setFormData({ ...formData, outDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Out Time</label>
            <input 
              type="text" 
              value="after 5 PM" 
              disabled
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Destination</label>
            <input 
              type="text" 
              placeholder="Where are you going?"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Reason for Outing</label>
            <textarea 
              rows={4}
              placeholder="Please provide a detailed reason..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyOuting;
