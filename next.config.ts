import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
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
