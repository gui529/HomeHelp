import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.fl.yelpcdn.com' },
    ],
  },
};

export default nextConfig;
