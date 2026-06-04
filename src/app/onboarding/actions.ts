"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const onboardingSchema = z.object({
  studioName: z.string().min(2, "Nom de studio requis"),
  specialty: z.enum(["tattoo", "piercing", "both"]),
  city: z.string().min(2, "Ville requise"),
});

export type OnboardingState = {
  error?: string;
  fieldErrors?: { studioName?: string; specialty?: string; city?: string };
};

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    studioName: formData.get("studioName"),
    specialty: formData.get("specialty"),
    city: formData.get("city"),
  });

  if (!parsed.success) {
    const fieldErrors: OnboardingState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof NonNullable<OnboardingState["fieldErrors"]>;
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const baseSlug = slugify(parsed.data.studioName);
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  const { error } = await supabase.from("studios").insert({
    owner_id: user.id,
    name: parsed.data.studioName,
    slug,
    specialty: parsed.data.specialty,
    city: parsed.data.city,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
