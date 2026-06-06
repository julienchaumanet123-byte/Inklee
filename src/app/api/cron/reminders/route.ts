import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/sms";
import { PLANS } from "@/lib/plans";
import { formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cron quotidien (vercel.json) : envoie un SMS de rappel aux clients ayant un
// RDV confirmé le lendemain. Idempotent via reminder_sent_at.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fenêtre = la journée de demain
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const { data: appts } = await supabase
    .from("appointments")
    .select("id, starts_at, studio_id, client_id")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("starts_at", start.toISOString())
    .lte("starts_at", end.toISOString());

  let sent = 0;
  let skipped = 0;

  for (const appt of appts ?? []) {
    const [{ data: studio }, { data: client }] = await Promise.all([
      supabase
        .from("studios")
        .select("name, plan_tier")
        .eq("id", appt.studio_id)
        .maybeSingle(),
      supabase
        .from("clients")
        .select("first_name, phone")
        .eq("id", appt.client_id)
        .maybeSingle(),
    ]);

    // Le rappel SMS est une feature Pro/Studio.
    if (!studio || !PLANS[studio.plan_tier].features.sms_reminders) {
      skipped++;
      continue;
    }
    if (!client?.phone) {
      skipped++;
      continue;
    }

    const body = `Rappel ${studio.name} : tu as rendez-vous demain, ${formatDateTime(
      new Date(appt.starts_at)
    )}. À très vite !`;

    const ok = await sendSms(client.phone, body);
    if (ok) {
      await supabase
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appt.id);
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, total: (appts ?? []).length });
}
