import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./_layout";

export type BookingConfirmedClientProps = {
  clientFirstName: string;
  studioName: string;
  studioCity?: string | null;
  appointmentDateLabel: string; // déjà formaté FR
  depositAmountLabel: string;   // ex: "50,00 €"
  projectDescription?: string | null;
};

export function BookingConfirmedClientEmail({
  clientFirstName,
  studioName,
  studioCity,
  appointmentDateLabel,
  depositAmountLabel,
  projectDescription,
}: BookingConfirmedClientProps) {
  return (
    <EmailLayout
      preview={`Ton rendez-vous chez ${studioName} est confirmé`}
    >
      <Text style={emailStyles.h1}>
        Ton rendez-vous est confirmé.
      </Text>

      <Text style={emailStyles.p}>
        Bonjour {clientFirstName}, on a bien reçu ton acompte. On t'attend chez{" "}
        <strong>{studioName}</strong>
        {studioCity ? ` à ${studioCity}` : ""}.
      </Text>

      <Section style={emailStyles.box}>
        <Text style={emailStyles.boxLabel}>Date</Text>
        <Text style={emailStyles.boxValue}>{appointmentDateLabel}</Text>

        <Text style={emailStyles.boxLabel}>Acompte reçu</Text>
        <Text style={emailStyles.boxValue}>{depositAmountLabel}</Text>

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
        On t'enverra un SMS de rappel la veille du rendez-vous. D'ici là,
        si tu as une question ou besoin de modifier ton créneau, réponds
        directement à cet email.
      </Text>

      <Text style={emailStyles.small}>
        Les conditions d'annulation : ton acompte est remboursable si tu
        annules au moins 72h avant le rendez-vous.
      </Text>
    </EmailLayout>
  );
}
