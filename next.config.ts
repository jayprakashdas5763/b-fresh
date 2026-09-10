import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ihbbnvlznfzdrtgcznlq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    // Your local network is resolving the public Supabase hostname
    // through an address that Next.js classifies as private.
    // Allow this only during local development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;