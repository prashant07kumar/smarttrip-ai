// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   trailingSlash: false,
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
};

export default nextConfig;