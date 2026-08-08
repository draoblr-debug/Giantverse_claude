import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/3dMap/Build/:path*.wasm.br",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Content-Encoding", value: "br" },
        ],
      },
      {
        source: "/3dMap/Build/:path*.framework.js.br",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Content-Encoding", value: "br" },
        ],
      },
      {
        source: "/3dMap/Build/:path*.data.br",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Content-Encoding", value: "br" },
        ],
      },
      {
        source: "/3dMap/Build/:path*.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
