import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload warnings during build when no auth token is set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry debug logging to reduce bundle size
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
