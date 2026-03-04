require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn('\n  ⚠  No RESEND_API_KEY found — contact form will not send emails.');
  console.warn('     Add RESEND_API_KEY to your .env file.\n');
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!resend) {
    return res.status(500).json({ error: 'Email is not configured on this server.' });
  }

  try {
    await resend.emails.send({
      from: 'contact@luzhernandezkroll.com',
      replyTo: `${name} <${email}>`,
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
