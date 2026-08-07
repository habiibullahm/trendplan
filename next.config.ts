import type { NextConfig } from "next";

/** Vercel Blob public URL host: `{storeId}.public.blob.vercel-storage.com`. */
function vercelBlobRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "https",
      hostname: "*.public.blob.vercel-storage.com",
      pathname: "/**",
    },
  ];

  // Exact store host (from token) — recommended by Vercel Blob + next/image docs.
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(token ?? "")?.[1];
  if (storeId) {
    patterns.unshift(
      new URL(
        `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/**`,
      ),
    );
  }

  return patterns;
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "sharp"],
  // Default Server Action body limit is 1 MB; profile photo allows up to 2 MB
  // (+ multipart overhead). See serverActions.bodySizeLimit docs.
  experimental: {
    serverActions: {
      bodySizeLimit: "2.5mb",
    },
  },
  images: {
    remotePatterns: vercelBlobRemotePatterns(),
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
