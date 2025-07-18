import React, { useState } from 'react';
import { Calendar, Clock, QrCode, Mail, Plus, CheckCircle, Send, AlertCircle, User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateQRCodeData, generateQRCodeImage } from '../utils/qrGenerator';
import { generateQREmailTemplate, sendQREmail } from '../services/emailService';
import { PreApprovalRequest } from '../types/visitor';

const PreApproval: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{[key: string]: 'not-sent' | 'sending' | 'sent' | 'failed'}>({});
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    purpose: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
  });

  const [preApprovals, setPreApprovals] = useState<PreApprovalRequest[]>([
    {
      id: '1',
      visitorName: 'David Wilson',
      visitorEmail: 'david.wilson@example.com',
      visitorPhone: '+1-555-0123',
      purpose: 'Client Meeting',
      scheduledDate: new Date('2024-01-15'),
      timeWindow: { startTime: '10:00', endTime: '12:00' },
      hostEmployeeId: user?.id || '1',
      hostEmployeeName: user?.name || 'John Employee',
      status: 'active' as const,
      qrCode: 'QR-PRE-001',
      qrSent: false,
      qrSentStatus: 'not-sent' as const,
      validUntil: new Date('2024-01-15T23:59:59'),
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
      hostEmployeeId: user?.id || '1',
      hostEmployeeName: user?.name || 'John Employee',
      status: 'active' as const,
      qrCode: 'QR-PRE-002',
      qrSent: true,
      qrSentAt: new Date(),
      qrSentStatus: 'sent' as const,
      validUntil: new Date('2024-01-16T23:59:59'),
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
    
    // Calculate valid until date (end of scheduled day)
    const scheduledDate = new Date(formData.scheduledDate);
    const validUntil = new Date(scheduledDate);
    validUntil.setHours(23, 59, 59, 999);
    
    const newPreApproval: PreApprovalRequest = {
      id: Date.now().toString(),
      visitorName: formData.visitorName,
      visitorEmail: formData.visitorEmail,
      visitorPhone: formData.visitorPhone,
      purpose: formData.purpose,
      scheduledDate: scheduledDate,
      timeWindow: {
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
      hostEmployeeId: user?.id || '1',
      hostEmployeeName: user?.name || 'Employee',
      status: 'active' as const,
      qrCode: `QR-PRE-${Date.now().toString().slice(-6)}`,
      qrSent: false,
      qrSentStatus: 'not-sent' as const,
      validUntil: validUntil,
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

  const sendQRCode = async (approval: PreApprovalRequest) => {
    setEmailStatus(prev => ({ ...prev, [approval.id]: 'sending' }));
    
    try {
      // Generate QR code data
      const qrData = generateQRCodeData(approval);
      
      // Generate QR code image
      const qrCodeImage = await generateQRCodeImage(qrData);
      
      // Generate email template
      const emailTemplate = generateQREmailTemplate(
        approval.visitorName,
        'Tech Solutions Inc.', // Company name
        approval.hostEmployeeName,
        approval.scheduledDate.toLocaleDateString(),
        approval.timeWindow,
        approval.purpose,
        approval.validUntil.toLocaleString(),
        qrCodeImage
      );
      
      // Send email
      const result = await sendQREmail(approval.visitorEmail, emailTemplate);
      
      if (result.success) {
        // Update approval status
        setPreApprovals(prev => prev.map(pa => 
          pa.id === approval.id 
            ? { 
                ...pa, 
                qrSent: true, 
                qrSentAt: new Date(), 
                qrSentStatus: 'sent' as const 
              }
            : pa
        ));
        
        setEmailStatus(prev => ({ ...prev, [approval.id]: 'sent' }));
        
        // Show success message
        alert(`✅ QR Code successfully sent to ${approval.visitorEmail}!\n\nEmail includes:\n• High-quality QR code image\n• Complete visit details\n• Security instructions\n• Valid until: ${approval.validUntil.toLocaleString()}\n\nMessage ID: ${result.messageId}`);
        
      } else {
        setEmailStatus(prev => ({ ...prev, [approval.id]: 'failed' }));
        alert(`❌ Failed to send QR code: ${result.error}\n\nPlease check the email address and try again.`);
      }
      
    } catch (error) {
      console.error('Failed to send QR code email:', error);
      setEmailStatus(prev => ({ ...prev, [approval.id]: 'failed' }));
      alert(`❌ Error generating or sending QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getEmailButtonContent = (approval: PreApprovalRequest) => {
    const status = emailStatus[approval.id] || approval.qrSentStatus;
    
    switch (status) {
      case 'sending':
        return (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Sending QR...
          </>
        );
      case 'sent':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            QR Sent
          </>
        );
      case 'failed':
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

  const getEmailButtonStyle = (approval: PreApprovalRequest) => {
    const status = emailStatus[approval.id] || approval.qrSentStatus;
    
    switch (status) {
      case 'sending':
        return 'bg-gray-400 cursor-not-allowed';
      case 'sent':
        return 'bg-green-600 hover:bg-green-700';
      case 'failed':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const isButtonDisabled = (approval: PreApprovalRequest) => {
    const status = emailStatus[approval.id] || approval.qrSentStatus;
    return status === 'sending';
  };

  // Filter pre-approvals for current employee (if not admin)
  const filteredPreApprovals = user?.role === 'admin' 
    ? preApprovals 
    : preApprovals.filter(pa => pa.hostEmployeeId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pre-Approve Visitors</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create pre-approvals and send QR codes to visitors
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Pre-Approval
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPreApprovals.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pre-Approvals</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredPreApprovals.filter(pa => pa.qrSent).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">QR Codes Sent</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredPreApprovals.filter(pa => pa.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Approvals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Approval Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Pre-Approval</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Visitor Name *
                </label>
                <input
                  type="text"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter visitor's full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="visitorEmail"
                  value={formData.visitorEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="visitor@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="visitorPhone"
                  value={formData.visitorPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1-555-0123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Purpose of Visit *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select purpose</option>
                  {purposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📧 QR Code Email Process:</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>1. Create pre-approval with visitor details</li>
                <li>2. Click "Send QR Code" to generate unique QR</li>
                <li>3. QR code emailed as image attachment</li>
                <li>4. Visitor presents QR at gate for entry</li>
                <li>5. QR expires after visit date for security</li>
              </ol>
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
        {filteredPreApprovals.map(approval => (
          <div key={approval.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{approval.visitorName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.visitorEmail}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.visitorPhone}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  approval.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {approval.status}
                </span>
                {approval.qrSent && (
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                      QR Sent
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                {approval.scheduledDate.toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                {approval.timeWindow.startTime} - {approval.timeWindow.endTime}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Building className="w-4 h-4 mr-2" />
                {approval.purpose}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 mr-2" />
                Host: {approval.hostEmployeeName}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <QrCode className="w-4 h-4 mr-2" />
                QR: {approval.qrCode}
              </div>
              {approval.qrSentAt && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  Sent: {approval.qrSentAt.toLocaleString()}
                </div>
              )}
            </div>

            <button
              onClick={() => sendQRCode(approval)}
              disabled={isButtonDisabled(approval)}
              className={`w-full text-white py-2 rounded-lg transition-colors flex items-center justify-center ${getEmailButtonStyle(approval)}`}
            >
              {getEmailButtonContent(approval)}
            </button>
            
            {(emailStatus[approval.id] === 'sent' || approval.qrSentStatus === 'sent') && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-300">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                QR code successfully sent to {approval.visitorEmail}
              </div>
            )}
            
            {(emailStatus[approval.id] === 'failed' || approval.qrSentStatus === 'failed') && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Failed to send email. Please check the email address and try again.
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPreApprovals.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pre-Approvals</h3>
          <p className="text-gray-600 dark:text-gray-400">Create your first pre-approval to get started.</p>
        </div>
      )}
    </div>
  );
};

export default PreApproval;