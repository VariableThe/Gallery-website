import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nc.vrbl.win",
      },
    ],
  },
};

export default nextConfig;
