import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ERP_BASE_URL = 'https://yomilk.erpona.com:3330/';
const ALLOWED_HOSTS = ['yomilk.erpona.com'];
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ERP uses self-signed cert
});

const CACHE_DIR = path.join('/tmp', 'img-cache');
const CACHE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Predefined width presets to avoid unbounded cache growth
const WIDTH_PRESETS: Record<string, number> = {
  thumb: 200,
  card: 400,
  detail: 800,
  zoom: 1600,
};
const ALLOWED_WIDTHS = [200, 400, 800, 1200, 1600];

const SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png'] as const;
type ImageFormat = (typeof SUPPORTED_FORMATS)[number];

// Ensure cache directory exists
try {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
} catch {}

function resolveWidth(w: string | undefined): number | undefined {
  if (!w) return undefined;
  // Check named presets first
  if (WIDTH_PRESETS[w]) return WIDTH_PRESETS[w];
  const num = parseInt(w, 10);
  if (isNaN(num) || num <= 0) return undefined;
  // Snap to nearest allowed width to limit cache variants
  return ALLOWED_WIDTHS.reduce((prev, curr) =>
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  );
}

function resolveFormat(f: string | undefined, acceptHeader: string | undefined): ImageFormat {
  if (f && f !== 'auto') {
    return SUPPORTED_FORMATS.includes(f as ImageFormat) ? (f as ImageFormat) : 'webp';
  }
  // Auto-negotiate from Accept header
  if (acceptHeader?.includes('image/avif')) return 'avif';
  if (acceptHeader?.includes('image/webp')) return 'webp';
  return 'jpeg';
}

function resolveQuality(q: string | undefined): number {
  if (!q) return 80;
  const num = parseInt(q, 10);
  if (isNaN(num) || num < 1 || num > 100) return 80;
  return num;
}

function getCacheKey(imagePath: string, width: number | undefined, quality: number, format: ImageFormat): string {
  const raw = `${imagePath}|${width || 'orig'}|${quality}|${format}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

const CONTENT_TYPES: Record<ImageFormat, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

function fetchFromERP(url: URL): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        agent: httpsAgent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      },
      (res) => {
        const statusCode = res.statusCode || 502;
        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          return reject(new Error(`ERP returned ${statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Image fetch timeout'));
    });
    req.on('error', reject);
  });
}

async function processImage(
  buffer: Buffer,
  width: number | undefined,
  quality: number,
  format: ImageFormat
): Promise<Buffer> {
  let pipeline = sharp(buffer);

  if (width) {
    pipeline = pipeline.resize(width, undefined, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  switch (format) {
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
  }

  return pipeline.toBuffer();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: imagePath, w, q, f } = req.query;

  if (!imagePath || typeof imagePath !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid path parameter' });
  }

  if (imagePath.includes('..') || imagePath.includes('//')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const imageUrl = new URL(imagePath.replace(/^\/+/, ''), ERP_BASE_URL);

  // Validate the resolved URL points to the allowed ERP host only (SSRF protection)
  if (!ALLOWED_HOSTS.includes(imageUrl.hostname)) {
    return res.status(403).json({ error: 'Forbidden: invalid host' });
  }

  const width = resolveWidth(w as string | undefined);
  const quality = resolveQuality(q as string | undefined);
  const format = resolveFormat(f as string | undefined, req.headers.accept);

  const cacheKey = getCacheKey(imagePath, width, quality, format);
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.${format}`);

  // Try serving from disk cache
  try {
    const stat = fs.statSync(cachePath);
    const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;
    if (ageSeconds < CACHE_MAX_AGE) {
      res.setHeader('Content-Type', CONTENT_TYPES[format]);
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Cache', 'HIT');
      const cached = fs.readFileSync(cachePath);
      return res.status(200).send(cached);
    }
  } catch {
    // Cache miss, proceed to fetch
  }

  try {
    const rawBuffer = await fetchFromERP(imageUrl);
    const optimized = await processImage(rawBuffer, width, quality, format);

    // Write to cache asynchronously (don't block response)
    fs.writeFile(cachePath, optimized, () => {});

    res.setHeader('Content-Type', CONTENT_TYPES[format]);
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).send(optimized);
  } catch (error: any) {
    console.error('[img-proxy] Error:', error?.message || error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to fetch or process image', detail: error?.message });
    }
    res.end();
  }
}

// Increase body size limit for image responses
export const config = {
  api: {
    responseLimit: '10mb',
  },
};
