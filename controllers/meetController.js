const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const timeOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  
  return {
    time: date.toLocaleTimeString('en-US', timeOptions),
    date: date.toLocaleDateString('en-US', options)
  };
};

const generateReservationCode = () => {
  return "RSV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

const submitConsultationForm = async (req, res) => {
  try {
    const { 
      client_name, 
      client_email, 
      business_name, 
      client_message,
      consultation_date 
    } = req.body;

    if (!client_name || !client_email || !business_name || !client_message || !consultation_date) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled"
      });
    }

    const reservationCode = generateReservationCode();
    const { time, date } = formatDateTime(consultation_date);

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
          
          <tr>
            <td style="background-color: #ff7a00; height: 6px; width: 100%;"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">BANKSTON ALLIANCE</div>
                <div style="font-size: 11px; color: #ff7a00; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px;">Consultation Confirmation</div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" valign="middle" style="width: 64px; height: 64px; background-color: #f0fdf4; border-radius: 50%; border: 6px solid #dcfce7;">
                      <span style="font-size: 32px; color: #16a34a; font-weight: 800;">✓</span>
                    </td>
                  </tr>
                </table>
              </div>

              <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em;">Booking Successful</h1>
              <p style="margin: 0 0 40px 0; font-size: 15px; color: #64748b; text-align: center; line-height: 1.6;">
                Your consultation with <strong>Brittany Bankston</strong> has been scheduled successfully. We look forward to speaking with you.
              </p>

              <div style="text-align: center; margin-bottom: 40px;">
                <div style="font-size: 40px; font-weight: 800; color: #0f172a; letter-spacing: -0.04em; margin-bottom: 8px;">${time}</div>
                <div style="font-size: 16px; font-weight: 600; color: #ff7a00;">${date}</div>
              </div>

              <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #f1f5f9;">
                <h3 style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">Reservation Details</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; width: 40%;">Client Name</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 700; text-align: right;">${client_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Email Address</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px solid #e2e8f0;">${client_email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Business Name</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px solid #e2e8f0;">${business_name || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Message</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 500; text-align: right; border-top: 1px solid #e2e8f0; line-height: 1.5;">${client_message || 'None'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Booking ID</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px solid #e2e8f0; font-family: monospace; font-size: 15px;">${reservationCode}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 24px; padding: 16px 20px; background-color: #fff7ed; border-radius: 12px; border-left: 4px solid #ff7a00;">
                <p style="margin: 0; font-size: 14px; color: #9a3412; font-weight: 500; line-height: 1.6;">
                  <strong style="color: #ea580c; font-weight: 800;">Meeting Link:</strong> Will be shared directly by our team via email shortly before the consultation.
                </p>
              </div>

            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                Powered by <strong style="color: #ff7a00; font-weight: 800;">Yoreflow Bookings</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
                Automated System Notification
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
`;

const textContent = `
BANKSTON ALLIANCE - Booking Successful

Your consultation with Brittany Bankston has been scheduled successfully. We look forward to speaking with you.

-------------------------------------------------
TIME: ${time}
DATE: ${date}
-------------------------------------------------

RESERVATION DETAILS:
Client Name:     ${client_name}
Email Address:   ${client_email}
Business Name:   ${business_name || 'Not provided'}
Message:         ${client_message || 'None'}
Booking ID:      ${reservationCode}

MEETING LINK: 
Will be shared directly by our team via email shortly before the consultation.

-------------------------------------------------
Powered by Yoreflow Bookings
Automated System Notification
`;

    const emailResponse = await resend.emails.send({
      from: 'Bankston Alliance <forms@yoreflow.online>',
      to: [client_email],
      bcc: [''],
      subject: `Consultation Confirmation - ${reservationCode}`,
      html: htmlTemplate,
      text: textContent
    });

    if (emailResponse.error) {
      throw new Error('Resend API Error: ' + emailResponse.error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Consultation scheduled successfully",
      data: {
        client_name,
        client_email,
        business_name,
        reservation_code: reservationCode,
        resend_id: emailResponse?.data?.id
      }
    });

  } catch (error) {
    console.error("❌ SCHEDULING ERROR:", error);
    
    const fs = require('fs').promises;
    const path = require('path');
    
    const submissionsDir = path.join(__dirname, '..', 'consultations');
    await fs.mkdir(submissionsDir, { recursive: true });
    
    const filename = `consultation_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);
    
    const submissionData = {
      timestamp: new Date().toISOString(),
      formData: req.body,
      error: error.message
    };
    
    await fs.writeFile(filepath, JSON.stringify(submissionData, null, 2));
    
    return res.status(500).json({
      success: false,
      error: "Failed to schedule consultation.",
      actual_error: error.message,
      submissionId: filename
    });
  }
};

