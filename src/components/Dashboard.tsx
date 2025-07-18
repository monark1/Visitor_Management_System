import React from 'react';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  userRole?: 'admin' | 'employee' | 'guard';
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const stats = [
    { label: 'Total Visitors Today', value: '24', icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Approvals', value: '3', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Approved Visitors', value: '18', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Currently Inside', value: '12', icon: AlertCircle, color: 'bg-red-500' },
  ];

  const recentVisitors = [
    { name: 'John Doe', company: 'Tech Corp', host: 'Alice Johnson', time: '10:30 AM', status: 'checked-in' },
    { name: 'Sarah Wilson', company: 'Marketing Plus', host: 'Bob Smith', time: '11:15 AM', status: 'approved' },
    { name: 'Mike Johnson', company: 'Consulting Ltd', host: 'Carol Davis', time: '9:45 AM', status: 'checked-out' },
  ];

  // Filter data based on user role
  const getFilteredStats = () => {
    if (user.role === 'employee') {
      // Employee sees only their visitors
      return stats.map(stat => ({
        ...stat,
        value: stat.label.includes('Pending') ? '1' : Math.floor(parseInt(stat.value) / 3).toString()
      }));
    }
    return stats;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getFilteredStats().map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {user.role === 'employee' ? 'My Recent Visitors' : 'Recent Visitors'}
          </h2>
          {user.role === 'employee' && (
            <p className="text-sm text-gray-600 mb-4">Visitors hosted by you</p>
          )}
          <div className="space-y-3">
            {recentVisitors.map((visitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{visitor.name}</h3>
                  <p className="text-sm text-gray-600">{visitor.company} • Host: {visitor.host}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{visitor.time}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    visitor.status === 'checked-in' 
                      ? 'bg-green-100 text-green-800'
                      : visitor.status === 'approved'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {visitor.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Visitor Trends</h2>
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;