import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../lib/logger';

const DOMAIN = 'https://snappyfresh.net';
const API_BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'https://yomilk.erpona.com:8092/api/';

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/store', changefreq: 'daily', priority: '0.9' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact-us', changefreq: 'monthly', priority: '0.6' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy-policy', changefreq: 'monthly', priority: '0.4' },
  { path: '/vendor-catalogue', changefreq: 'weekly', priority: '0.7' },
  { path: '/vendors', changefreq: 'weekly', priority: '0.6' },
];

async function fetchProducts(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}StoreItems?pageSize=500&pageNumber=1`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.values || data?.data || data?.message || [];
    return Array.isArray(items) ? items : [];
  } catch (err) {
    logger.warn('Sitemap: failed to fetch products');
    return [];
  }
}

async function fetchCategories(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}StoreItemGroups?pageSize=100&pageNumber=1`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.values || data?.data || data?.message || [];
    return Array.isArray(items) ? items : [];
  } catch (err) {
    logger.warn('Sitemap: failed to fetch categories');
    return [];
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const today = new Date().toISOString().split('T')[0];

  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);

  const urls: string[] = [];

  // Static routes
  for (const route of staticRoutes) {
    urls.push(`  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
  }

  // Product pages
  for (const p of products) {
    const code = p.ItemCode || p.itemCode;
    if (!code) continue;
    urls.push(`  <url>
    <loc>${DOMAIN}/product/${escapeXml(code)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Category pages (store with category filter)
  for (const c of categories) {
    const code = c.ItmsGrpCod || c.itmsGrpCod;
    if (!code) continue;
    urls.push(`  <url>
    <loc>${DOMAIN}/store?category=${escapeXml(String(code))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}
