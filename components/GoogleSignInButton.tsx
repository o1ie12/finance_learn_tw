import Link from "next/link";
import { isGoogleAuthConfigured } from "@/lib/supabaseAuth";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * Server component (no client JS needed — it's a plain link to the OAuth
 * start route) rendering nothing when Google sign-in isn't configured for
 * this deployment, same as the rest of the app's isBackendConfigured() gating.
 *
 * Carries its own ToS/privacy consent line for the "signin" intent (the
 * moment that matters for Google's own OAuth review) so every place this
 * button appears gets it automatically, rather than relying on each parent
 * page to remember to add it. Not shown for "link" — an existing
 * code-holder connecting Google to an account they already agreed to terms
 * for, not a first-consent moment.
 */
export default function GoogleSignInButton({
  intent = "signin",
  label = "使用 Google 登入",
  className = "",
}: {
  intent?: "signin" | "link";
  label?: string;
  className?: string;
}) {
  if (!isGoogleAuthConfigured()) return null;

  return (
    <div>
      <a
        href={`/api/auth/google/start?intent=${intent}`}
        className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink ${className}`}
      >
        <GoogleMark />
        {label}
      </a>
      {intent === "signin" && (
        <p className="mt-2.5 text-center text-xs text-ink-faint">
          登入即代表您同意
          <Link href="/terms" className="underline hover:text-ink">
            《服務條款》
          </Link>
          與
          <Link href="/privacy" className="underline hover:text-ink">
            《隱私權政策》
          </Link>
        </p>
      )}
    </div>
  );
}
