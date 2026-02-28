import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role first.");
      return;
    }
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    login(selectedRole);
    if (selectedRole === UserRole.STUDENT) navigate('/student/dashboard');
    else if (selectedRole === UserRole.WARDEN) navigate('/warden/dashboard');
    else navigate('/guard/scanner');
  };

  const roles = [
    { 
      id: UserRole.STUDENT, 
      title: 'Student', 
      desc: 'Apply for outings and track your passes',
      icon: User,
      color: 'bg-blue-500'
    },
    { 
      id: UserRole.WARDEN, 
      title: 'Warden', 
      desc: 'Review and approve outing requests',
      icon: UserCheck,
      color: 'bg-emerald-500'
    },
    { 
      id: UserRole.GUARD, 
      title: 'Guard', 
      desc: 'Scan QR codes for entry and exit',
      icon: Shield,
      color: 'bg-zinc-700'
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Welcome to GatePass</h1>
          <p className="text-zinc-500 text-lg">Select your role and sign in to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedRole(role.id)}
              className={`group p-8 rounded-3xl shadow-sm border transition-all text-left flex flex-col h-full ${
                selectedRole === role.id 
                  ? 'bg-white border-emerald-500 ring-4 ring-emerald-500/5' 
                  : 'bg-white border-zinc-200 hover:border-emerald-300'
              }`}
            >
              <div className={`${role.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-zinc-900/5`}>
                <role.icon size={24} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">{role.title}</h2>
              <p className="text-zinc-500 text-sm leading-relaxed flex-1">{role.desc}</p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedRole && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-md mx-auto overflow-hidden"
            >
              <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Sign In as {roles.find(r => r.id === selectedRole)?.title}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
