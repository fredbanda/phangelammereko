import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental:{
    serverActions:{
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
        port: "",
        
      }
    ]
    
  }
};

export default nextConfig;
