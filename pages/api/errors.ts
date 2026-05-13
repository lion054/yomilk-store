import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../lib/logger';

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent?: string;
  userId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const errorLog: ErrorLog = {
      message: req.body.message || 'Unknown error',
      stack: req.body.stack,
      componentStack: req.body.componentStack,
      timestamp: req.body.timestamp || new Date().toISOString(),
      url: req.body.url || req.headers.referer || 'unknown',
      userAgent: req.headers['user-agent'],
    };

    // Log to server logs
    logger.error('Client-side error reported:', errorLog);

    // In production, send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, Rollbar, or other service
      // await sendToErrorTrackingService(errorLog);
    }

    return res.status(200).json({ success: true, message: 'Error logged' });
  } catch (error: any) {
    logger.error('Failed to log client error:', error);
    return res.status(500).json({ error: 'Failed to log error' });
  }
}
