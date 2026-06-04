import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./_layout";

export type BookingNotificationStudioProps = {
  studioFirstName: string;
  clientFullName: string;
  clientEmail: string;
  clientPhone?: string | null;
  appointmentDateLabel: string;
  depositAmountLabel: string;
  projectDescription?: string | null;
  dashboardUrl: string;
};

export function BookingNotificationStudioEmail({
  studioFirstName,
  clientFullName,
  clientEmail,
  clientPhone,
  appointmentDateLabel,
  depositAmountLabel,
  projectDescription,
  dashboardUrl,
}: BookingNotificationStudioProps) {
  return (
    <EmailLayout preview={`Nouvelle réservation de ${clientFullName}`}>
      <Text style={emailStyles.h1}>Nouvelle réservation.</Text>

      <Text style={emailStyles.p}>
        Salut {studioFirstName}, <strong>{clientFullName}</strong> vient de
        réserver un créneau et a payé l'acompte de {depositAmountLabel}.
      </Text>

      <Section style={emailStyles.box}>
        <Text style={emailStyles.boxLabel}>Client</Text>
        <Text style={emailStyles.boxValue}>{clientFullName}</Text>

        <Text style={emailStyles.boxLabel}>Contact</Text>
        <Text style={{ ...emailStyles.boxValue, fontSize: "14px" }}>
          {clientEmail}
          {clientPhone ? ` · ${clientPhone}` : ""}
        </Text>

        <Text style={emailStyles.boxLabel}>Date</Text>
        <Text style={emailStyles.boxValue}>{appointmentDateLabel}</Text>

        {projectDescription && (
          <>
            <Text style={emailStyles.boxLabel}>Projet</Text>
            <Text style={{ ...emailStyles.boxValue, fontSize: "14px", fontWeight: 400 as const, color: "#555" }}>
              {projectDescription}
            </Text>
          </>
        )}
      </Section>

      <Button style={emailStyles.button} href={dashboardUrl}>
        Voir le rendez-vous →
      </Button>
    </EmailLayout>
  );
}
