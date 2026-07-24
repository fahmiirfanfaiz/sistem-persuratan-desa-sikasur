/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Allow Next.js <Image> to load from Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**",
      },
    ],
  },

  // Strict trailing-slash behaviour (consistent URLs)
  trailingSlash: false,
};

export default nextConfig;
