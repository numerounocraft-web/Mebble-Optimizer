import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const destination = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/_/backend/api/:path*`
      : "http://localhost:5000/api/:path*";
    return [{ source: "/api/:path*", destination }];
  },
};

export default nextConfig;
