import React, { ReactNode } from 'react';
import { Users, Shield, Clock, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VMS Pro</h1>
              <ThemeToggle />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visitor Management System</p>
            <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4 mr-2" />
              <span>{user.name}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium capitalize">{user.role}</span>
            </div>
          </div>
          
          <nav className="mt-6">
            {availableItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                    currentView === item.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button 
              onClick={logout}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;