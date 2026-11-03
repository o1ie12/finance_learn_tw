import type { NextConfig } from "next";

/**
 * One mode (2026-11-02): the simulation is the course, everywhere. The
 * NEXT_PUBLIC_FLOW_V2=0 escape hatch remains for a rollback (set it, redeploy).
 */
const flowV2 = process.env.NEXT_PUBLIC_FLOW_V2 ?? "1";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_FLOW_V2: flowV2 },
  async redirects() {
    return [
      // 11 DOM-1: one production address. The old production hostname and
      // the bare domain go to www with a 308, keeping the path and query.
      // Preview deployments have their own hostnames and are not touched.
      // A signed-in student lands signed out (cookies belong to a host) and
      // logs back in with their six-digit code.
      {
        source: "/:path*",
        has: [{ type: "host", value: "finance-learn-tw.vercel.app" }],
        destination: "https://www.finlinetw.org/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "finlinetw.org" }],
        destination: "https://www.finlinetw.org/:path*",
        permanent: true,
      },
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
