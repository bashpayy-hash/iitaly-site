import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    // Owner, 23 Nov: «в целом оптимизируй сайт, чтобы все быстрее
    // прогружалось». With the default strategy the bundler merged the styles
    // of the cabinet, the guides and the questionnaire into two files that
    // every page loads before it can draw: the home page fetched 325 KB of
    // styles (55 KB compressed) and used 45% of them. `graph` groups styles by
    // the routes that import them (node_modules/next/dist/docs, cssChunking):
    // the home page loads 144 KB (28 KB compressed), in 7 files instead of 5.
    cssChunking: "graph",
  },
};

export default nextConfig;
