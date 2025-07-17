import React, { useState } from 'react';
import { Search, Download, Filter, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

const AllVisitors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const visitors = [
    {
      id: '1',
      fullName: 'John Doe',
      contactNumber: '+1-555-0123',
      email: 'john.doe@techcorp.com',
      purpose: 'Business Meeting',
      hostEmployeeName: 'Alice Johnson',
      hostDepartment: 'Sales',
      companyName: 'Tech Corp Solutions',
      checkInTime: new Date('2024-01-15T10:30:00'),
      checkOutTime: new Date('2024-01-15T12:00:00'),
      status: 'checked-out' as const,
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
      checkInTime: new Date('2024-01-15T11:15:00'),
      status: 'checked-in' as const,
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
      checkInTime: new Date('2024-01-15T09:45:00'),
      checkOutTime: new Date('2024-01-15T10:15:00'),
      status: 'checked-out' as const,
      badgeNumber: 'VIS-001236',
    },
  ];

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.hostEmployeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || visitor.status === filterStatus;
    
    const matchesDate = !filterDate || 
                       visitor.checkInTime.toISOString().split('T')[0] === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'checked-out':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-blue-100 text-blue-800';
      case 'checked-out':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">All Visitors</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, company, or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Visitor</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Contact</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Purpose</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Host</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Time</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVisitors.map(visitor => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{visitor.fullName}</div>
                      <div className="text-sm text-gray-600">{visitor.companyName}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.contactNumber}</div>
                    <div className="text-sm text-gray-600">{visitor.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.purpose}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.hostEmployeeName}</div>
                    <div className="text-sm text-gray-600">{visitor.hostDepartment}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      In: {visitor.checkInTime.toLocaleString()}
                    </div>
                    {visitor.checkOutTime && (
                      <div className="text-sm text-gray-600">
                        Out: {visitor.checkOutTime.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                      {getStatusIcon(visitor.status)}
                      <span className="ml-1">{visitor.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.badgeNumber}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredVisitors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Visitors Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AllVisitors;