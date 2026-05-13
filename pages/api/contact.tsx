import nodemailer from 'nodemailer';
import { logger } from '../../lib/logger';
import { rateLimit } from '../../lib/rateLimit';

const limiter = rateLimit(5, 60 * 1000); // 5 requests per minute

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (limiter(req, res)) return;

  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const subjectLabels: any = {
    general: 'General Inquiry',
    order: 'Order Support',
    delivery: 'Delivery Issue',
    vendor: 'Become a Vendor',
    feedback: 'Feedback',
    other: 'Other',
  };

  const emailBody = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subjectLabels[subject] || subject}

Message
-------
${message}

---
This message was submitted via the Snappy Fresh website contact form.
  `.trim();

  const transporter = nodemailer.createTransport({
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587'),
    secure: process.env['SMTP_SECURE'] === 'true',
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });

  try {
    await transporter.sendMail({
      from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
      to: `operations@snappyfresh.net, ${email}`,
      replyTo: email,
      subject: `Contact Form: ${subjectLabels[subject] || subject} - ${name}`,
      text: emailBody,
    });

    return res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error: any) {
    logger.error('Failed to send contact email:', error?.message || error);
    logger.error('SMTP Config:', { host: process.env['SMTP_HOST'], port: process.env['SMTP_PORT'], user: process.env['SMTP_USER'], from: process.env['SMTP_FROM'] });
    const detail = error?.responseCode ? ` (SMTP ${error.responseCode}: ${error.response})` : '';
    return res.status(500).json({ message: `Failed to send message${detail}. Please try again or contact us directly.` });
  }
}
