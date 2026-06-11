import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bluziperld.ir';

  // لیستی از صفحات عمومی که ثابت هستند
  const routes = [
    '',              // Home
    '/products',
    '/support',
    '/support/new',
    '/auth',
    '/forgot-password',
    '/rules',
    '/letters',
    '/cart',
    '/checkout',
    '/about-us',
    '/shipping',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
