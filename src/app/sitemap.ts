import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/tools/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://getalatify.com';
  
  const staticRoutes = [
    '',
    '/tools',
    '/tools/image',
    '/tools/document',
  ];

  const toolRoutes = TOOLS.map((t) => t.route);

  const otherRoutes = [
    '/privacy',
    '/terms',
    '/about',
    '/embed',
  ];

  const routes = [
    ...staticRoutes,
    ...toolRoutes,
    ...otherRoutes,
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/tools/') ? 0.8 : 0.5,
  }));
}
