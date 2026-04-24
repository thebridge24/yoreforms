const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return {
    time: date.toLocaleTimeString("en-US", timeOptions),
    date: date.toLocaleDateString("en-US", options),
  };
};

const generateCalendarLinks = (title, startDateStr, description) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate.getTime() + 60 * 60000);

  const formatICS = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");

  const startICS = formatICS(startDate);
  const endICS = formatICS(endDate);

  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startICS}/${endICS}&details=${encodedDesc}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodedTitle}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodedDesc}`,
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodedTitle}&st=${startICS}&et=${endICS}&desc=${encodedDesc}`,
  };
};

const generateReservationCode = () => {
  return "STK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

const submitConsultationForm = async (req, res) => {
  try {
    const {
      client_name,
      client_email,
      business_name,
      client_message,
      consultation_date,
    } = req.body;

    if (
      !client_name ||
      !client_email ||
      !business_name ||
      !client_message ||
      !consultation_date
    ) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled",
      });
    }

    const reservationCode = generateReservationCode();
    const { time, date } = formatDateTime(consultation_date);

    const eventTitle = `Consultation with StackGate International (${client_name})`;
    const eventDesc = `Consultation Reference: ${reservationCode}\nClient: ${client_name}\nMeeting link will be shared via email shortly before the consultation.`;
    const calendarLinks = generateCalendarLinks(
      eventTitle,
      consultation_date,
      eventDesc,
    );

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
            <td style="background-color: #0066CC; height: 6px; width: 100%;"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">STACKGATE INTERNATIONAL</div>
                <div style="font-size: 11px; color: #0066CC; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px;">Consultation Confirmation</div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                  >
                    <tr>
                      <td
                        align="center"
                        valign="middle"
                        style="
                          width: 64px;
                          height: 64px;
                          background-color: #d8ffe4;
                          border-radius: 50%;
                          border: 6px solid #d8ffe4;
                        "
                      >
                        <span style="color: #16a34a; font-weight: 800">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true"
                            role="img"
                            class="iconify iconify--twemoji"
                            preserveAspectRatio="xMidYMid meet"
                            fill="#16a34a"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              <path
                                fill="#16a34a"
                                d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </td>
                    </tr>
                  </table>
              </div>

              <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em;">Booking Successful</h1>
              <p style="margin: 0 0 40px 0; font-size: 15px; color: #64748b; text-align: center; line-height: 1.6;">
                Your consultation with <strong>StackGate International</strong> has been scheduled successfully. We look forward to speaking with you.
              </p>

              <div style="text-align: center; margin-bottom: 40px;">
                <div style="font-size: 40px; font-weight: 800; color: #0f172a; letter-spacing: -0.04em; margin-bottom: 8px;">${time}</div>
                <div style="font-size: 16px; font-weight: 600; color: #0066CC;">${date}</div>
                
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #e2e8f0;">
                  <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
  Add to your Calendar
</p>

<a href="${calendarLinks.google}" target="_blank" style="display: inline-block; margin: 0 4px 10px 4px; padding: 10px 16px; background-color: #ffffff; color: #0f172a; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="">
  <span style="vertical-align: middle;">Google</span>
</a>

<a href="${calendarLinks.outlook}" target="_blank" style="display: inline-block; margin: 0 4px 10px 4px; padding: 10px 16px; background-color: #ffffff; color: #0f172a; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <img src="https://img.icons8.com/color/1200/outlook-calendar.jpg" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="">
  <span style="vertical-align: middle;">Outlook</span>
</a>

<a href="${calendarLinks.yahoo}" target="_blank" style="display: inline-block; margin: 0 4px 10px 4px; padding: 10px 16px; background-color: #ffffff; color: #0f172a; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <img src="https://lh3.googleusercontent.com/7BDpY7ZsUBnGZ8e0h2QLWl3joASNil2iMw1j6F9S971sajhZARd3y8rlLGvvVX-8kw" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="">
  <span style="vertical-align: middle;">Yahoo</span>
</a>
                </div>
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
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px solid #e2e8f0;">${business_name || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Message</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 500; text-align: right; border-top: 1px solid #e2e8f0; line-height: 1.5;">${client_message || "None"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Booking ID</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px solid #e2e8f0; font-family: monospace; font-size: 15px;">${reservationCode}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 24px; padding: 16px 20px; background-color: #E6F0FF; border-radius: 12px; border-left: 4px solid #0066CC;">
                <p style="margin: 0; font-size: 14px; color: #1E3A8A; font-weight: 500; line-height: 1.6;">
                  <strong style="color: #0066CC; font-weight: 800;">Meeting Link:</strong> Will be shared directly by our team via email shortly before the consultation.
                </p>
              </div>

            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                Powered by <strong style="color: #0066CC; font-weight: 800;">Yoreflow Bookings</strong>
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
STACKGATE INTERNATIONAL - Booking Successful

