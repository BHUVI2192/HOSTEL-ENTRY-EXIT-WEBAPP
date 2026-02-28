import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import ApplyOuting from './pages/student/Apply';
import MyPasses from './pages/student/Passes';
import WardenDashboard from './pages/warden/Dashboard';
import GuardScanner from './pages/guard/Scanner';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster position="top-right" richColors />
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/apply" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <ApplyOuting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/passes" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <MyPasses />
              </ProtectedRoute>
            } 
          />

          {/* Warden Routes */}
          <Route 
            path="/warden/dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.WARDEN]}>
                <WardenDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Guard Routes */}
          <Route 
            path="/guard/scanner" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.GUARD]}>
                <GuardScanner />
              </ProtectedRoute>
            } 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
