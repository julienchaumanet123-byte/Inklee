import Link from "next/link";
import { H1, Lead, H2, H3, P, UL, LI, Placeholder } from "../_components/prose";

export const metadata = {
  title: "Conditions Générales d'Utilisation — Inklee",
  description:
    "Conditions Générales d'Utilisation et de Vente du service Inklee.",
};

export default function CGUPage() {
  return (
    <>
      <H1>Conditions Générales d'Utilisation</H1>
      <Lead>Dernière mise à jour : <Placeholder>JJ/MM/AAAA</Placeholder></Lead>

      <H2>1. Préambule</H2>
      <P>
        Les présentes Conditions Générales d'Utilisation et de Vente
        (ci-après les <strong>« CGU »</strong>) régissent les relations entre :
      </P>
      <UL>
        <LI>
          <strong><Placeholder>Nom de la société</Placeholder></strong>, éditrice
          du service Inklee (ci-après <strong>« l'Éditeur »</strong> ou{" "}
          <strong>« Inklee »</strong>),
        </LI>
        <LI>
          et toute personne physique majeure ou personne morale utilisant le
          service Inklee (ci-après <strong>« l'Utilisateur »</strong> ou{" "}
          <strong>« le Studio »</strong> pour les artistes professionnels).
        </LI>
      </UL>
      <P>
        L'utilisation du service implique l'acceptation pleine et entière des
        présentes CGU. Si l'Utilisateur n'accepte pas tout ou partie des CGU,
        il doit renoncer à utiliser le service.
      </P>

      <H2>2. Description du service</H2>
      <P>
        Inklee est une plateforme en ligne de gestion d'activité destinée aux
        tatoueurs et perceurs professionnels. Le service permet notamment :
      </P>
      <UL>
        <LI>la gestion d'un agenda et de créneaux de rendez-vous,</LI>
        <LI>la prise de rendez-vous en ligne par les clients finaux,</LI>
        <LI>l'encaissement d'acomptes via Stripe,</LI>
        <LI>la tenue d'une base clients (CRM),</LI>
        <LI>la publication d'un portfolio,</LI>
        <LI>l'échange de messages avec les clients,</LI>
        <LI>l'envoi d'emails transactionnels automatiques.</LI>
      </UL>

      <H2>3. Création de compte</H2>
      <H3>3.1 Compte professionnel (Studio)</H3>
      <P>
        Le Studio doit créer un compte en fournissant des informations
        exactes, complètes et à jour. Il s'engage à mettre à jour ces
        informations en cas de modification. Le Studio est responsable de la
        confidentialité de son mot de passe.
      </P>
      <P>
        Le Studio doit exercer une activité professionnelle de tatouage et/ou
        de piercing en conformité avec la réglementation française en vigueur,
        notamment l'arrêté du 11 mars 2009 fixant les conditions d'exercice
        des activités de tatouage et de piercing.
      </P>

      <H3>3.2 Compte client final</H3>
      <P>
        Le client final accède à un espace personnel via un lien magique envoyé
        par email. Aucun mot de passe n'est requis. Le client final doit fournir
        un email valide.
      </P>

      <H2>4. Abonnement et tarifs</H2>
      <H3>4.1 Plans</H3>
      <P>
        Inklee propose plusieurs plans d'abonnement à destination des Studios :
      </P>
      <UL>
        <LI>
          <strong>Starter</strong> : 29 € HT par mois — fonctionnalités de
          base
        </LI>
        <LI>
          <strong>Pro</strong> : 59 € HT par mois — fonctionnalités étendues
          (portfolio, rappels, consentement médical, multi-séances)
        </LI>
        <LI>
          <strong>Studio</strong> : sur devis — comptes multi-artistes
        </LI>
      </UL>

      <H3>4.2 Période d'essai</H3>
      <P>
        Les nouveaux Studios bénéficient d'une période d'essai gratuite de 14
        jours, sans engagement et sans nécessité de fournir un moyen de
        paiement.
      </P>

      <H3>4.3 Facturation et renouvellement</H3>
      <P>
        L'abonnement est facturé mensuellement. Le renouvellement est tacite
        à chaque échéance, sauf résiliation par le Studio. Les factures sont
        disponibles dans l'espace de gestion d'abonnement Stripe accessible
        depuis le tableau de bord.
      </P>

      <H3>4.4 Résiliation</H3>
      <P>
        Le Studio peut résilier son abonnement à tout moment depuis son
        tableau de bord. La résiliation prend effet à la fin de la période
        de facturation en cours. Aucun remboursement prorata n'est accordé.
      </P>

      <H2>5. Acomptes clients et Stripe Connect</H2>
      <P>
        Les acomptes versés par les clients finaux lors de la réservation
        d'un rendez-vous sont encaissés <strong>directement</strong> sur le
        compte Stripe Connect du Studio. Inklee n'a ni accès ni contrôle sur
        ces fonds.
      </P>
      <P>
        Le Studio est seul responsable de la fixation du montant de l'acompte,
        de ses conditions d'utilisation et de ses politiques de remboursement.
        Inklee fournit l'infrastructure technique mais n'est pas partie au
        contrat de prestation entre le Studio et le client final.
      </P>
      <P>
        L'utilisation de Stripe Connect implique l'acceptation des{" "}
        <a
          href="https://stripe.com/fr/connect-account/legal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          Conditions du compte connecté Stripe
        </a>
        .
      </P>

      <H2>6. Obligations du Studio</H2>
      <P>Le Studio s'engage à :</P>
      <UL>
        <LI>
          exercer son activité dans le respect de la réglementation française
          applicable aux activités de tatouage et de piercing,
        </LI>
        <LI>
          respecter les obligations légales en matière de protection des
          données personnelles de ses propres clients,
        </LI>
        <LI>
          honorer les rendez-vous pris par les clients via Inklee,
        </LI>
        <LI>
          ne pas utiliser le service à des fins illicites ou contraires aux
          bonnes mœurs,
        </LI>
        <LI>
          ne pas tenter d'accéder à des comptes ou données d'autres
          utilisateurs,
        </LI>
        <LI>
          maintenir à jour ses informations bancaires et fiscales auprès de
          Stripe.
        </LI>
      </UL>

      <H2>7. Propriété des données</H2>
      <P>
        Le Studio reste <strong>propriétaire</strong> de l'ensemble des
        données qu'il publie sur la plateforme, notamment :
      </P>
      <UL>
        <LI>fiches clients et historique de rendez-vous,</LI>
        <LI>portfolio,</LI>
        <LI>messages échangés,</LI>
        <LI>notes et contenu de profil.</LI>
      </UL>
      <P>
        Le Studio peut exporter ses données à tout moment et obtenir une
        copie complète sous 30 jours sur demande à{" "}
        <a href="mailto:hello@inklee.fr" className="text-foreground hover:underline">
          hello@inklee.fr
        </a>
        . En cas de résiliation, les données restent accessibles pendant 30
        jours avant suppression définitive.
      </P>

      <H2>8. Responsabilité</H2>
      <P>
        Inklee s'engage à fournir le service avec diligence et selon les
        règles de l'art, étant précisé qu'il s'agit d'une obligation de
        moyens. Inklee ne saurait être tenue responsable :
      </P>
      <UL>
        <LI>des interruptions de service liées à la maintenance ou à des cas de force majeure,</LI>
        <LI>de pertes financières découlant de no-shows, de litiges entre Studio et client final, ou de fraude commise par un tiers,</LI>
        <LI>de la qualité des prestations de tatouage ou de piercing réalisées par les Studios,</LI>
        <LI>des actes des prestataires tiers (Stripe, Supabase, Vercel, Resend) sur lesquels Inklee n'a pas de contrôle direct.</LI>
      </UL>

      <H2>9. Suspension et résiliation par Inklee</H2>
      <P>
        Inklee se réserve le droit de suspendre ou résilier le compte d'un
        Studio en cas de manquement grave aux présentes CGU, et notamment
        en cas d'activité illégale, de fraude, ou d'utilisation contraire à
        l'esprit du service.
      </P>

      <H2>10. Modification des CGU</H2>
      <P>
        Inklee se réserve le droit de modifier les présentes CGU à tout
        moment. Les modifications seront notifiées par email au Studio au
        moins 30 jours avant leur entrée en vigueur. La poursuite de
        l'utilisation du service après cette notification vaut acceptation
        des nouvelles CGU.
      </P>

      <H2>11. Droit applicable et juridiction</H2>
      <P>
        Les présentes CGU sont régies par le droit français. Tout litige
        relatif à leur interprétation ou exécution relève de la compétence
        exclusive des tribunaux de{" "}
        <Placeholder>Ville du siège social</Placeholder>, sous réserve de
        l'application des règles impératives de droit de la consommation.
      </P>

      <H2>12. Contact</H2>
      <P>
        Pour toute question concernant les présentes CGU, merci de nous
        écrire à{" "}
        <a href="mailto:hello@inklee.fr" className="text-foreground hover:underline">
          hello@inklee.fr
        </a>
        .
      </P>

      <H2>Voir aussi</H2>
      <UL>
        <LI>
          <Link href="/legal/privacy" className="text-foreground hover:underline">
            Politique de confidentialité
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
