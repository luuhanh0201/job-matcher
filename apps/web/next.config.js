
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dn3k4bznz/**',
      },
    ],
  },
    async rewrites() {
        
        return [
           {
                source: '/api/:path*',
                // eslint-disable-next-line no-undef
                destination: (process.env.BASE_API_BE_URL || 'http://api:3001/api') + '/:path*'
            }
        ]
    }
};

export default nextConfig;
