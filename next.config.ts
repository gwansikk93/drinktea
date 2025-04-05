/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 🔥 disable lint error saat deploy
  },
  typescript: {
    ignoreBuildErrors: true, // optional: kalau mau skip type error juga
  },
}

export default nextConfig
