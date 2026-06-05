import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateIcs } from "@/lib/ics";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const { data: appt } = await admin
    .from("appointments")
    .select(
      `id, starts_at, ends_at, project_description,
       clients!inner(auth_user_id),
       studios(name, slug, address, city)`
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!appt) return new Response("Not found", { status: 404 });

  const client = Array.isArray(appt.clients) ? appt.clients[0] : appt.clients;
  if (!client || client.auth_user_id !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const studio = Array.isArray(appt.studios) ? appt.studios[0] : appt.studios;
  if (!studio) return new Response("Studio not found", { status: 404 });

  const ics = generateIcs({
    uid: appt.id,
    title: `Tatouage chez ${studio.name}`,
    description: appt.project_description ?? undefined,
    location: studio.address
      ? `${studio.address}${studio.city ? `, ${studio.city}` : ""}`
      : studio.city ?? undefined,
    startsAt: new Date(appt.starts_at),
    endsAt: new Date(appt.ends_at),
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://inkleeapp.vercel.app"}/portal/appointments/${appt.id}`,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="rdv-${studio.slug}-${appt.id.slice(0, 8)}.ics"`,
    },
  });
}
