import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FontLink from "@/components/FontLink";
import { TAIPEI_SANS_HREFS } from "@/lib/fonts";

/**
 * The public site: landing, about, signup, the line catalogue, class mode.
 * Renders exactly what the root layout rendered before the redesign split
 * the app into route groups (no URL changed).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {TAIPEI_SANS_HREFS.map((h) => (
        <FontLink key={h} href={h} />
      ))}
      <SiteHeader />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
