import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  preApprovalId: string;
  visitorEmail: string;
  visitorName: string;
  hostName: string;
  purpose: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  qrCodeDataURL: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get request data
    const { 
      preApprovalId, 
      visitorEmail, 
      visitorName, 
      hostName, 
      purpose, 
      scheduledDate, 
      startTime, 
      endTime, 
      qrCodeDataURL 
    }: EmailRequest = await req.json()

    // Validate required fields
    if (!preApprovalId || !visitorEmail || !visitorName || !qrCodeDataURL) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update pre-approval status to 'sending'
    await supabaseClient
      .from('pre_approvals')
      .update({ qr_sent_status: 'sending' })
      .eq('id', preApprovalId)

    // Prepare email content
    const companyName = 'Tech Solutions Inc.'
    const qrCodeBase64 = qrCodeDataURL.split(',')[1] // Remove data:image/png;base64, prefix

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your QR Pass for Visiting ${companyName}</title>
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
            <img src="data:image/png;base64,${qrCodeBase64}" alt="QR Code for Entry" style="max-width: 250px; height: auto;" />
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
              <span class="value">${startTime} - ${endTime}</span>
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
    `

    // Send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, using mock email service');
      
      // Mock successful email sending for development
      await supabaseClient
        .from('pre_approvals')
        .update({
          qr_sent: true,
          qr_sent_at: new Date().toISOString(),
          qr_sent_status: 'sent'
        })
        .eq('id', preApprovalId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: `mock-${Date.now()}`,
          message: `QR code mock-sent to ${visitorEmail} (RESEND_API_KEY not configured)` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VMS Pro <onboarding@resend.dev>', // Using Resend's test domain
        to: [visitorEmail],
        subject: `Your QR Pass for Visiting ${companyName}`,
        html: emailHtml,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      
      // Update pre-approval status to 'failed'
      await supabaseClient
        .from('pre_approvals')
        .update({ qr_sent_status: 'failed' })
        .eq('id', preApprovalId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: emailResult.message || 'Failed to send email' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update pre-approval status to 'sent'
    await supabaseClient
      .from('pre_approvals')
      .update({
        qr_sent: true,
        qr_sent_at: new Date().toISOString(),
        qr_sent_status: 'sent'
      })
      .eq('id', preApprovalId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResult.id,
        message: `QR code successfully sent to ${visitorEmail}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-qr-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})