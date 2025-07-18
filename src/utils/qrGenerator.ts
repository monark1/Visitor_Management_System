import QRCode from 'qrcode';

export interface QRCodeData {
  visitor_id: string;
  name: string;
  email: string;
  host_employee: string;
  purpose: string;
  scheduled_date: string;
  time_window: {
    start: string;
    end: string;
  };
  valid_until: string;
  created_at: string;
  signature: string;
}

// Simple signature generation (in production, use proper HMAC with secret key)
const generateSignature = (data: Omit<QRCodeData, 'signature'>): string => {
  const dataString = JSON.stringify(data);
  // In production, use crypto.createHmac('sha256', secretKey).update(dataString).digest('hex')
  return btoa(dataString).slice(-16); // Simple signature for demo
};

export const generateQRCodeData = (preApproval: any): QRCodeData => {
  const qrData: Omit<QRCodeData, 'signature'> = {
    visitor_id: preApproval.id,
    name: preApproval.visitorName,
    email: preApproval.visitorEmail,
    host_employee: preApproval.hostEmployeeName,
    purpose: preApproval.purpose,
    scheduled_date: preApproval.scheduledDate.toISOString().split('T')[0],
    time_window: {
      start: preApproval.timeWindow.startTime,
      end: preApproval.timeWindow.endTime,
    },
    valid_until: preApproval.validUntil.toISOString(),
    created_at: new Date().toISOString(),
  };

  return {
    ...qrData,
    signature: generateSignature(qrData),
  };
};

export const generateQRCodeImage = async (qrData: QRCodeData): Promise<string> => {
  try {
    const qrString = JSON.stringify(qrData);
    
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const validateQRCode = (qrData: QRCodeData): boolean => {
  try {
    // Check if QR code is still valid
    const validUntil = new Date(qrData.valid_until);
    const now = new Date();
    
    if (now > validUntil) {
      return false; // QR code expired
    }

    // Verify signature
    const { signature, ...dataWithoutSignature } = qrData;
    const expectedSignature = generateSignature(dataWithoutSignature);
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error validating QR code:', error);
    return false;
  }
};