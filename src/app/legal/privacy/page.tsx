import Link from "next/link";
import { H1, Lead, H2, H3, P, UL, LI, Placeholder } from "../_components/prose";

export const metadata = {
  title: "Politique de confidentialité — Inklee",
  description:
    "Politique de confidentialité et de protection des données personnelles du service Inklee.",
};

export default function PrivacyPage() {
  return (
    <>
      <H1>Politique de confidentialité</H1>
      <Lead>Dernière mise à jour : <Placeholder>JJ/MM/AAAA</Placeholder></Lead>

      <H2>1. Préambule</H2>
      <P>
        La présente politique de confidentialité décrit la manière dont{" "}
        <strong><Placeholder>Nom de la société</Placeholder></strong>{" "}
        (ci-après <strong>« Inklee »</strong>) collecte, utilise et protège
        les données personnelles des utilisateurs de son service, en
        conformité avec le <strong>Règlement Général sur la Protection
        des Données (RGPD)</strong> et la loi « Informatique et Libertés ».
      </P>

      <H2>2. Responsable du traitement</H2>
      <UL>
        <LI>
          <strong>Responsable :</strong>{" "}
          <Placeholder>Nom de la société</Placeholder>
        </LI>
        <LI>
          <strong>Adresse :</strong> <Placeholder>Adresse complète</Placeholder>
        </LI>
        <LI>
          <strong>Email de contact :</strong>{" "}
          <a href="mailto:hello@inklee.fr" className="text-foreground hover:underline">
            hello@inklee.fr
          </a>
        </LI>
        <LI>
          <strong>Délégué à la protection des données :</strong>{" "}
          <Placeholder>Nom du DPO ou « Non désigné »</Placeholder>
        </LI>
      </UL>

      <H2>3. Données collectées</H2>
      <H3>3.1 Données des Studios (tatoueurs / perceurs)</H3>
      <UL>
        <LI>Identité : nom, prénom, adresse email,</LI>
        <LI>Données d'authentification : mot de passe haché,</LI>
        <LI>Données du studio : nom commercial, ville, adresse, téléphone, bio, photo de profil, portfolio, réseaux sociaux,</LI>
        <LI>Données techniques : adresse IP, type de navigateur, dates et heures de connexion,</LI>
        <LI>Données de facturation : nom et prénom du payeur, données de carte bancaire (traitées exclusivement par Stripe — Inklee ne stocke aucune donnée de carte).</LI>
      </UL>

      <H3>3.2 Données des clients finaux</H3>
      <UL>
        <LI>Identité : prénom, nom, email, téléphone,</LI>
        <LI>Données de rendez-vous : date, heure, description du projet, image de référence,</LI>
        <LI>Messages échangés avec le Studio,</LI>
        <LI>Historique de réservations et paiements,</LI>
        <LI>Données techniques : adresse IP, navigateur.</LI>
      </UL>

      <H2>4. Finalités et bases légales</H2>
      <P>
        Les données sont collectées et traitées pour les finalités suivantes :
      </P>
      <UL>
        <LI>
          <strong>Fourniture du service</strong> (base : exécution du contrat) —
          gestion des comptes, agenda, rendez-vous, communications.
        </LI>
        <LI>
          <strong>Facturation et paiements</strong> (base : exécution du contrat
          et obligations légales) — encaissement des abonnements et acomptes.
        </LI>
        <LI>
          <strong>Communications transactionnelles</strong> (base : exécution
          du contrat) — emails de confirmation, rappels, alertes.
        </LI>
        <LI>
          <strong>Sécurité et lutte contre la fraude</strong> (base : intérêt
          légitime) — logs techniques, détection d'activités suspectes.
        </LI>
        <LI>
          <strong>Amélioration du service</strong> (base : intérêt légitime) —
          analyse anonymisée des usages.
        </LI>
      </UL>

      <H2>5. Sous-traitants et prestataires</H2>
      <P>
        Inklee utilise les prestataires suivants pour fournir le service.
        Tous sont soumis à des engagements de confidentialité et de protection
        des données conformes au RGPD :
      </P>
      <UL>
        <LI>
          <strong>Supabase Inc.</strong> (États-Unis) — hébergement de la base
          de données, serveurs européens (Frankfurt, Allemagne).
        </LI>
        <LI>
          <strong>Vercel Inc.</strong> (États-Unis) — hébergement de
          l'application, infrastructure mondiale.
        </LI>
        <LI>
          <strong>Stripe Payments Europe Ltd.</strong> (Irlande) — traitement
          des paiements et abonnements.
        </LI>
        <LI>
          <strong>Resend Inc.</strong> (États-Unis) — envoi d'emails
          transactionnels.
        </LI>
      </UL>
      <P>
        Pour les prestataires basés hors UE (USA), les transferts de données
        sont encadrés par des Clauses Contractuelles Types de la Commission
        européenne et/ou le cadre Data Privacy Framework.
      </P>

      <H2>6. Durée de conservation</H2>
      <UL>
        <LI>
          <strong>Compte Studio actif :</strong> tant que l'abonnement est actif.
        </LI>
        <LI>
          <strong>Après résiliation :</strong> 30 jours d'accès pour export,
          puis suppression définitive.
        </LI>
        <LI>
          <strong>Factures et documents comptables :</strong> 10 ans (obligation
          légale).
        </LI>
        <LI>
          <strong>Logs de sécurité :</strong> 12 mois maximum.
        </LI>
        <LI>
          <strong>Données des clients finaux :</strong> conservées tant que le
          Studio dont ils sont clients reste actif.
        </LI>
      </UL>

      <H2>7. Vos droits</H2>
      <P>Conformément au RGPD, vous disposez des droits suivants :</P>
      <UL>
        <LI>
          <strong>Droit d'accès</strong> : obtenir copie de vos données.
        </LI>
        <LI>
          <strong>Droit de rectification</strong> : corriger des données
          inexactes.
        </LI>
        <LI>
          <strong>Droit à l'effacement</strong> (« droit à l'oubli ») : demander
          la suppression de vos données.
        </LI>
        <LI>
          <strong>Droit à la portabilité</strong> : récupérer vos données dans
          un format structuré.
        </LI>
        <LI>
          <strong>Droit d'opposition</strong> : vous opposer au traitement pour
          motif légitime.
        </LI>
        <LI>
          <strong>Droit à la limitation</strong> : geler temporairement le
          traitement.
        </LI>
        <LI>
          <strong>Droit de définir des directives post-mortem.</strong>
        </LI>
      </UL>
      <P>
        Pour exercer ces droits, envoyez un email à{" "}
        <a href="mailto:hello@inklee.fr" className="text-foreground hover:underline">
          hello@inklee.fr
        </a>
        . Une réponse vous sera apportée sous 30 jours maximum. Vous pouvez
        également introduire une réclamation auprès de la{" "}
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          CNIL
        </a>
        .
      </P>

      <H2>8. Cookies</H2>
      <P>
        Inklee utilise uniquement des cookies <strong>strictement
        nécessaires</strong> au fonctionnement du service (authentification,
        session utilisateur). Aucun cookie publicitaire ni de suivi
        marketing n'est déposé sans votre consentement.
      </P>
      <UL>
        <LI>
          <strong>Cookies d'authentification</strong> (Supabase) : conservent
          votre session de connexion. Durée : 7 jours.
        </LI>
        <LI>
          <strong>Cookies de sécurité</strong> : protection contre les attaques
          CSRF. Durée : session.
        </LI>
      </UL>

      <H2>9. Sécurité</H2>
      <P>
        Inklee met en œuvre les mesures techniques et organisationnelles
        appropriées pour garantir la sécurité des données :
      </P>
      <UL>
        <LI>chiffrement TLS 1.3 pour toutes les communications,</LI>
        <LI>hachage bcrypt des mots de passe,</LI>
        <LI>accès aux données strictement limité aux personnes autorisées,</LI>
        <LI>sauvegardes quotidiennes des bases de données,</LI>
        <LI>Row Level Security (RLS) Postgres garantissant la cloisonnement entre Studios.</LI>
      </UL>

      <H2>10. Mineurs</H2>
      <P>
        Le service Inklee n'est pas destiné aux personnes mineures. Si vous
        êtes Studio, vous garantissez que vous ne ferez réserver via Inklee
        que des prestations conformes à la réglementation française relative
        aux tatouages et piercings sur mineurs (consentement parental
        obligatoire, etc.).
      </P>

      <H2>11. Modifications</H2>
      <P>
        La présente politique peut être modifiée à tout moment. Toute
        modification substantielle sera notifiée aux utilisateurs par email
        au moins 30 jours avant son entrée en vigueur.
      </P>

      <H2>Voir aussi</H2>
      <UL>
        <LI>
          <Link href="/legal/cgu" className="text-foreground hover:underline">
            Conditions Générales d'Utilisation
          </Link>
        </LI>
        <LI>
          <Link
            href="/legal/mentions-legales"
            className="text-foreground hover:underline"
          >
            Mentions légales
          </Link>
        </LI>
      </UL>
    </>
  );
}
