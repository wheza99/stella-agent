import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.tripay.co.id",
      },
    ],
  },
};

export default nextConfig;
