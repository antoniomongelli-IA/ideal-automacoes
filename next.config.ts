import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // versão do site (commit) para aparecer na tela de erro do cardápio
    NEXT_PUBLIC_VERSAO: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  },
};

export default nextConfig;
