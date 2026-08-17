import { redirect } from "next/navigation";

/** Checkpoints live on Runs (018). Keep the URL as a bookmark. */
export default function CheckpointsRedirectPage() {
  redirect("/runs");
}
