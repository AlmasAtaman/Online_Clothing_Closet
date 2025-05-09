import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["clothing-images-vrc-4107.s3.us-east-1.amazonaws.com"], // 👈 your S3 bucket region & name
  },
};

export default nextConfig;
