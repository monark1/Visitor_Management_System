import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VisitorRegistration from './components/VisitorRegistration';
import PendingApprovals from './components/PendingApprovals';
import PreApproval from './components/PreApproval';
import AllVisitors from './components/AllVisitors';
import Settings from './components/Settings';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'register' | 'approvals' | 'pre-approve' | 'visitors' | 'settings'>('dashboard');

  if (isLoading) {
    const missingEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading VMS...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing application...</p>

          {missingEnv ? (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-md mx-auto">
              <h3 className="text-red-800 font-semibold mb-2">⚠️ Configuration Error</h3>
              <p className="text-red-700 text-sm mb-2">Missing Supabase environment variables.</p>
              <div className="text-xs text-red-600 space-y-1">
                <p>1. Create a <code>.env</code> file in project root</p>
                <p>2. Add your Supabase URL and API key</p>
                <p>3. Restart the development server</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs text-gray-400">
              <p>If this takes too long, check the browser console</p>
              <p className="mt-1">Press F12 → Console tab for details</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthForm />;
  }

  const handleVisitorRegistration = (visitor: any) => {
    console.log('New visitor registered:', visitor);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'register':
        if (user.role !== 'guard' && user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Access denied. Only security guards and administrators can register visitors.
              </p>
            </div>
          );
        }
        return <VisitorRegistration onRegister={handleVisitorRegistration} />;
      case 'approvals':
        if (user.role !== 'employee' && user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Access denied. Only employees and administrators can handle approvals.
              </p>
            </div>
          );
        }
        return <PendingApprovals />;
      case 'pre-approve':
        if (user.role !== 'employee' && user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Access denied. Only employees and administrators can pre-approve visitors.
              </p>
            </div>
          );
        }
        return <PreApproval />;
      case 'visitors':
        if (user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Access denied. Only administrators can view all visitors.
              </p>
            </div>
          );
        }
        return <AllVisitors />;
      case 'settings':
        if (user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Access denied. Only administrators can access settings.
              </p>
            </div>
          );
        }
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
