import type { NextConfig } from "next";

// The backend's address. Needed at build time too: shop pages are pre-rendered from its data.
const api = (process.env.API_URL ?? "").trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Uploaded photos and videos live in the backend (MongoDB). /media/* is passed straight through,
  // so image URLs stay on the shop's own domain and next/image can resize them.
  async rewrites() {
    return api ? [{ source: "/media/:name", destination: `${api}/media/:name` }] : [];
  },
};

export default nextConfig;
