import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const category = _req.query['category'];
    const limit = parseInt((_req.query['limit'] as string) || '20');
    const offset = parseInt((_req.query['offset'] as string) || '0');

    // Placeholder response - connect to actual product service as needed
    res.status(200).json({
      success: true,
      data: [],
      total: 0,
      limit,
      offset,
      category: category || null,
      message: 'Products endpoint ready - connect to product service',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
}
