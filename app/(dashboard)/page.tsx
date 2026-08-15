import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { isPlatformAdmin, isTenantAdmin } from "@/lib/session-role";

/** Role home — System status is chrome, not a destination. */
export default async function HomeRedirectPage() {
  const session = await getSession();
  if (isPlatformAdmin(session)) redirect("/programmes");
  if (isTenantAdmin(session)) {
    const entered = await getEnteredProgrammeContext();
    redirect(entered ? "/runs" : "/programmes/enter");
  }
  redirect("/login");
}
