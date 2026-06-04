import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <h1 className="font-display text-4xl font-bold mb-2">Settings</h1>
      <p className="text-ink-300 mb-10">
        Ce que tes clients voient sur ta page de réservation publique.
      </p>

      <SettingsForm studio={studio} />
    </div>
  );
}
