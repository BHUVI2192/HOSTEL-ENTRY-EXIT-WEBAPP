import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  FilePlus, 
  Ticket, 
  LogOut, 
  QrCode, 
  Users,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { systemState, passes } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  // Refs to track previous states for notifications
  const prevWindowOpen = useRef(systemState.isWindowOpen);
  const prevPassStatuses = useRef<Record<string, string>>({});

  // Notification for Outing Window Opening
  useEffect(() => {
    if (user?.role === UserRole.STUDENT && !prevWindowOpen.current && systemState.isWindowOpen) {
      toast.success("Outing applications are now OPEN!", {
        description: "You can now apply for your outing pass.",
        icon: <Bell className="text-emerald-500" size={18} />,
        duration: 5000,
      });
    }
    prevWindowOpen.current = systemState.isWindowOpen;
  }, [systemState.isWindowOpen, user?.role]);

  // Notification for Pass Status Changes
  useEffect(() => {
    if (user?.role === UserRole.STUDENT) {
      const studentPasses = passes.filter(p => p.studentId === user.id);
      
      studentPasses.forEach(pass => {
        const prevStatus = prevPassStatuses.current[pass.id];
        if (prevStatus && prevStatus !== pass.status) {
          toast.info(`Pass Status Updated: ${pass.status}`, {
            description: `Your outing request for ${pass.reason} is now ${pass.status}.`,
            icon: <Ticket className="text-blue-500" size={18} />,
            duration: 6000,
          });
        }
        prevPassStatuses.current[pass.id] = pass.status;
      });
    }
  }, [passes, user?.id, user?.role]);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Apply Outing', path: '/student/apply', icon: FilePlus },
    { name: 'My Passes', path: '/student/passes', icon: Ticket },
  ];

  const wardenNav = [
    { name: 'Dashboard', path: '/warden/dashboard', icon: LayoutDashboard },
    { name: 'Approved List', path: '/warden/approved', icon: Users },
  ];

  const guardNav = [
    { name: 'Scanner', path: '/guard/scanner', icon: QrCode },
  ];

  const navItems = user.role === UserRole.STUDENT 
    ? studentNav 
    : user.role === UserRole.WARDEN 
      ? wardenNav 
      : guardNav;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-white shadow-xl lg:relative"
          >
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xl font-bold tracking-tight text-emerald-400">GatePass</span>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === item.path
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-zinc-800">
                <div className="px-4 py-3 mb-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Logged in as</p>
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-6 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="ml-4 flex-1">
            <h1 className="text-lg font-semibold text-zinc-900">
              {navItems.find(item => item.path === location.pathname)?.name || 'GatePass'}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