Your consultation with StackGate International has been scheduled successfully. We look forward to speaking with you.

-------------------------------------------------
TIME: ${time}
DATE: ${date}
-------------------------------------------------

ADD TO CALENDAR:
Google Calendar: ${calendarLinks.google}
Outlook: ${calendarLinks.outlook}
Yahoo: ${calendarLinks.yahoo}

-------------------------------------------------

RESERVATION DETAILS:
Client Name:     ${client_name}
Email Address:   ${client_email}
Business Name:   ${business_name || "Not provided"}
Message:         ${client_message || "None"}
Booking ID:      ${reservationCode}

MEETING LINK: 
Will be shared directly by our team via email shortly before the consultation.

-------------------------------------------------
Powered by Yoreflow Bookings
Automated System Notification
`;

    const emailResponse = await resend.emails.send({
      from: "StackGate International <forms@yoreflow.online>",
      to: [client_email],
      bcc: ["stackgateinternational@gmail.com", "johnayomide920@gmail.com"],
      subject: `Consultation Confirmation - ${reservationCode}`,
      html: htmlTemplate,
      text: textContent,
    });

    if (emailResponse.error) {
      throw new Error("Resend API Error: " + emailResponse.error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Consultation scheduled successfully",
      data: {
        client_name,
        client_email,
        business_name,
        reservation_code: reservationCode,
        resend_id: emailResponse?.data?.id,
      },
    });
  } catch (error) {
    console.error("❌ STACKGATE SCHEDULING ERROR:", error);

    const fs = require("fs").promises;
    const path = require("path");

    const submissionsDir = path.join(__dirname, "..", "stackgate_consultations");
    await fs.mkdir(submissionsDir, { recursive: true });

    const filename = `stackgate_consultation_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);

    const submissionData = {
      timestamp: new Date().toISOString(),
      formData: req.body,
      error: error.message,
    };

    await fs.writeFile(filepath, JSON.stringify(submissionData, null, 2));

    return res.status(500).json({
      success: false,
      error: "Failed to schedule consultation.",
      actual_error: error.message,
      submissionId: filename,
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
      payment_completed,
    } = req.body;

    if (!client_name || !client_email || !business_name || !consultation_date) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled",
      });
    }

    if (!payment_completed) {
      return res.status(400).json({
        success: false,
        error: "Payment must be completed before scheduling",
      });
    }

    const finalReservationCode = reservation_code || generateReservationCode();
    const { time, date } = formatDateTime(consultation_date);

    const eventTitle = `Consultation with StackGate International (${client_name})`;
    const eventDesc = `Consultation Reference: ${finalReservationCode}\nClient: ${client_name}\nMeeting link will be shared via email shortly before the consultation.`;
    const calendarLinks = generateCalendarLinks(
      eventTitle,
      consultation_date,
      eventDesc,
    );

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
            <td style="background-color: #0066CC; height: 6px; width: 100%;"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">STACKGATE INTERNATIONAL</div>
                <div style="font-size: 11px; color: #0066CC; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px;">Consultation Confirmation</div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                  >
                    <tr>
                      <td
                        align="center"
                        valign="middle"
                        style="
                          width: 64px;
                          height: 64px;
                          background-color: #f0fdf4;
                          border-radius: 50%;
                          border: 6px solid #d8ffe4;
                        "
                      >
                        <span style="color: #16a34a; font-weight: 800">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true"
                            role="img"
                            class="iconify iconify--twemoji"
                            preserveAspectRatio="xMidYMid meet"
                            fill="#16a34a"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              <path
                                fill="#16a34a"
                                d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </td>
                    </tr>
                  </table>
              </div>

              <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em;">Booking Successful</h1>
              <p style="margin: 0 0 40px 0; font-size: 15px; color: #64748b; text-align: center; line-height: 1.6;">
                Your consultation with <strong>StackGate International</strong> has been scheduled successfully. We look forward to speaking with you.
              </p>

              <div style="text-align: center; margin-bottom: 40px;">
                <div style="font-size: 40px; font-weight: 800; color: #0f172a; letter-spacing: -0.04em; margin-bottom: 8px;">${time}</div>
                <div style="font-size: 16px; font-weight: 600; color: #0066CC;">${date}</div>
                
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #e2e8f0;">
                  <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
  Add to your Calendar
