const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Configure your SMTP transport via environment variables:
  //   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  // Or leave unconfigured to use Ethereal (test/preview only — no real email sent).
  let transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Ethereal test account (logs preview URL to console)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: 'high-uintas@hotmail.com',
      subject: `Photography Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <hr>
             <p>${message.replace(/\n/g, '<br>')}</p>`,
    });

    if (!process.env.SMTP_HOST) {
      console.log('Test email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
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
