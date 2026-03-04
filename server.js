require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('\n  ⚠  No SMTP credentials found — contact form will not send emails.');
  console.warn('     Add SMTP_USER and SMTP_PASS to your .env file.\n');
}

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ error: 'Email is not configured on this server.' });
  }

  try {
    await transporter.sendMail({
      from: `"Luz Hernandez Kroll Photography" <${SMTP_USER}>`,
      replyTo: `"${name}" <${email}>`,
      to: 'high-uintas@hotmail.com',
      subject: `Photography Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <hr>
             <p>${message.replace(/\n/g, '<br>')}</p>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// Catch-all → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Luz Hernandez Kroll Photography`);
  console.log(`  Running at http://localhost:${PORT}\n`);
});
