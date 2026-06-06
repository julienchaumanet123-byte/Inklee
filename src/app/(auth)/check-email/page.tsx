import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md text-center">
      <h1 className="font-display text-4xl font-bold mb-2">Vérifie tes mails.</h1>
      <p className="text-ink-300">
        On vient de t&apos;envoyer un email de confirmation. Clique sur le lien
        pour activer ton compte et accéder à ton studio. Pense à vérifier tes
        spams.
      </p>
      <p className="mt-8 text-sm text-ink-400">
        <Link href="/login" className="text-gold hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
