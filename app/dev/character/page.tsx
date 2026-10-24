import { notFound } from "next/navigation";
import Review from "./Review";

/** Dev-only character review (06 E10.7). 404 in production. */
export default async function CharacterReviewPage({ searchParams }: { searchParams: Promise<{ scene?: string; color?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <Review q={await searchParams} />;
}
