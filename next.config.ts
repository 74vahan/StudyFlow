import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is fully client-rendered (auth + tasks live in the browser), so
  // the Cache Components / Partial Prefetching prerender model only gets in the
  // way. Keep the default dynamic rendering instead.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
