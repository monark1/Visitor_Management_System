import React, { useState } from 'react';
import { Calendar, Clock, QrCode, Mail, Plus, CheckCircle, Send, AlertCircle } from 'lucide-react';

const PreApproval: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{[key: string]: 'sending' | 'sent' | 'error'}>({});
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    purpose: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
  });

  const [preApprovals, setPreApprovals] = useState([
    {
      id: '1',
      visitorName: 'David Wilson',
      visitorEmail: 'david.wilson@example.com',
      visitorPhone: '+1-555-0123',
      purpose: 'Client Meeting',
      scheduledDate: new Date('2024-01-15'),
      timeWindow: { startTime: '10:00', endTime: '12:00' },
      status: 'active' as const,
      qrCode: 'QR-PRE-001',
      createdAt: new Date(),
    },
    {
      id: '2',
      visitorName: 'Emma Thompson',
      visitorEmail: 'emma.thompson@vendor.com',
      visitorPhone: '+1-555-0456',
      purpose: 'Vendor Meeting',
      scheduledDate: new Date('2024-01-16'),
      timeWindow: { startTime: '14:00', endTime: '16:00' },
      status: 'active' as const,
      qrCode: 'QR-PRE-002',
      createdAt: new Date(),
    },
  ]);

  const purposes = [
    'Business Meeting',
    'Interview',
    'Delivery',
    'Maintenance',
    'Training',
    'Conference',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPreApproval = {
      id: Date.now().toString(),
      visitorName: formData.visitorName,
      visitorEmail: formData.visitorEmail,
      visitorPhone: formData.visitorPhone,
      purpose: formData.purpose,
      scheduledDate: new Date(formData.scheduledDate),
      timeWindow: {
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
      status: 'active' as const,
      qrCode: `QR-PRE-${Date.now().toString().slice(-6)}`,
      createdAt: new Date(),
    };

    setPreApprovals(prev => [newPreApproval, ...prev]);
    setShowForm(false);
    setFormData({
      visitorName: '',
      visitorEmail: '',
      visitorPhone: '',
      purpose: '',
      scheduledDate: '',
      startTime: '',
      endTime: '',
    });
  };

  const sendQRCode = async (approval: any) => {
    setEmailStatus(prev => ({ ...prev, [approval.id]: 'sending' }));
    
    try {
      // Simulate API call to send email with QR code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would call your email service API
      // Example: await emailService.sendQRCode(approval.visitorEmail, approval.qrCode);
      
      // Generate QR code content (in production, this would be a proper QR code image)
      const qrCodeContent = `VMS-PREAPPROVAL:${approval.id}:${approval.visitorName}:${approval.scheduledDate.toISOString()}:${approval.timeWindow.startTime}-${approval.timeWindow.endTime}`;
      
      // Simulate successful email sending
      console.log('Email sent with QR code:', {
        to: approval.visitorEmail,
        subject: 'VMS Pre-Approval - Your Visit QR Code',
        qrCode: approval.qrCode,
        content: qrCodeContent,
        visitDetails: {
          visitorName: approval.visitorName,
          date: approval.scheduledDate.toLocaleDateString(),
          time: `${approval.timeWindow.startTime} - ${approval.timeWindow.endTime}`,
          purpose: approval.purpose
        }
      });
      
      setEmailStatus(prev => ({ ...prev, [approval.id]: 'sent' }));
      
      // Show success message
      alert(`✅ QR Code successfully sent to ${approval.visitorEmail}!\n\nEmail includes:\n• Digital QR code for entry\n• Visit details and instructions\n• Validity period: ${approval.scheduledDate.toLocaleDateString()}`);
      
    } catch (error) {
      console.error('Failed to send QR code email:', error);
      setEmailStatus(prev => ({ ...prev, [approval.id]: 'error' }));
      alert(`❌ Failed to send QR code to ${approval.visitorEmail}. Please try again.`);
    }
  };

  const getEmailButtonContent = (approvalId: string) => {
    const status = emailStatus[approvalId];
    
    switch (status) {
      case 'sending':
        return (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Sending...
          </>
        );
      case 'sent':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Sent Successfully
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Retry Send
          </>
        );
      default:
        return (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send QR Code
          </>
        );
    }
  };

  const getEmailButtonStyle = (approvalId: string) => {
    const status = emailStatus[approvalId];
    
    switch (status) {
      case 'sending':
        return 'bg-gray-400 cursor-not-allowed';
      case 'sent':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pre-Approve Visitors</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Pre-Approval
        </button>
      </div>

      {/* Pre-Approval Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Pre-Approval</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visitor Name *
                </label>
                <input
                  type="text"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="visitorEmail"
                  value={formData.visitorEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="visitorPhone"
                  value={formData.visitorPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select purpose</option>
                  {purposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Pre-Approval
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pre-Approvals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {preApprovals.map(approval => (
          <div key={approval.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{approval.visitorName}</h3>
                <p className="text-sm text-gray-600">{approval.visitorEmail}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                approval.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {approval.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {approval.scheduledDate.toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {approval.timeWindow.startTime} - {approval.timeWindow.endTime}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                {approval.purpose}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code: {approval.qrCode}
              </div>
            </div>

            <button
              onClick={() => sendQRCode(approval)}
              disabled={emailStatus[approval.id] === 'sending'}
              className={`w-full text-white py-2 rounded-lg transition-colors flex items-center justify-center ${getEmailButtonStyle(approval.id)}`}
            >
              {getEmailButtonContent(approval.id)}
            </button>
            
            {emailStatus[approval.id] === 'sent' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                QR code sent to {approval.visitorEmail}
              </div>
            )}
            
            {emailStatus[approval.id] === 'error' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Failed to send email. Please check the email address and try again.
              </div>
            )}
          </div>
        ))}
      </div>

      {preApprovals.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pre-Approvals</h3>
          <p className="text-gray-600">Create your first pre-approval to get started.</p>
        </div>
      )}
    </div>
  );
};

export default PreApproval;