"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { homeFor } from "@/lib/modeModel";
import { readHomeHref } from "@/lib/clientCookies";

/**
 * A link to the student's own home — /simulate or /dashboard, whichever their
 * stored mode says.
 *
 * Exists because about twenty places linked to "/dashboard" by name. Under
 * the old arrival-reconcile that was not just a wrong destination: landing on
 * /dashboard rewrote a sim_first student's mode to full, so a link labelled
 * 我的路線圖 silently changed a stored preference. The reconcile is gone, but
 * the destination should still be theirs.
 *
 * Starts at the default-mode home and corrects after mount, the same way the
 * header's logo does: the server cannot see the cookie, and a mismatch on
 * hydration is worse than a first-paint default.
 */
export default function HomeLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [href, setHref] = useState(homeFor(null));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHref(readHomeHref());
  }, []);
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
