
/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                // eslint-disable-next-line no-undef
                destination: (process.env.BASE_API_BE_URL || 'http://localhost:3001/api') + '/:path*'
            }
        ]
    }
};

export default nextConfig;
