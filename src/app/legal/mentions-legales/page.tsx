import { H1, Lead, H2, P, UL, LI, Placeholder } from "../_components/prose";

export const metadata = {
  title: "Mentions légales — Inklee",
  description: "Mentions légales du service Inklee.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <H1>Mentions légales</H1>
      <Lead>Dernière mise à jour : <Placeholder>JJ/MM/AAAA</Placeholder></Lead>

      <H2>Éditeur du site</H2>
      <P>
        Le site Inklee, accessible à l'adresse{" "}
        <strong>https://inklee.fr</strong>, est édité par :
      </P>
      <UL>
        <LI>
          Dénomination sociale : <Placeholder>Nom de la société</Placeholder>
        </LI>
        <LI>
          Forme juridique : <Placeholder>SAS / SASU / SARL / EI / Auto-entrepreneur</Placeholder>
        </LI>
        <LI>
          Capital social : <Placeholder>Montant en €</Placeholder>
        </LI>
        <LI>
          Siège social : <Placeholder>Adresse complète</Placeholder>
        </LI>
        <LI>
          Numéro SIRET : <Placeholder>SIRET 14 chiffres</Placeholder>
        </LI>
        <LI>
          Numéro RCS : <Placeholder>RCS Ville XXX XXX XXX</Placeholder>
        </LI>
        <LI>
          Numéro TVA intracommunautaire : <Placeholder>FR XX XXXXXXXXX</Placeholder>
        </LI>
        <LI>
          Directeur de la publication : <Placeholder>Nom et prénom du dirigeant</Placeholder>
        </LI>
        <LI>
          Email : <a href="mailto:hello@inklee.fr" className="text-foreground hover:underline">hello@inklee.fr</a>
        </LI>
        <LI>
          Téléphone : <Placeholder>+33 X XX XX XX XX</Placeholder>
        </LI>
      </UL>

      <H2>Hébergement</H2>
      <P>Le site est hébergé par :</P>
      <UL>
        <LI>Vercel Inc.</LI>
        <LI>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</LI>
        <LI>
          Site web :{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            vercel.com
          </a>
        </LI>
      </UL>
      <P>
        La base de données est hébergée par <strong>Supabase Inc.</strong>,
        avec des serveurs localisés dans l'Union européenne (Francfort,
        Allemagne).
      </P>

      <H2>Propriété intellectuelle</H2>
      <P>
        L'ensemble des contenus présents sur ce site (textes, images, logos,
        graphismes, design, structure) est la propriété exclusive de{" "}
        <Placeholder>Nom de la société</Placeholder>, sauf mention contraire.
        Toute reproduction, représentation, modification, publication ou
        adaptation, partielle ou totale, par quelque procédé que ce soit, est
        interdite sans autorisation écrite préalable.
      </P>

      <H2>Crédits</H2>
      <UL>
        <LI>Design et développement : équipe Inklee</LI>
        <LI>
          Icônes :{" "}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Lucide
          </a>{" "}
          (licence ISC)
        </LI>
        <LI>
          Typographies : Inter (SIL OFL 1.1) et Cormorant Garamond (SIL OFL 1.1)
        </LI>
      </UL>

      <H2>Contact</H2>
      <P>
        Pour toute question concernant le site, merci de nous écrire à{" "}
        <a href="mailto:hello@inklee.fr" className="text-foreground hover:underline">
          hello@inklee.fr
        </a>
        .
      </P>
    </>
  );
}
