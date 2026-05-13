import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // Return categories list - this would be connected to actual product service
    res.status(200).json({
      success: true,
      data: [],
      count: 0,
      message: 'Categories endpoint ready - connect to product service',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
}
