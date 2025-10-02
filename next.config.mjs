/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Avoid importing node-canvas in the browser for konva
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
