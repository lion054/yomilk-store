import nodemailer from 'nodemailer';
import { logger } from '../../lib/logger';
import { rateLimit } from '../../lib/rateLimit';
import type { NextApiRequest, NextApiResponse } from 'next';

const limiter = rateLimit(10, 60 * 1000); // 10 requests per minute

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (limiter(req, res)) return;
  const { action, data } = req.query;

  if (!action || !data || typeof data !== 'string') {
    return res.status(400).send(page('Invalid Request', 'Missing or invalid parameters.'));
  }

  if (action !== 'approve' && action !== 'decline') {
    return res.status(400).send(page('Invalid Action', 'Action must be "approve" or "decline".'));
  }

  let vendor: { companyName: string; contactPerson: string; contactEmail: string; contactPhone: string };
  try {
    vendor = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
  } catch {
    return res.status(400).send(page('Invalid Data', 'Could not decode vendor information.'));
  }

  if (!vendor.contactEmail || !vendor.companyName) {
    return res.status(400).send(page('Invalid Data', 'Missing vendor email or company name.'));
  }

  const approved = action === 'approve';

  try {
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

    const subject = approved
      ? `Snappy Fresh - Vendor Application Approved!`
      : `Snappy Fresh - Vendor Application Update`;

    const body = approved
      ? `Dear ${vendor.contactPerson},

Great news! Your vendor application for "${vendor.companyName}" has been approved by our operations team.

You can now access the Vendor Portal to manage your products, orders, and payouts:

  Login: https://snappyfresh.net/vendor/login

If you haven't set up your password yet, please use the "Forgot Password" link on the login page with your email: ${vendor.contactEmail}

Welcome to the Snappy Fresh family!

Best regards,
The Snappy Fresh Operations Team`
      : `Dear ${vendor.contactPerson},

Thank you for your interest in partnering with Snappy Fresh.

After reviewing your application for "${vendor.companyName}", we are unable to proceed at this time.

If you have questions or would like to discuss further, please contact us at operations@snappyfresh.net or call +263 782 978 460.

Best regards,
The Snappy Fresh Operations Team`;

    await transporter.sendMail({
      from: fromAddress,
      to: vendor.contactEmail,
      replyTo: 'operations@snappyfresh.net',
      subject,
      text: body,
    });

    const title = approved ? 'Vendor Approved' : 'Vendor Declined';
    const msg = approved
      ? `${vendor.companyName} has been approved. A welcome email with portal login instructions has been sent to ${vendor.contactEmail}.`
      : `${vendor.companyName} has been declined. A notification email has been sent to ${vendor.contactEmail}.`;

    logger.info(`Vendor ${action}d:`, { companyName: vendor.companyName, email: vendor.contactEmail });
    return res.status(200).send(page(title, msg));
  } catch (error: any) {
    logger.error('Vendor decision email failed:', error?.message || error);
    return res.status(500).send(page('Error', `Failed to send notification email: ${error?.message || 'Unknown error'}. Please contact the vendor manually.`));
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function page(title: string, message: string) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${safeTitle} - Snappy Fresh</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f7f8fa; }
  .card { background: #fff; border-radius: 16px; padding: 48px; max-width: 500px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  h1 { color: #1a5c38; margin: 0 0 16px; font-size: 24px; }
  p { color: #555; line-height: 1.6; margin: 0; }
</style>
</head>
<body><div class="card"><h1>${safeTitle}</h1><p>${safeMessage}</p></div></body>
</html>`;
}