</p>

<a href="${calendarLinks.google}" target="_blank" style="display: inline-block; margin: 0 4px 10px 4px; padding: 10px 16px; background-color: #ffffff; color: #0f172a; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="">
  <span style="vertical-align: middle;">Google</span>
</a>

<a href="${calendarLinks.outlook}" target="_blank" style="display: inline-block; margin: 0 4px 10px 4px; padding: 10px 16px; background-color: #ffffff; color: #0f172a; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <img src="https://img.icons8.com/color/1200/outlook-calendar.jpg" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="">
  <span style="vertical-align: middle;">Outlook</span>
</a>

<a href="${calendarLinks.yahoo}" target="_blank" style="display: inline-block; margin: 0 4px 10px 4px; padding: 10px 16px; background-color: #ffffff; color: #0f172a; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <img src="https://lh3.googleusercontent.com/7BDpY7ZsUBnGZ8e0h2QLWl3joASNil2iMw1j6F9S971sajhZARd3y8rlLGvvVX-8kw" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="">
  <span style="vertical-align: middle;">Yahoo</span>
</a>
                </div>
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
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px solid #e2e8f0;">${business_name || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Message</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 500; text-align: right; border-top: 1px solid #e2e8f0; line-height: 1.5;">${client_message || "None"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0;">Booking ID</td>
                    <td style="padding: 12px 0; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px solid #e2e8f0; font-family: monospace; font-size: 15px;">${finalReservationCode}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 24px; padding: 16px 20px; background-color: #E6F0FF; border-radius: 12px; border-left: 4px solid #0066CC;">
                <p style="margin: 0; font-size: 14px; color: #1E3A8A; font-weight: 500; line-height: 1.6;">
                  <strong style="color: #0066CC; font-weight: 800;">Meeting Link:</strong> Will be shared directly by our team via email shortly before the consultation.
                </p>
              </div>

            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                Powered by <strong style="color: #0066CC; font-weight: 800;">Yoreflow Bookings</strong>
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
STACKGATE INTERNATIONAL - Booking Successful

Your consultation with StackGate International has been scheduled successfully. We look forward to speaking with you.

-------------------------------------------------
TIME: ${time}
DATE: ${date}
-------------------------------------------------

ADD TO CALENDAR:
Google Calendar: ${calendarLinks.google}
Outlook: ${calendarLinks.outlook}
Yahoo: ${calendarLinks.yahoo}

-------------------------------------------------

RESERVATION DETAILS:
Client Name:     ${client_name}
Email Address:   ${client_email}
Business Name:   ${business_name || "Not provided"}
Message:         ${client_message || "None"}
Booking ID:      ${finalReservationCode}

MEETING LINK: 
Will be shared directly by our team via email shortly before the consultation.

-------------------------------------------------
Powered by Yoreflow Bookings
Automated System Notification
`;

    const emailResponse = await resend.emails.send({
      from: "StackGate International <forms@yoreflow.online>",
      to: [client_email],
      bcc: ["stackgateinternational@gmail.com", "johnayomide920@gmail.com"],
      subject: `Booking Confirmed - Consultation ${finalReservationCode}`,
      html: htmlTemplate,
      text: textContent,
    });

    if (emailResponse.error) {
      throw new Error("Resend API Error: " + emailResponse.error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Consultation scheduled successfully after payment",
      data: {
        client_name,
        client_email,
        business_name,
        reservation_code: finalReservationCode,
        resend_id: emailResponse?.data?.id,
      },
    });
  } catch (error) {
    console.error("❌ STACKGATE POST-PAYMENT SCHEDULING ERROR:", error);

    const fs = require("fs").promises;
    const path = require("path");

    const submissionsDir = path.join(__dirname, "..", "stackgate_consultations");
    await fs.mkdir(submissionsDir, { recursive: true });

    const filename = `stackgate_post_payment_consultation_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);

    const submissionData = {
      timestamp: new Date().toISOString(),
      formData: req.body,
      error: error.message,
    };

    await fs.writeFile(filepath, JSON.stringify(submissionData, null, 2));

    return res.status(500).json({
      success: false,
      error: "Payment successful but failed to schedule consultation.",
      actual_error: error.message,
      submissionId: filename,
    });
  }
};

module.exports = {
  submitConsultationForm,
  submitConsultationAfterPayment,
};