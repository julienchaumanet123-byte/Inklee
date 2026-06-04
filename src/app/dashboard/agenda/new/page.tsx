import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewAppointmentForm } from "./form";

export default function NewAppointmentPage() {
  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <Link
        href="/dashboard/agenda"
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'agenda
      </Link>

      <h1 className="font-display text-4xl font-bold mb-2">Nouveau rendez-vous</h1>
      <p className="text-ink-300 mb-8">
        Création manuelle. Pour les RDV pris en ligne, utilise ta page de réservation.
      </p>

      <Card>
        <CardContent className="pt-6">
          <NewAppointmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
