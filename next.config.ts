/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com', // Add this if you use GitHub auth
      'ui-avatars.com', // Add if you use placeholder avatars
    ],
  },
  // other configurations...
};

module.exports = nextConfig;