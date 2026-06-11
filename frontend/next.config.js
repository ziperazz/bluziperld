// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  staticPageGenerationTimeout: 0,
};
