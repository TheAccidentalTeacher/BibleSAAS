import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Supabase Storage (avatars, audio covers, export PDFs)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Expose public env vars to the browser bundle
  // (NEXT_PUBLIC_* vars are automatically included — this is for documentation)
  // Private vars (ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, etc.) stay server-side only

  // NOTE: next-pwa (PWA service worker) is added in Phase 17
  // It is not included here because as of Next.js 16 there is no compatible
  // next-pwa release. Phase 17 will implement the service worker directly.
};

export default nextConfig;
