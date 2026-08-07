import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  async headers() {
    return [
      {
        source: "/demo",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://habiibullahm.vercel.app http://localhost:4321",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
