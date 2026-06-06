import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./_layout";

export type BookingConfirmedClientProps = {
  clientFirstName: string;
  studioName: string;
  studioCity?: string | null;
  appointmentDateLabel: string; // déjà formaté FR
  depositAmountLabel?: string | null; // ex: "50,00 €" ; null = pas d'acompte
  projectDescription?: string | null;
  portalUrl: string;
};

export function BookingConfirmedClientEmail({
  clientFirstName,
  studioName,
  studioCity,
  appointmentDateLabel,
  depositAmountLabel,
  projectDescription,
  portalUrl,
}: BookingConfirmedClientProps) {
  return (
    <EmailLayout
      preview={`Ton rendez-vous chez ${studioName} est confirmé`}
    >
      <Text style={emailStyles.h1}>
        Ton rendez-vous est confirmé.
      </Text>

      <Text style={emailStyles.p}>
        Bonjour {clientFirstName},{" "}
        {depositAmountLabel
          ? "on a bien reçu ton acompte."
          : "ta réservation est confirmée."}{" "}
        On t'attend chez <strong>{studioName}</strong>
        {studioCity ? ` à ${studioCity}` : ""}.
      </Text>

      <Section style={emailStyles.box}>
        <Text style={emailStyles.boxLabel}>Date</Text>
        <Text style={emailStyles.boxValue}>{appointmentDateLabel}</Text>

        {depositAmountLabel && (
          <>
            <Text style={emailStyles.boxLabel}>Acompte reçu</Text>
            <Text style={emailStyles.boxValue}>{depositAmountLabel}</Text>
          </>
        )}

        {projectDescription && (
          <>
            <Text style={emailStyles.boxLabel}>Ton projet</Text>
            <Text style={{ ...emailStyles.boxValue, fontSize: "14px", fontWeight: 400 as const, color: "#555" }}>
              {projectDescription}
            </Text>
          </>
        )}
      </Section>

      <Text style={emailStyles.p}>
        Pour discuter du projet directement avec {studioName} (références,
        questions, etc.), retrouve ton espace personnel Inklee :
      </Text>

      <Link href={portalUrl} style={emailStyles.button}>
        Accéder à mon espace →
      </Link>

      <Text style={{ ...emailStyles.small, marginTop: "24px" }}>
        Pour toute question, annulation ou modification, contacte directement
        le studio depuis ton espace Inklee.
      </Text>
    </EmailLayout>
  );
}
