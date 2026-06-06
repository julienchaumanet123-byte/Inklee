import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { autoLoginToPortal, finalizeBookingIfPaid } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { session_id?: string; appointment_id?: string };
}) {
  let appointmentDate: Date | null = null;
  let amount: number | null = null;
  let clientFirstName: string | null = null;
  let studioName: string | null = null;
  let confirmed = false;
  let depositPaid = false;

  // On utilise appointment_id (présent dans le success_url) plutôt que
  // session_id Stripe car la session est sur le compte Connect du studio.
  const appointmentId = searchParams.appointment_id ?? null;

  // Filet de sécurité : confirme le RDV (acompte) si le webhook n'a pas encore
  // tourné. Sans acompte, le RDV est déjà confirmé dès la création.
  if (appointmentId) {
    await finalizeBookingIfPaid(appointmentId, searchParams.session_id ?? null);
  }

  if (appointmentId) {
    const supabase = createAdminClient();
    const { data: appt } = await supabase
      .from("appointments")
      .select(
        "starts_at, deposit_amount, deposit_paid, status, client_id, studio_id"
      )
      .eq("id", appointmentId)
      .maybeSingle();
    if (appt) {
      appointmentDate = new Date(appt.starts_at);
      amount = appt.deposit_amount;
      confirmed = appt.status === "confirmed";
      depositPaid = appt.deposit_paid;

      const [{ data: client }, { data: studio }] = await Promise.all([
        supabase
          .from("clients")
          .select("first_name")
          .eq("id", appt.client_id)
          .maybeSingle(),
        supabase
          .from("studios")
          .select("name")
          .eq("id", appt.studio_id)
          .maybeSingle(),
      ]);
      clientFirstName = client?.first_name ?? null;
      studioName = studio?.name ?? null;
    }
  }

  async function handleEnterPortal() {
    "use server";
    if (appointmentId) {
      await autoLoginToPortal(appointmentId);
    }
    // autoLoginToPortal redirige en cas de succès ; si on arrive ici, le
    // magic link n'a pas pu être généré → fallback vers la connexion portail.
    redirect("/portal/login");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

      <div className="relative max-w-lg w-full">
        {/* Confirmation */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/20 mb-6 gold-glow">
            <CheckCircle2 className="w-10 h-10 text-foreground" />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            {clientFirstName ? `Merci ${clientFirstName} !` : "C'est confirmé."}
          </h1>

          {appointmentDate && studioName && (
            <p className="text-lg text-ink-200 mb-1 text-balance">
              {confirmed ? (
                <>
                  Ton rendez-vous chez{" "}
                  <strong className="text-foreground">{studioName}</strong> est
                  confirmé pour le{" "}
                  <span className="text-foreground">
                    {formatDateTime(appointmentDate)}
                  </span>
                  .
                </>
              ) : (
                <>
                  Ta réservation chez{" "}
                  <strong className="text-foreground">{studioName}</strong> pour
                  le{" "}
                  <span className="text-foreground">
                    {formatDateTime(appointmentDate)}
                  </span>{" "}
                  est en cours de validation.
                </>
              )}
            </p>
          )}

          {depositPaid ? (
            <p className="text-sm text-ink-400 mt-3">
              Acompte de {formatPrice(amount ?? 0)} reçu ✓
            </p>
          ) : !confirmed && amount ? (
            <p className="text-sm text-ink-400 mt-3">
              Confirmation de l'acompte de {formatPrice(amount)} en cours…
            </p>
          ) : null}
        </div>

        {/* CTA principal : portail */}
        <form action={handleEnterPortal} className="mb-6">
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02] p-6 gold-glow grain">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-1">
                  Discute du projet avec {studioName ?? "ton tatoueur"}
                </h2>
                <p className="text-sm text-ink-300">
                  On t'a créé un espace perso pour échanger des références,
                  poser tes questions et suivre tes RDV. Un clic et tu y es.
                </p>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Accéder à mon espace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Email rappel */}
        <div className="flex items-center gap-3 text-sm text-ink-400 mb-8">
          <Mail className="w-4 h-4" />
          On t'a aussi envoyé un récap par email.
        </div>

        {/* Lien retour studio */}
        <div className="text-center">
          <Link
            href={`/${params.slug}`}
            className="text-sm text-ink-400 hover:text-foreground transition-colors"
          >
            ← Retour au studio
          </Link>
        </div>
      </div>
    </main>
  );
}
