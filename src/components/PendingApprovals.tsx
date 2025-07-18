import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, User, Building, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PendingApprovalsProps {
  userRole?: 'admin' | 'employee' | 'guard';
}

const PendingApprovals: React.FC<PendingApprovalsProps> = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const [pendingVisitors] = useState([
    {
      id: '1',
      fullName: 'John Doe',
      contactNumber: '+1-555-0123',
      email: 'john.doe@techcorp.com',
      purpose: 'Business Meeting',
      hostEmployeeName: 'Alice Johnson',
      hostDepartment: 'Sales',
      companyName: 'Tech Corp Solutions',
      checkInTime: new Date(),
      photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'pending' as const,
      badgeNumber: 'VIS-001234',
    },
    {
      id: '2',
      fullName: 'Sarah Wilson',
      contactNumber: '+1-555-0456',
      email: 'sarah.wilson@marketingplus.com',
      purpose: 'Interview',
      hostEmployeeName: 'Bob Smith',
      hostDepartment: 'Human Resources',
      companyName: 'Marketing Plus',
      checkInTime: new Date(),
      photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'pending' as const,
      badgeNumber: 'VIS-001235',
    },
    {
      id: '3',
      fullName: 'Mike Johnson',
      contactNumber: '+1-555-0789',
      email: 'mike.johnson@consulting.com',
      purpose: 'Delivery',
      hostEmployeeName: 'Carol Davis',
      hostDepartment: 'Operations',
      companyName: 'Consulting Ltd',
      checkInTime: new Date(),
      photo: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'pending' as const,
      badgeNumber: 'VIS-001236',
    },
  ]);

  const [notifications, setNotifications] = useState<string[]>([]);

  // Filter visitors based on user role
  const getFilteredVisitors = () => {
    if (user.role === 'employee') {
      // Employee sees only visitors they are hosting
      return pendingVisitors.filter(visitor => visitor.hostEmployeeName === user.name);
    }
    return pendingVisitors;
  };

  const handleApproval = (visitorId: string, approved: boolean) => {
    const visitor = pendingVisitors.find(v => v.id === visitorId);
    if (visitor) {
      const message = approved 
        ? `✅ Approved visitor: ${visitor.fullName} from ${visitor.companyName}`
        : `❌ Rejected visitor: ${visitor.fullName} from ${visitor.companyName}`;
      
      setNotifications(prev => [message, ...prev.slice(0, 4)]);
    }
  };

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
                src={visitor.photo}
                alt={visitor.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{visitor.fullName}</h3>
                <p className="text-sm text-gray-600 mb-2">{visitor.companyName}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {visitor.contactNumber}
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
                    {visitor.hostEmployeeName}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Host:</strong> {visitor.hostEmployeeName} ({visitor.hostDepartment})
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Badge:</strong> {visitor.badgeNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Check-in:</strong> {visitor.checkInTime.toLocaleTimeString()}
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