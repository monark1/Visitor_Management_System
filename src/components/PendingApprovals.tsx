import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, User, Building, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PendingApprovalsProps {
  userRole?: 'admin' | 'employee' | 'guard';
}

const PendingApprovals: React.FC<PendingApprovalsProps> = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const [pendingVisitors, setPendingVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<string[]>([]);

  React.useEffect(() => {
    fetchPendingVisitors();
  }, [user]);

  const fetchPendingVisitors = async () => {
    try {
      let query = supabase
        .from('visitors')
        .select('*')
        .eq('status', 'pending');

      // Filter based on user role
      if (user?.role === 'employee') {
        query = query.eq('host_employee_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending visitors:', error);
        return;
      }

      setPendingVisitors(data || []);
    } catch (error) {
      console.error('Error in fetchPendingVisitors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter visitors based on user role
  const getFilteredVisitors = () => {
    return pendingVisitors;
  };

  const handleApproval = async (visitorId: string, approved: boolean) => {
    try {
      const status = approved ? 'approved' : 'rejected';
      
      const { data: visitor, error } = await supabase
        .from('visitors')
        .update({
          status,
          approval_time: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', visitorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating visitor status:', error);
        alert('Failed to update visitor status. Please try again.');
        return;
      }

      if (visitor) {
        const message = approved 
          ? `✅ Approved visitor: ${visitor.full_name} from ${visitor.company_name || 'N/A'}`
          : `❌ Rejected visitor: ${visitor.full_name} from ${visitor.company_name || 'N/A'}`;
        
        setNotifications(prev => [message, ...prev.slice(0, 4)]);
        
        // Remove from pending list
        setPendingVisitors(prev => prev.filter(v => v.id !== visitorId));
      }
    } catch (error) {
      console.error('Error in handleApproval:', error);
      alert('An error occurred while processing the approval.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading pending approvals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        {user.role === 'employee' && (
          <p className="text-sm text-gray-600">Visitors requesting to meet with you</p>
        )}
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          {getFilteredVisitors().length} pending
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Recent Actions</h3>
          <div className="space-y-1">
            {notifications.map((notification, index) => (
              <p key={index} className="text-sm text-blue-800">{notification}</p>
            ))}
          </div>
        </div>
      )}

      {/* Pending Visitors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getFilteredVisitors().map(visitor => (
          <div key={visitor.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-4">
              <img
                src={visitor.photo_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                alt={visitor.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{visitor.full_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{visitor.company_name || 'N/A'}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {visitor.contact_number}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {visitor.email}
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {visitor.purpose}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {visitor.host_employee_name}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Host:</strong> {visitor.host_employee_name} ({visitor.host_department})
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Badge:</strong> {visitor.badge_number}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Check-in:</strong> {new Date(visitor.check_in_time).toLocaleString()}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproval(visitor.id, true)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(visitor.id, false)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredVisitors().length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
          <p className="text-gray-600">All visitor requests have been processed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;