# Inklee

SaaS de gestion pour tatoueurs et perceurs français.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Postgres + Auth + Storage)
- **Tailwind CSS** + composants custom dark premium (style shadcn/ui)
- **Stripe** (paiements + abonnements)
- **Resend** (emails) + **Twilio** (SMS)
- **Vercel** (déploiement)

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'env
cp .env.local.example .env.local
# puis éditer .env.local avec tes vraies clés

# 3. Lancer Supabase (voir supabase/README.md)
# - Créer un projet sur supabase.com
# - Exécuter supabase/migrations/0001_initial_schema.sql dans le SQL Editor
# - Coller les clés dans .env.local

# 4. Lancer le dev
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
├── app/
│   ├── (auth)/              # Routes publiques : /login, /signup
│   ├── auth/                # Callbacks Supabase (/auth/callback, /auth/signout)
│   ├── dashboard/           # Routes protégées artiste
│   ├── onboarding/          # Création du studio après signup
│   ├── layout.tsx           # Root layout (fonts, dark mode)
│   ├── page.tsx             # Landing page publique
│   └── globals.css          # Styles Tailwind + design tokens
├── components/
│   ├── marketing/           # Sections de la landing
│   └── ui/                  # Primitives (button, input, card, label)
├── lib/
│   ├── supabase/            # Clients Supabase (browser / server / middleware)
│   ├── env.ts               # Config typée
│   └── utils.ts             # cn(), formatPrice, formatDate, slugify
├── types/
│   └── database.ts          # Types DB (à régénérer après Supabase setup)
└── middleware.ts            # Rafraîchit la session + route guard

supabase/
├── migrations/
│   └── 0001_initial_schema.sql
└── README.md
```

## Variables d'environnement

Voir `.env.local.example`. Pour commencer :
- **Supabase** est le seul service critique pour faire tourner l'app en local.
- **Stripe / Resend / Twilio** peuvent rester en placeholders tant que tu n'attaques pas ces features.

## Roadmap MVP

- [x] Landing page premium dark
- [x] Auth email/password + session middleware
- [x] Schéma DB (studios, clients, appointments, consents)
- [x] Onboarding studio
- [x] Dashboard stub
- [ ] Création/édition de créneaux
- [ ] Page publique de résa `/[slug]`
- [ ] Checkout acompte Stripe
- [ ] CRM clients (fiche + historique)
- [ ] Email de confirmation (Resend)
- [ ] SMS rappel J-1 (Twilio)
- [ ] Consentement médical PDF + signature
- [ ] Suivi multi-séances
- [ ] Rappels soins J+1, J+3, J+7
- [ ] Page Pricing → checkout Stripe abonnement

## Conventions

- Toutes les **server actions** vivent dans `actions.ts` à côté de la page qui les utilise.
- L'accès DB côté serveur passe **toujours par** `@/lib/supabase/server` (jamais le client browser).
- Le **service role key** n'est utilisé que dans les route handlers / actions explicitement marqués (jamais exposé).
- Les **types DB** sont à régénérer après chaque migration : `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`.
