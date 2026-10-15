import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clean frame for the screen recording.
  devIndicators: false,
  // The site was "Pankaj Multitudes" before it became Pankaj Studio: keep old
  // shared links to the website-type pages working.
  async redirects() {
    return [{ source: "/multitudes/:slug", destination: "/websites/:slug", permanent: true }];
  },
};

export default nextConfig;
