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
                  Consultation Booking Confirmation
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
                  Consultation Successfully Scheduled
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:30px; font-size:14px; color:#666666; line-height:1.6;">
                This email confirms your consultation booking made through the Bankston Alliance website.
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
                    <td style="padding:8px 0;">${client_message}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-weight:600;">Reservation Code</td>
                    <td style="padding:8px 0;">${reservationCode}</td>
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

Consultation Successfully Scheduled
This email confirms a consultation booking made through the Bankston Alliance website.

Consultant: Brittany Bankston
Business Consultant & Tax Professional

Time: ${time}
Date: ${date}

Booking Details:
Client Name: ${client_name}
Email Address: ${client_email}
Business Name: ${business_name}
Client Message: ${client_message}
Reservation Code: ${reservationCode}
Meeting Link: Will be shared directly by our team via email.

This message was generated via the Bankston Alliance booking system.
Powered by Yoreflow Bookings
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