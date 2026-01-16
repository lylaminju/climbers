import type { RequestHandler } from '@sveltejs/kit';

export const prerender = true;

const BASE = 'https://climberz.day';

const urls = ['/', '/find-partners'];

// Dynamically generates XML sitemap for search engines to discover pages
const generate = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE}${u}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

export const GET: RequestHandler = async () => {
  const body = generate();
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};
