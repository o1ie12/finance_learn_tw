import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old single-course URLs → their new line-scoped equivalents.
      // Modules 1–2 belong to 起薪線, 3 to 存錢線, 4 to 信用線, 5 to 投資線.
      { source: "/course/1", destination: "/line/qixin/course/1", permanent: true },
      { source: "/course/2", destination: "/line/qixin/course/2", permanent: true },
      { source: "/course/3", destination: "/line/cunqian/course/3", permanent: true },
      { source: "/course/4", destination: "/line/xinyong/course/4", permanent: true },
      { source: "/course/5", destination: "/line/touzi/course/5", permanent: true },
      { source: "/course", destination: "/lines", permanent: true },
      { source: "/simulation", destination: "/line/qixin/simulation", permanent: true },
    ];
  },
};

export default nextConfig;
