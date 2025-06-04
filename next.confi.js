/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
      experimental: {
    // ⬇️  pon aquí los módulos grandes que te dan guerra
    serverComponentsExternalPackages: ['pdfjs-dist', 'openai'],
  },
  };
  
  export default nextConfig;
  