import { redirect } from "next/navigation";

/** The character is out of the main flow (2026-10-24): onboarding is the goal step. */
export default function CharacterPage() {
  redirect("/onboarding/goal");
}
