/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    MONGO_HOST: process.env.MONGO_HOST,
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_NAME: process.env.MONGO_NAME,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
  },
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
