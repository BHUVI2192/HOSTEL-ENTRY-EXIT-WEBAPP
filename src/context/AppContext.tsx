import React, { createContext, useContext, useState, useEffect } from 'react';
import { OutingPass, SystemState } from '../types';
import { toast } from 'sonner';

interface AppContextType {
  passes: OutingPass[];
  systemState: SystemState;
  applyForOuting: (passData: Omit<OutingPass, 'id' | 'status' | 'createdAt' | 'qrData' | 'outScanned' | 'inScanned'>) => void;
  updatePassStatus: (passId: string, status: OutingPass['status']) => void;
  scanPass: (passId: string, type: 'EXIT' | 'ENTRY') => void;
  toggleWindow: () => void;
  setCapacity: (capacity: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [passes, setPasses] = useState<OutingPass[]>(() => {
    const saved = localStorage.getItem('gatepass_passes');
    return saved ? JSON.parse(saved) : [];
  });

  const [systemState, setSystemState] = useState<SystemState>(() => {
    const saved = localStorage.getItem('gatepass_system');
    return saved ? JSON.parse(saved) : {
      isWindowOpen: true,
      capacity: 60,
      currentCount: 0,
      openingTime: "17:00"
    };
  });

  useEffect(() => {
    localStorage.setItem('gatepass_passes', JSON.stringify(passes));
    // Update current count based on approved/out passes for today
    const today = new Date().toISOString().split('T')[0];
    const count = passes.filter(p => p.outDate === today && (p.status === 'APPROVED' || p.status === 'OUT')).length;
    setSystemState(prev => ({ ...prev, currentCount: count }));
  }, [passes]);

  useEffect(() => {
    localStorage.setItem('gatepass_system', JSON.stringify(systemState));
  }, [systemState]);

  const applyForOuting = (passData: Omit<OutingPass, 'id' | 'status' | 'createdAt' | 'qrData' | 'outScanned' | 'inScanned'>) => {
    if (!systemState.isWindowOpen) {
      toast.error("Outing window is currently closed.");
      return;
    }

    // Check current approved count for the requested date
    const approvedCount = passes.filter(p => p.outDate === passData.outDate && (p.status === 'APPROVED' || p.status === 'OUT')).length;
    
    const status: OutingPass['status'] = approvedCount < systemState.capacity ? 'APPROVED' : 'WAITLISTED';

    const newPass: OutingPass = {
      ...passData,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      status,
      createdAt: new Date().toISOString(),
      outScanned: false,
      inScanned: false,
    };
    
    // Generate QR data
    newPass.qrData = JSON.stringify({
      studentId: newPass.studentId,
      passId: newPass.id,
      expiry: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
    });

    setPasses(prev => [newPass, ...prev]);
    
    if (status === 'APPROVED') {
      toast.success("Outing application submitted and approved!");
    } else {
      toast.warning("Capacity reached. You have been placed on the WAITLIST.");
    }
  };

  const updatePassStatus = (passId: string, status: OutingPass['status']) => {
    setPasses(prev => {
      const updated = prev.map(p => p.id === passId ? { ...p, status } : p);
      
      // If a pass was cancelled or rejected, check if we can approve a waitlisted student
      if (status === 'CANCELLED' || status === 'REJECTED') {
        const cancelledPass = prev.find(p => p.id === passId);
        if (cancelledPass && (cancelledPass.status === 'APPROVED' || cancelledPass.status === 'PENDING')) {
          // Find the oldest waitlisted pass for the same date
          const waitlisted = [...updated]
            .filter(p => p.outDate === cancelledPass.outDate && p.status === 'WAITLISTED')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          if (waitlisted.length > 0) {
            const nextPassId = waitlisted[0].id;
            toast.info(`Waitlisted student ${waitlisted[0].studentName} has been approved!`);
            return updated.map(p => p.id === nextPassId ? { ...p, status: 'APPROVED' as const } : p);
          }
        }
      }
      return updated;
    });
    toast.info(`Pass ${passId} status updated to ${status}`);
  };

  const scanPass = (passId: string, type: 'EXIT' | 'ENTRY') => {
    setPasses(prev => prev.map(p => {
      if (p.id === passId) {
        if (type === 'EXIT') {
          return { 
            ...p, 
            outScanned: true, 
            outScannedAt: new Date().toISOString(),
            status: 'OUT' as const
          };
        } else {
          return { 
            ...p, 
            inScanned: true, 
            inScannedAt: new Date().toISOString(),
            status: 'RETURNED' as const
          };
        }
      }
      return p;
    }));
    toast.success(`${type === 'EXIT' ? 'Exit' : 'Entry'} marked successfully for pass ${passId}`);
  };

  const toggleWindow = () => {
    setSystemState(prev => ({ ...prev, isWindowOpen: !prev.isWindowOpen }));
    toast.info(`Outing window is now ${!systemState.isWindowOpen ? 'OPEN' : 'CLOSED'}`);
  };

  const setCapacity = (newCapacity: number) => {
    setSystemState(prev => ({ ...prev, capacity: newCapacity }));
    
    // If capacity increased, try to approve waitlisted students
    setPasses(prev => {
      let updated = [...prev];
      const today = new Date().toISOString().split('T')[0];
      
      // Group waitlisted by date
      const dates = Array.from(new Set(updated.filter(p => p.status === 'WAITLISTED').map(p => p.outDate)));
      
      dates.forEach(date => {
        let approvedCount = updated.filter(p => p.outDate === date && (p.status === 'APPROVED' || p.status === 'OUT')).length;
        
        const waitlistedForDate = updated
          .filter(p => p.outDate === date && p.status === 'WAITLISTED')
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        for (const pass of waitlistedForDate) {
          if (approvedCount < newCapacity) {
            updated = updated.map(p => p.id === pass.id ? { ...p, status: 'APPROVED' as const } : p);
            approvedCount++;
            toast.info(`Waitlisted student ${pass.studentName} for ${date} has been approved due to capacity increase!`);
          } else {
            break;
          }
        }
      });
      
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ 
      passes, 
      systemState, 
      applyForOuting, 
      updatePassStatus, 
      scanPass,
      toggleWindow, 
      setCapacity 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
