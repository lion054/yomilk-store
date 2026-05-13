import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../lib/sessionConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (req.method === 'GET') {
    // Return the token (only accessible server-side, never exposed to client JS)
    return res.json({ token: session.token || null });
  }

  if (req.method === 'POST') {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    session.token = token;
    await session.save();
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    session.destroy();
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
