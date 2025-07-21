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
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VMS...</p>
          <p className="text-sm text-gray-500 mt-2">
            {!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY 
              ? '⚠️ Missing Supabase configuration - Check .env file' 
              : 'Connecting to database...'}
          </p>
          {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-md">
              <p className="text-sm text-yellow-800 font-semibold mb-2">Required .env file:</p>
              <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
              <p className="text-xs text-yellow-600 mt-2">
                Get these from your Supabase project settings
              </p>
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
        // Only guards and admins can register visitors
        if (user.role !== 'guard' && user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">Access denied. Only security guards and administrators can register visitors.</p>
            </div>
          );
        }
        return <VisitorRegistration onRegister={handleVisitorRegistration} />;
      case 'approvals':
        // Only employees and admins can handle approvals
        if (user.role !== 'employee' && user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">Access denied. Only employees and administrators can handle approvals.</p>
            </div>
          );
        }
        return <PendingApprovals />;
      case 'pre-approve':
        // Only employees and admins can pre-approve
        if (user.role !== 'employee' && user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">Access denied. Only employees and administrators can pre-approve visitors.</p>
            </div>
          );
        }
        return <PreApproval />;
      case 'visitors':
        // Only admins can view all visitors
        if (user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">Access denied. Only administrators can view all visitors.</p>
            </div>
          );
        }
        return <AllVisitors />;
      case 'settings':
        // Only admins can access settings
        if (user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <p className="text-gray-600">Access denied. Only administrators can access settings.</p>
            </div>
          );
        }
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
    >
      {renderCurrentView()}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;