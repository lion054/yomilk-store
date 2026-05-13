import nodemailer from 'nodemailer';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { logger } from '../../lib/logger';
import { rateLimit } from '../../lib/rateLimit';

const limiter = rateLimit(3, 60 * 1000); // 3 requests per minute

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: any) {
  return new Promise((resolve: any, reject: any) => {
    const form = new IncomingForm({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxTotalFileSize: 50 * 1024 * 1024, // 50MB total
    });
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (limiter(req, res)) return;

  let parsedFiles: any = [];

  try {
    const { fields, files } = await parseForm(req) as any;

    // formidable v3+ wraps field values in arrays
    const field = (name: any) => {
      const val = fields[name];
      return Array.isArray(val) ? val[0] : val || '';
    };

    const companyName = field('companyName');
    const tradingName = field('tradingName');
    const contactPerson = field('contactPerson');
    const contactEmail = field('contactEmail');
    const contactPhone = field('contactPhone');
    const street = field('street');
    const city = field('city');
    const suburb = field('suburb');
    const countryCode = field('countryCode');
    const productCategories = field('productCategories');
    const message = field('message');

    if (!companyName || !contactPerson || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Collect uploaded files
    const attachments = files.attachments
      ? (Array.isArray(files.attachments) ? files.attachments : [files.attachments])
      : [];
    parsedFiles = attachments;

    // Build approve/decline links
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || process.env['NEXTAUTH_URL'] || 'https://snappyfresh.net';
    const vendorData = Buffer.from(JSON.stringify({ companyName, contactPerson, contactEmail, contactPhone })).toString('base64url');
    const approveUrl = `${siteUrl}/api/vendor-decision?action=approve&data=${vendorData}`;
    const declineUrl = `${siteUrl}/api/vendor-decision?action=decline&data=${vendorData}`;

    const emailBody = `
New Vendor/Supplier Application

Company Information
-------------------
Company Name: ${companyName}
Trading Name: ${tradingName || 'N/A'}

Contact Details
---------------
Contact Person: ${contactPerson}
Email: ${contactEmail}
Phone: ${contactPhone}

Business Address
----------------
Country: ${countryCode || 'N/A'}
City: ${city || 'N/A'}
Suburb: ${suburb || 'N/A'}
Street: ${street || 'N/A'}

Product Categories
------------------
${productCategories || 'Not specified'}

Additional Message
------------------
${message || 'None'}

Attachments: ${attachments.length > 0 ? attachments.map((f: any) => f.originalFilename).join(', ') : 'None'}

---
ACTION REQUIRED — Click one of the links below:

  APPROVE: ${approveUrl}
  DECLINE: ${declineUrl}

This application was submitted via the Snappy Fresh website.
    `.trim();

    // Build email attachments from uploaded files
    const emailAttachments = attachments.map((file: any) => ({
      filename: file.originalFilename || file.newFilename,
      path: file.filepath,
    }));

    const transporter = nodemailer.createTransport({
      host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
      port: parseInt(process.env['SMTP_PORT'] || '587'),
      secure: process.env['SMTP_SECURE'] === 'true',
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    });

    const fromAddress = process.env['SMTP_FROM'] || process.env['SMTP_USER'];

    // Send application details to operations
    await transporter.sendMail({
      from: fromAddress,
      to: 'operations@snappyfresh.net',
      replyTo: contactEmail,
      subject: `New Vendor Application: ${companyName}`,
      text: emailBody,
      attachments: emailAttachments,
    });

    // Send confirmation to the applicant
    const confirmText = `Dear ${contactPerson},

Thank you for your interest in partnering with Snappy Fresh!

We have received your vendor application for "${companyName}". Our operations team will review your application and get back to you within 2-3 business days.

If you have any questions in the meantime, feel free to reply to this email or contact us at operations@snappyfresh.net.

Best regards,
The Snappy Fresh Team`;

    await transporter.sendMail({
      from: fromAddress,
      to: contactEmail,
      replyTo: 'operations@snappyfresh.net',
      subject: 'Snappy Fresh - Application Received',
      text: confirmText,
    });

    // Clean up temp files
    for (const file of attachments) {
      fs.unlink(file.filepath, () => {});
    }

    return res.status(200).json({ message: 'Application submitted successfully.' });
  } catch (error: any) {
    logger.error('Failed to send vendor signup email:', error?.message || error);
    logger.error('SMTP Config:', { host: process.env['SMTP_HOST'], port: process.env['SMTP_PORT'], user: process.env['SMTP_USER'], from: process.env['SMTP_FROM'] });

    // Clean up temp files on error
    for (const file of parsedFiles) {
      fs.unlink(file.filepath, () => {});
    }

    const detail = error?.responseCode ? ` (SMTP ${error.responseCode}: ${error.response})` : '';
    return res.status(500).json({ message: `Failed to submit application${detail}. Please try again or contact us directly.` });
  }
}