const submitConsultationAfterPayment = async (req, res) => {
  try {
    const { 
      client_name, 
      client_email, 
      business_name, 
      client_message,
      consultation_date,
      reservation_code,
      payment_completed
    } = req.body;

    if (!client_name || !client_email || !business_name || !consultation_date) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled"
      });
    }

    if (!payment_completed) {
      return res.status(400).json({
        success: false,
        error: "Payment must be completed before scheduling"
      });
    }

    const finalReservationCode = reservation_code || generateReservationCode();
    const { time, date } = formatDateTime(consultation_date);

    const htmlTemplate = `
<body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#1f1f1f;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:18px; border:1px solid #eeeeee; padding:40px;">
            <tr>
              <td align="center" style="padding-bottom:26px;">
                <div style="font-size:22px; font-weight:700; letter-spacing:0.4px;">
                  Bankston Alliance
                </div>
                <div style="font-size:13px; color:#ff7a00; font-weight:600; margin-top:6px;">
                  Consultation Booking Confirmation - Payment Received
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <div style="height:1px; background-color:#f1f1f1;"></div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:22px;">
                <div style="width:70px; height:70px; border-radius:16px; background-color:#fff4ea; display:flex; align-items:center; justify-content:center; font-size:30px; color:#ff7a00; font-weight:700;">
                  ✓
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:12px;">
                <div style="font-size:21px; font-weight:600;">
                  Payment Confirmed & Consultation Scheduled
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:30px; font-size:14px; color:#666666; line-height:1.6;">
                Thank you for your payment. Your consultation has been successfully scheduled.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:6px;">
                <div style="font-size:26px; font-weight:700;">
                  Brittany Bankston
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:28px; font-size:15px; color:#555555;">
                Business Consultant & Tax Professional
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:8px;">
                <div style="font-size:34px; font-weight:700;">
                  ${time}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:34px; font-size:13px; color:#777777;">
                ${date}
              </td>
            </tr>
            <tr>
              <td style="padding:28px; background-color:#fafafa; border-radius:14px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px; color:#444444;">
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Client Name</td>
                    <td style="padding:8px 0;">${client_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Email Address</td>
                    <td style="padding:8px 0;">${client_email}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Business Name</td>
                    <td style="padding:8px 0;">${business_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Client Message</td>
                    <td style="padding:8px 0;">${client_message || 'No additional message'}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Reservation Code</td>
                    <td style="padding:8px 0;">${finalReservationCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Payment Status</td>
                    <td style="padding:8px 0; color: green; font-weight: 600;">✓ Completed</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Meeting Link</td>
                    <td style="padding:8px 0; font-weight:600; color:#ff7a00;">
                      Will be shared directly by our team via email
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:44px; padding-bottom:20px;">
                <div style="height:1px; background-color:#f2f2f2;"></div>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:12px; color:#9a9a9a; line-height:1.6;">
                This message was generated via the Bankston Alliance booking system.<br />
                Powered by <strong>Yoreflow Bookings</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`;

    const textContent = `
Consultation Booking Confirmation - Bankston Alliance

Payment Confirmed & Consultation Scheduled
Thank you for your payment. Your consultation has been successfully scheduled.

Consultant: Brittany Bankston
Business Consultant & Tax Professional

Time: ${time}
Date: ${date}

Booking Details:
Client Name: ${client_name}
Email Address: ${client_email}
Business Name: ${business_name}
Client Message: ${client_message || 'No additional message'}
Reservation Code: ${finalReservationCode}
Payment Status: ✓ Completed
Meeting Link: Will be shared directly by our team via email.

This message was generated via the Bankston Alliance booking system.
Powered by Yoreflow Bookings
`;

    const emailResponse = await resend.emails.send({
      from: 'Bankston Alliance <forms@yoreflow.online>',
      to: [client_email],
      bcc: [''],
      subject: `Payment Confirmed - Consultation ${finalReservationCode}`,
      html: htmlTemplate,
      text: textContent
    });

    if (emailResponse.error) {
      throw new Error('Resend API Error: ' + emailResponse.error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Consultation scheduled successfully after payment",
      data: {
        client_name,
        client_email,
        business_name,
        reservation_code: finalReservationCode,
        resend_id: emailResponse?.data?.id
      }
    });

  } catch (error) {
    console.error("❌ POST-PAYMENT SCHEDULING ERROR:", error);
    
    const fs = require('fs').promises;
    const path = require('path');
    
    const submissionsDir = path.join(__dirname, '..', 'consultations');
    await fs.mkdir(submissionsDir, { recursive: true });
    
    const filename = `post_payment_consultation_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);
    
    const submissionData = {
      timestamp: new Date().toISOString(),
      formData: req.body,
      error: error.message
    };
    
    await fs.writeFile(filepath, JSON.stringify(submissionData, null, 2));
    
    return res.status(500).json({
      success: false,
      error: "Payment successful but failed to schedule consultation.",
      actual_error: error.message,
      submissionId: filename
    });
  }
};

module.exports = {
  submitConsultationForm,
  submitConsultationAfterPayment
};