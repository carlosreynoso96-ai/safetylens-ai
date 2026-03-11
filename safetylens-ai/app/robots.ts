import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/analyze',
        '/audits',
        '/coach',
        '/projects',
        '/settings',
        '/api/',
      ],
    },
    sitemap: 'https://getvorsa.ai/sitemap.xml',
  }
}
