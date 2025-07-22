import React from 'react';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  userRole?: 'admin' | 'employee' | 'guard';
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    totalVisitors: 0,
    pendingApprovals: 0,
    approvedVisitors: 0,
    currentlyInside: 0,
  });
  const [recentVisitors, setRecentVisitors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  if (!user) return null;

  React.useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch visitors based on user role
      let visitorsQuery = supabase
        .from('visitors')
        .select('*');

      if (user?.role === 'employee') {
        // For employees, show visitors they are hosting
        visitorsQuery = visitorsQuery.or(`host_employee_id.eq.${user.id},host_employee_name.eq.${user.name}`);
      }

      const { data: visitors, error: visitorsError } = await visitorsQuery
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false });

      if (visitorsError) {
        console.error('Error fetching visitors:', visitorsError);
        // Set empty data instead of returning early
        setStats({
          totalVisitors: 0,
          pendingApprovals: 0,
          approvedVisitors: 0,
          currentlyInside: 0,
        });
        setRecentVisitors([]);
        return;
      }

      // Calculate stats
      const totalVisitors = visitors?.length || 0;
      const pendingApprovals = visitors?.filter(v => v.status === 'pending').length || 0;
      const approvedVisitors = visitors?.filter(v => v.status === 'approved').length || 0;
      const currentlyInside = visitors?.filter(v => v.status === 'checked-in').length || 0;

      setStats({
        totalVisitors,
        pendingApprovals,
        approvedVisitors,
        currentlyInside,
      });

      // Set recent visitors (last 5)
      setRecentVisitors(visitors?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      // Set default values on error
      setStats({
        totalVisitors: 0,
        pendingApprovals: 0,
        approvedVisitors: 0,
        currentlyInside: 0,
      });
      setRecentVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { label: 'Total Visitors Today', value: stats.totalVisitors.toString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Approvals', value: stats.pendingApprovals.toString(), icon: Clock, color: 'bg-yellow-500' },
    { label: 'Approved Visitors', value: stats.approvedVisitors.toString(), icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Currently Inside', value: stats.currentlyInside.toString(), icon: AlertCircle, color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'checked-in':
        return { text: 'checked in', class: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' };
      case 'approved':
        return { text: 'approved', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' };
      case 'checked-out':
        return { text: 'checked out', class: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' };
      default:
        return { text: status, class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' };
    }
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
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {user.role === 'employee' ? 'My Recent Visitors' : 'Recent Visitors'}
          </h2>
          {user.role === 'employee' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Visitors hosted by you</p>
          )}
          <div className="space-y-3">
            {recentVisitors.map((visitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{visitor.full_name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{visitor.company_name || 'N/A'} • Host: {visitor.host_employee_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(visitor.created_at).toLocaleTimeString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(visitor.status).class}`}>
                    {getStatusDisplay(visitor.status).text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weekly Visitor Trends</h2>
          <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;