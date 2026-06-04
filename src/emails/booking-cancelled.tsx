import { Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./_layout";

export type BookingCancelledProps = {
  clientFirstName: string;
  studioName: string;
  appointmentDateLabel: string;
};

export function BookingCancelledEmail({
  clientFirstName,
  studioName,
  appointmentDateLabel,
}: BookingCancelledProps) {
  return (
    <EmailLayout preview={`Ton rendez-vous chez ${studioName} a été annulé`}>
      <Text style={emailStyles.h1}>Rendez-vous annulé.</Text>

      <Text style={emailStyles.p}>
        Bonjour {clientFirstName}, ton rendez-vous chez{" "}
        <strong>{studioName}</strong> prévu le <strong>{appointmentDateLabel}</strong>{" "}
        a été annulé.
      </Text>

      <Text style={emailStyles.p}>
        Si tu n'es pas à l'origine de cette annulation, contacte directement{" "}
        {studioName} en répondant à cet email.
      </Text>

      <Text style={emailStyles.small}>
        Si tu avais réglé un acompte, il te sera remboursé selon les conditions
        d'annulation du studio.
      </Text>
    </EmailLayout>
  );
}
