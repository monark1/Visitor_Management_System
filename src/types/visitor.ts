export interface Visitor {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  purpose: string;
  hostEmployeeName: string;
  hostEmployeeId: string;
  hostDepartment: string;
  companyName?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  photo: string;
  badgeNumber: string;
  qrCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
  approvalTime?: Date;
  approvedBy?: string;
  preApproved?: boolean;
  preApprovalWindow?: {
    startTime: Date;
    endTime: Date;
  };
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'employee' | 'security';
}

export interface PreApprovalRequest {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  scheduledDate: Date;
  timeWindow: {
    startTime: string;
    endTime: string;
  };
  hostEmployeeId: string;
  hostEmployeeName: string;
  status: 'active' | 'expired' | 'used';
  qrCode: string;
  qrSent: boolean;
  qrSentAt?: Date;
  qrSentStatus: 'not-sent' | 'sending' | 'sent' | 'failed';
  validUntil: Date;
  createdAt: Date;
}