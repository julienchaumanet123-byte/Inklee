# Supabase — Inklee

## Setup initial

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer dans **Project Settings → API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (secret, ne JAMAIS exposer côté client)
3. Coller ces valeurs dans `.env.local`
4. Ouvrir le **SQL Editor** dans le dashboard
5. Coller le contenu de `migrations/0001_initial_schema.sql` et exécuter

## Auth — Email/Password

Dans **Authentication → Providers** :
- Activer **Email**
- Désactiver "Confirm email" pendant le dev (à réactiver en prod)
- Dans **URL Configuration**, ajouter à **Redirect URLs** :
  - `http://localhost:3000/auth/callback`
  - `https://inklee.fr/auth/callback` (plus tard en prod)

## Types TypeScript

Pour régénérer les types à partir du schéma réel :

```bash
npx supabase login
npx supabase gen types typescript --project-id <ton-ref> > src/types/database.ts
```
