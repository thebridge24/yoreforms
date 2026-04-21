const { Resend } = require('resend');

const submitDefaultContactForm = async (req, res) => {
  try {
    console.log('Received default contact form submission');

    const { 
      fullName, 
      email, 
      company, 
      projectDetails 
    } = req.body;

    if (!fullName || !email || !company || !projectDetails) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled"
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const formFields = [
      { label: "Full Name", value: fullName },
      { label: "Email Address", value: email },
      { label: "Company", value: company }
    ];

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
        <div style="font-size: 11px; font-weight: 800; color: #26FF0A; letter-spacing: 0.1em; text-transform: uppercase;">New Project Inquiry</div>
      </div>

      <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em;">${fullName}</h1>
      <p style="margin: 0 0 40px 0; font-size: 16px; color: #64748b; text-align: center;">New project inquiry received via Yoreflow Forms.</p>

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

      <div style="margin-bottom: 40px;">
        <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #26FF0A; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Project Details</h3>
        <div style="font-size: 16px; color: #334155; line-height: 1.6; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; white-space: pre-wrap;">${projectDetails}</div>
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
New Project Inquiry: ${fullName}

${formFields.map(f => `${f.label}: ${f.value}`).join('\n')}

Project Details:
${projectDetails}
    `;

    const fromEmail = 'forms@yoreflow.online';
    const toEmail = 'stackgateinternational@gmail.com';
    const bccEmail = 'johnayomide920@gmail.com';

    const { data, error } = await resend.emails.send({
      from: `Yoreflow Forms <${fromEmail}>`,
      to: [toEmail],
      bcc: [bccEmail],
      subject: `New Project Inquiry: ${fullName} - ${company}`,
      html: htmlContent,
      text: textContent
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Form submitted successfully",
      data: { resendId: data?.id }
    });

  } catch (error) {
    console.error("Default contact form error:", error);
    
    const fs = require('fs').promises;
    const path = require('path');
    const submissionsDir = path.join(__dirname, '..', 'submissions');
    await fs.mkdir(submissionsDir, { recursive: true });
    
    const filename = `default_submission_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);
    await fs.writeFile(filepath, JSON.stringify({ timestamp: new Date().toISOString(), formData: req.body, error: error.message }, null, 2));
    
    return res.status(500).json({ success: false, error: "Failed to send email. Form saved locally." });
  }
};

module.exports = { submitDefaultContactForm };