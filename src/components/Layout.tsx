import React, { ReactNode } from 'react';
import { Users, Shield, Clock, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'employee', 'guard'] },
    { id: 'register', label: 'Register Visitor', icon: Users, roles: ['guard', 'admin'] },
    { id: 'approvals', label: 'Pending Approvals', icon: Clock, roles: ['employee', 'admin'] },
    { id: 'pre-approve', label: 'Pre-Approve Visitors', icon: Shield, roles: ['employee', 'admin'] },
    { id: 'visitors', label: 'All Visitors', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">VMS Pro</h1>
            <p className="text-sm text-gray-600 mt-1">Visitor Management System</p>
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>{user.name}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">{user.role}</span>
            </div>
          </div>
          
          <nav className="mt-6">
            {availableItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                    currentView === item.id 
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 w-64 p-6 border-t bg-white">
            <button 
              onClick={logout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;