/** Konfigurasi Next.js. */

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'cloudinary'],
};

export default nextConfig;
