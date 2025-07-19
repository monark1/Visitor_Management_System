import React, { useState } from 'react';
import { Search, Download, Filter, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AllVisitors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchAllVisitors();
  }, []);

  const fetchAllVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching visitors:', error);
        return;
      }

      setVisitors(data || []);
    } catch (error) {
      console.error('Error in fetchAllVisitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (visitor.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.host_employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || visitor.status === filterStatus;
    
    const matchesDate = !filterDate || 
                       visitor.check_in_time.split('T')[0] === filterDate;
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading visitors...</span>
      </div>
    );
  }

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
                      <div className="font-medium text-gray-900">{visitor.full_name}</div>
                      <div className="text-sm text-gray-600">{visitor.company_name || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.contact_number}</div>
                    <div className="text-sm text-gray-600">{visitor.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.purpose}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{visitor.host_employee_name}</div>
                    <div className="text-sm text-gray-600">{visitor.host_department}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      In: {new Date(visitor.check_in_time).toLocaleString()}
                    </div>
                    {visitor.check_out_time && (
                      <div className="text-sm text-gray-600">
                        Out: {new Date(visitor.check_out_time).toLocaleString()}
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
                    <div className="text-sm text-gray-900">{visitor.badge_number}</div>
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