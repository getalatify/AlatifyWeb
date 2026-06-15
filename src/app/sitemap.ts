import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://getalatify.com';
  const routes = [
    '',
    '/tools',
    '/tools/compressor',
    '/tools/bg-remover',
    '/tools/resizer',
    '/tools/converter',
    '/tools/cropper',
    '/tools/exif-cleaner',
    '/tools/blur',
    '/tools/stock-finder',
    '/tools/watermark',
    '/tools/upscaler',
    '/tools/qr-toolkit',
    '/privacy',
    '/terms',
    '/about',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/tools/') ? 0.8 : 0.5,
  }));
}
