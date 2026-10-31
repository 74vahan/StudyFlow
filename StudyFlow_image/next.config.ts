import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: build a self-contained server (.next/standalone) so the
  // Docker image (StudyFlow_infra/Dockerfile) stays small.
  output: "standalone",
  // Auth and task data live in server API routes (dynamic); the pages that call
  // them are client components. Default dynamic rendering suits this best.
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
