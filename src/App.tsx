import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VisitorRegistration from './components/VisitorRegistration';
import PendingApprovals from './components/PendingApprovals';
import PreApproval from './components/PreApproval';
import AllVisitors from './components/AllVisitors';
import Settings from './components/Settings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole] = useState<'admin' | 'employee' | 'security'>('admin');

  const handleVisitorRegistration = (visitor: any) => {
    console.log('New visitor registered:', visitor);
    // Here you would typically send this to your backend
    alert(`Visitor ${visitor.fullName} has been registered and approval request sent to ${visitor.hostEmployeeName}`);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'register':
        return <VisitorRegistration onRegister={handleVisitorRegistration} />;
      case 'approvals':
        return <PendingApprovals userRole={userRole} />;
      case 'pre-approve':
        return <PreApproval />;
      case 'visitors':
        return <AllVisitors />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      userRole={userRole}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;