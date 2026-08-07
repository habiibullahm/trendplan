import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  // Default Server Action body limit is 1 MB; profile photo allows up to 2 MB
  // (+ multipart overhead). See serverActions.bodySizeLimit docs.
  experimental: {
    serverActions: {
      bodySizeLimit: "2.5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    const frameAncestors = {
      key: "Content-Security-Policy",
      value:
        "frame-ancestors 'self' https://habiibullahm.vercel.app http://localhost:4321",
    };
    return [
      { source: "/demo", headers: [frameAncestors] },
      { source: "/demo/:path*", headers: [frameAncestors] },
    ];
  },
};

export default nextConfig;
