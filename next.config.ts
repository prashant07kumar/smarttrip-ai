// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   trailingSlash: false,
// };

// export default nextConfig;



import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'color-functions'],
  },
};

export default nextConfig;