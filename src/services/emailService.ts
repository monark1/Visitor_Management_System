// Email service for sending QR codes to visitors
// In production, this would integrate with actual email services like SendGrid, Mailgun, etc.

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
    cid: string;
  }>;
}

export const generateQREmailTemplate = (
  visitorName: string,
  companyName: string,
  hostName: string,
  scheduledDate: string,
  timeWindow: { start: string; end: string },
  purpose: string,
  validUntil: string,
  qrCodeDataURL: string
): EmailTemplate => {
  const qrCodeBase64 = qrCodeDataURL.split(',')[1]; // Remove data:image/png;base64, prefix

  return {
    to: '',
    subject: `Your QR Pass for Visiting ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Visit QR Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .qr-container { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎫 Your Visit QR Pass</h1>
          <p>Welcome to ${companyName}</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${visitorName}</strong>,</p>
          
          <p>Your visit to <strong>${companyName}</strong> has been pre-approved! Please present the QR code below at the entrance on the day of your visit.</p>
          
          <div class="qr-container">
            <h3>🔍 Your Entry QR Code</h3>
            <img src="cid:qrcode" alt="QR Code for Entry" style="max-width: 250px; height: auto;" />
            <p><small>Scan this code at the security gate</small></p>
          </div>
          
          <div class="details">
            <h3>📋 Visit Details</h3>
            <div class="detail-row">
              <span class="label">Visitor Name:</span>
              <span class="value">${visitorName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Host Employee:</span>
              <span class="value">${hostName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Purpose:</span>
              <span class="value">${purpose}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${scheduledDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time Window:</span>
              <span class="value">${timeWindow.start} - ${timeWindow.end}</span>
            </div>
            <div class="detail-row">
              <span class="label">Valid Until:</span>
              <span class="value">${validUntil}</span>
            </div>
          </div>
          
          <div class="important">
            <h4>⚠️ Important Instructions:</h4>
            <ul>
              <li>Please arrive within your scheduled time window</li>
              <li>Bring a valid photo ID for verification</li>
              <li>Present this QR code at the security gate</li>
              <li>The QR code expires after your visit date</li>
              <li>Contact your host if you need to reschedule</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the ${companyName} Visitor Management System.</p>
            <p>If you have any questions, please contact your host: <strong>${hostName}</strong></p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p><small>🔒 This QR code is digitally signed and time-bound for security purposes.</small></p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'visitor-qr-code.png',
        content: qrCodeBase64,
        encoding: 'base64',
        cid: 'qrcode'
      }
    ]
  };
};

export const sendQREmail = async (
  visitorEmail: string,
  emailTemplate: EmailTemplate
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would use actual email service:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: visitorEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      attachments: emailTemplate.attachments
    });
    
    return { success: true, messageId: result.messageId };
    */
    
    // Simulate successful email sending
    console.log('📧 Email sent successfully!', {
      to: visitorEmail,
      subject: emailTemplate.subject,
      attachments: emailTemplate.attachments?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    // Random success/failure for demo (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return { 
        success: true, 
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
    } else {
      return { 
        success: false, 
        error: 'SMTP server temporarily unavailable. Please try again.' 
      };
    }
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
};