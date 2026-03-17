/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    env: {
        PUBLIC_URL: process.env.NODE_ENV === 'production' ? `/` : '/',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
        CURRANCY: process.env.CURRANCY,
        THEMEID: process.env.THEMEID,
        NEXT_PUBLIC_ENCRYPT_SECRET_KEY: process.env.NEXT_PUBLIC_ENCRYPT_SECRET_KEY,
        PORT: process.env.PORT,
        ENCRYPT: process.env.ENCRYPT,
        ALGORITHM: process.env.ALGORITHM,
        ENCRYPT_SECRET_KEY: process.env.ENCRYPT_SECRET_KEY,
        ENCRYPT_IV: process.env.ENCRYPT_IV,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
}

module.exports = nextConfig
