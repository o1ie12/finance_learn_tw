import { redirect } from "next/navigation";

/** The character creator moved to the Part E shell (06 E8.8). */
export default function CharacterPage() {
  redirect("/creator");
}
