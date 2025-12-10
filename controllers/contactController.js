const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

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

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const interestsText = Array.isArray(interests) ? interests.join(', ') : interests;
    
    let filesText = 'No files uploaded';
    let filesHtml = '<p>No files uploaded</p>';
    
if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
  filesText = uploadedFiles.map((url, index) => 
    `File ${index + 1}: ${url}`
  ).join('\n');
  
  filesHtml = uploadedFiles.map((url, index) => 
    `<p><strong>File ${index + 1}:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a> (Click to download)</p>`
  ).join('');
}

    const mailOptions = {
      from: `"BridgeForms" <${process.env.GMAIL_USER}>`,
      to: 'johnayomide920@gmail.com',
      bcc: 'alexanderchrist203@gmail.com',
      subject: `BridgeForms - New Contact from ${fullName}`,
      text: `
Contact Form Submission

Personal Information:
Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
Contact Method: ${contactMethod}

Business Information:
Company Name: ${companyName || 'Not provided'}
Employees: ${numEmployees || 'Not provided'}
Service: ${service}
Interests: ${interestsText || 'None'}

Files:
${filesText}

Message:
${message}
      `,
      html: `
<div style="
  background:#ffffff;
  color:#000000;
  padding:24px;
  font-family:Arial, sans-serif;
  border-radius:12px;
  max-width:640px;
  margin:auto;
  border:1px solid #e5e5e5;
">
  
  <h2 style="margin:0 0 8px 0; font-size:24px;">New Contact Form Submission</h2>
  <p style="margin:0 0 20px 0; color:#444;">From Contact Website</p>

  <!-- CONTACT INFORMATION -->
  <div style="margin-bottom:24px;">
    <h3 style="font-size:18px; margin-bottom:8px; border-left:4px solid red; padding-left:8px;">
      Contact Information
    </h3>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Contact Method:</strong> ${contactMethod}</p>
  </div>

  <!-- BUSINESS DETAILS -->
  <div style="margin-bottom:24px;">
    <h3 style="font-size:18px; margin-bottom:8px; border-left:4px solid red; padding-left:8px;">
      Business Details
    </h3>
    <p><strong>Company Name:</strong> ${companyName || 'Not provided'}</p>
    <p><strong>Number of Employees:</strong> ${numEmployees || 'Not provided'}</p>
    <p><strong>Service Interested In:</strong> ${service}</p>
    <p><strong>Interests:</strong> ${interestsText || 'None'}</p>
  </div>

  <!-- FILES -->
  <div style="margin-bottom:24px;">
    <h3 style="font-size:18px; margin-bottom:8px; border-left:4px solid red; padding-left:8px;">
      Uploaded Files (${Array.isArray(uploadedFiles) ? uploadedFiles.length : 0})
    </h3>
    ${filesHtml}
  </div>

  <!-- MESSAGE -->
  <div style="margin-bottom:32px;">
    <h3 style="font-size:18px; margin-bottom:8px; border-left:4px solid red; padding-left:8px;">
      Message
    </h3>
    <div style="
      background:#fafafa;
      padding:16px;
      border-radius:8px;
      border:1px solid #eee;
    ">
      <p style="margin:0; line-height:1.5;">${message}</p>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center; margin-top:32px; font-size:14px; color:#333;">
    Powered by 
    <span style="color:red; font-weight:bold;">BridgeForms</span>
  </div>

</div>
`

    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    return res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
      data: {
        name: fullName,
        email: email,
        filesCount: Array.isArray(uploadedFiles) ? uploadedFiles.length : 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Contact form error:", error);
    
    const submissionsDir = path.join(__dirname, '..', 'submissions');
    await fs.mkdir(submissionsDir, { recursive: true });
    
    const filename = `submission_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);
    
    const submissionData = {
      timestamp: new Date().toISOString(),
      formData: req.body,
      error: error.message
    };
    
    await fs.writeFile(filepath, JSON.stringify(submissionData, null, 2));
    
    return res.status(500).json({
      success: false,
      error: "Failed to send email. Form saved locally.",
      submissionId: filename
    });
  }
};

module.exports = {
  submitContactForm
};