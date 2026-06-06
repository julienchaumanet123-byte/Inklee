"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateStudio, type SettingsState } from "./actions";
import { StudioImages } from "./studio-images";
import type { Database } from "@/types/database";

type Studio = Database["public"]["Tables"]["studios"]["Row"];

const initialState: SettingsState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

export function SettingsForm({ studio }: { studio: Studio }) {
  const [state, formAction] = useFormState(updateStudio, initialState);
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${studio.slug}`
      : `inklee.fr/${studio.slug}`;

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* URL publique */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ta page de réservation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900/50 px-4 py-3 text-sm font-mono">
            <span className="flex-1 truncate">{publicUrl}</span>
            <button
              type="button"
              onClick={copyUrl}
              className="p-1.5 rounded hover:bg-ink-800 transition-colors"
              title="Copier"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-ink-300" />
              )}
            </button>
            <a
              href={`/${studio.slug}`}
              target="_blank"
              rel="noopener"
              className="p-1.5 rounded hover:bg-ink-800 transition-colors"
              title="Ouvrir"
            >
              <ExternalLink className="w-4 h-4 text-ink-300" />
            </a>
          </div>
          <p className="text-xs text-ink-400 mt-2">
            Partage ce lien dans ta bio Instagram, par SMS, où tu veux.
          </p>
        </CardContent>
      </Card>

      {/* Photos (formulaires d'upload indépendants, hors du form principal) */}
      <StudioImages
        avatarUrl={studio.logo_url}
        coverUrl={studio.cover_url}
      />

      {/* Form */}
      <form action={formAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Studio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du studio</Label>
              <Input
                id="name"
                name="name"
                defaultValue={studio.name}
                required
              />
              {state.fieldErrors?.name && (
                <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                defaultValue={studio.city ?? ""}
                placeholder="Paris"
              />
            </div>

            <div className="space-y-2">
              <Label>Spécialité</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["tattoo", "piercing", "both"] as const).map((value) => (
                  <label
                    key={value}
                    className="cursor-pointer rounded-md border border-ink-700 bg-ink-900/50 p-3 text-center text-sm transition-all has-[:checked]:border-white has-[:checked]:bg-white/5 has-[:checked]:text-foreground hover:border-ink-600"
                  >
                    <input
                      type="radio"
                      name="specialty"
                      value={value}
                      className="sr-only"
                      defaultChecked={studio.specialty === value}
                      required
                    />
                    {value === "tattoo" && "Tatouage"}
                    {value === "piercing" && "Piercing"}
                    {value === "both" && "Les deux"}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (affichée sur ta page publique)</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={studio.bio ?? ""}
                placeholder="Style, parcours, ce qui te distingue…"
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Infos pratiques & réseaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                defaultValue={studio.address ?? ""}
                placeholder="12 rue de la Paix, 75001 Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={studio.phone ?? ""}
                placeholder="01 23 45 67 89"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram</Label>
              <Input
                id="instagramHandle"
                name="instagramHandle"
                defaultValue={studio.instagram_handle ?? ""}
                placeholder="ton.studio"
              />
              <p className="text-xs text-ink-400">Sans le @</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Site web</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                defaultValue={studio.website_url ?? ""}
                placeholder="https://ton-studio.com"
              />
              {state.fieldErrors?.websiteUrl && (
                <p className="text-xs text-destructive">{state.fieldErrors.websiteUrl}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acompte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block text-sm font-medium">
                  Demander un acompte pour réserver
                </span>
                <span className="block text-xs text-ink-400 mt-0.5">
                  Le client paie un acompte en ligne pour bloquer son RDV.
                  Désactive si tu veux des réservations sans paiement.
                </span>
              </span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-ink-700 transition-colors has-[:checked]:bg-emerald-500/80">
                <input
                  type="checkbox"
                  name="depositRequired"
                  defaultChecked={studio.deposit_required}
                  className="peer sr-only"
                />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            <div className="space-y-2">
              <Label htmlFor="depositAmount">Montant de l'acompte (€)</Label>
              <Input
                id="depositAmount"
                name="depositAmount"
                type="number"
                min="0"
                step="1"
                defaultValue={studio.deposit_amount}
                required
              />
              <p className="text-xs text-ink-400">
                Utilisé seulement si l'acompte est activé ci-dessus.
              </p>
              {state.fieldErrors?.depositAmount && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.depositAmount}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {state.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            Sauvegardé.
          </div>
        )}

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
