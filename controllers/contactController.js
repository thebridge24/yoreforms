const { Resend } = require('resend');

const submitContactForm = async (req, res) => {
  try {
    console.log('Received contact form submission');

    const { 
      fullName, 
      email, 
      phone, 
      service, 
      message, 
      contactMethod, 
      companyName, 
      numEmployees, 
      interests, 
      uploadedFiles 
    } = req.body;

    if (!fullName || !email || !phone || !service || !message || !contactMethod) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled"
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // --- 1. GENERALIZED DATA MAPPING ---
    const interestsText = Array.isArray(interests) ? interests.join(', ') : interests || 'None';
    
    const formFields = [
      { label: "Full Name", value: fullName },
      { label: "Email Address", value: email },
      { label: "Phone Number", value: phone },
      { label: "Contact Method", value: contactMethod },
      { label: "Service Interest", value: service },
      { label: "Company Name", value: companyName || 'Not provided' },
      { label: "Employees", value: numEmployees || 'Not provided' },
      { label: "Interests", value: interestsText }
    ];

    // --- 2. MODERN FILE BUTTONS ---
    let filesHtml = '';
    let filesText = 'No files uploaded';
    
    if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      filesText = uploadedFiles.map((url, index) => `File ${index + 1}: ${url}`).join('\n');
      
      filesHtml = uploadedFiles.map((url, index) => `
        <a href="${url}" target="_blank" style="display: block; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155; text-decoration: none; font-size: 14px; margin-bottom: 8px; font-weight: 600;">
          <span style="color: #26FF0A; margin-right: 8px;">📎</span> View Attachment ${index + 1}
        </a>
      `).join('');
    } else {
      filesHtml = `<p style="color: #94a3b8; font-size: 14px; font-style: italic;">No files attached.</p>`;
    }

    // --- 3. UPGRADED MODERN HTML CONTENT ---
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <div style="background: #26FF0A; height: 6px; width: 100%;"></div>

    <div style="padding: 38px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src='https://res.cloudinary.com/dd5ppwbyi/image/upload/v1766137821/yoreforms_logo_green_uyrwgf.png' alt='Yoreflow' style="height: 35px; width: auto; margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: 800; color: #26FF0A; letter-spacing: 0.1em; text-transform: uppercase;">New Submission</div>
      </div>

      <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em;">${fullName}</h1>
      <p style="margin: 0 0 40px 0; font-size: 16px; color: #64748b; text-align: center;">New message received via Yoreflow Forms.</p>

      <div style="background: #f8fafc; border-radius: 20px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${formFields.map(field => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #edf2f7;">
                <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">${field.label}</span>
                <span style="font-size: 15px; color: #1e293b; font-weight: 500;">${field.value}</span>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #26FF0A; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Message</h3>
        <div style="font-size: 16px; color: #334155; line-height: 1.6; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; white-space: pre-wrap;">${message}</div>
      </div>

      <div style="margin-bottom: 40px;">
        <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #26FF0A; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Attachments</h3>
        ${filesHtml}
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 32px;">
        <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
          Powered by <span style="color: #26FF0A; font-weight: 700;">Yoreflow Forms</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

    const textContent = `
New Contact Submission: ${fullName}

${formFields.map(f => `${f.label}: ${f.value}`).join('\n')}

Message:
${message}

Files:
${filesText}
    `;

    const fromEmail = 'forms@yoreflow.online';
    const toEmail = 'info@bankstonalliance.com';
    const bccEmail = 'yoreforms@gmail.com';

    const { data, error } = await resend.emails.send({
      from: `Yoreflow Forms <${fromEmail}>`,
      to: [toEmail],
      bcc: [bccEmail],
      subject: `New Submission: ${fullName}`,
      html: htmlContent,
      text: textContent
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
      data: { resendId: data?.id }
    });

  } catch (error) {
    console.error("Contact form error:", error);
    
    // Save locally on error
    const fs = require('fs').promises;
    const path = require('path');
    const submissionsDir = path.join(__dirname, '..', 'submissions');
    await fs.mkdir(submissionsDir, { recursive: true });
    
    const filename = `submission_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);
    await fs.writeFile(filepath, JSON.stringify({ timestamp: new Date().toISOString(), formData: req.body, error: error.message }, null, 2));
    
    return res.status(500).json({ success: false, error: "Failed to send email. Form saved locally." });
  }
};

module.exports = { submitContactForm };