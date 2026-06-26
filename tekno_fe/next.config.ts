// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
// images: {
//     domains: ["res.cloudinary.com","cdn2.cellphones.com.vn",
//       "cellphones.com.vn"], // host ảnh cũ của bạn
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "i.pinimg.com",
//         port: "",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "cdn2.cellphones.com.vn",
//         pathname: "/**",
//       },
//       {
//         protocol: 'https',
//         hostname: 'store.storeimages.cdn-apple.com',
//         port: '',
//         pathname: '/**', // Cho phép tải bất kỳ đường dẫn nào từ domain này
//       },
//       {
//         protocol: 'https',
//         hostname: 'baotinmobile.vn',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },
  
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Tắt hoàn toàn tính năng xác thực hostname
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Dấu sao kép cho phép tất cả hostname
      },
      {
        protocol: 'http', // Nếu bạn cần cả HTTP không bảo mật
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
