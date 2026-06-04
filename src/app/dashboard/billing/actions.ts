"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const upgradeSchema = z.object({
  plan: z.enum(["starter", "pro", "studio"]),
});

/**
 * ⚠️ TEMPORAIRE — pour le MVP, le changement de plan se fait directement
 * en DB sans facturation. À remplacer par Stripe Subscription (Stripe
 * Checkout session en mode `subscription`, avec webhook subscription
 * lifecycle) une fois ce volet codé.
 */
export async function changePlan(formData: FormData) {
  const parsed = upgradeSchema.safeParse({ plan: formData.get("plan") });
  if (!parsed.success) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("studios")
    .update({ plan_tier: parsed.data.plan })
    .eq("owner_id", user.id);

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
}
