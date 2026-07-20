import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // 개발 중 같은 와이파이의 폰 브라우저(예: 192.168.x.x)에서 접속할 때
  // HMR 웹소켓이 cross-origin으로 막히지 않도록 허용한다.
  allowedDevOrigins: ["192.168.219.169"],
  devIndicators: false,
};

export default nextConfig;
