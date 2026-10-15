import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site was "Pankaj Multitudes" before it became Pankaj Studio: keep old
  // shared links to the website-type pages working.
  async redirects() {
    return [{ source: "/multitudes/:slug", destination: "/websites/:slug", permanent: true }];
  },
};

export default nextConfig;
