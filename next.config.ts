import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
    typescript: {
    // 警告：仅在调试时使用
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
