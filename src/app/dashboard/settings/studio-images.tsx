"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ImagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  uploadStudioAvatar,
  uploadStudioCover,
  type ImageUploadResult,
} from "./image-actions";

const initial: ImageUploadResult = {};

function PendingOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/60 text-xs text-foreground">
      Envoi…
    </div>
  );
}

function Uploader({
  action,
  currentUrl,
  shape,
  cta,
}: {
  action: typeof uploadStudioAvatar;
  currentUrl: string | null;
  shape: "circle" | "wide";
  cta: string;
}) {
  const [state, formAction] = useFormState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const url = state.url ?? currentUrl ?? null;

  const frame =
    shape === "circle"
      ? "w-28 h-28 rounded-full"
      : "w-full aspect-[3/1] rounded-lg";

  return (
    <form ref={formRef} action={formAction}>
      <label
        className={`relative block ${frame} cursor-pointer overflow-hidden border border-ink-700 bg-ink-900/50 transition-colors hover:border-ink-500`}
      >
        <PendingOverlay />
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-ink-400">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px]">{cta}</span>
          </span>
        )}
        <input
          type="file"
          name="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              formRef.current?.requestSubmit();
            }
          }}
        />
      </label>
      {state.error && (
        <p className="mt-2 text-xs text-destructive">{state.error}</p>
      )}
    </form>
  );
}

export function StudioImages({
  avatarUrl,
  coverUrl,
}: {
  avatarUrl: string | null;
  coverUrl: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Photos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Photo / logo</p>
          <Uploader
            action={uploadStudioAvatar}
            currentUrl={avatarUrl}
            shape="circle"
            cta="Ajouter"
          />
          <p className="text-xs text-ink-400">
            Visible en haut de ta page publique. Carré conseillé, max 5 Mo.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Bannière de couverture</p>
          <Uploader
            action={uploadStudioCover}
            currentUrl={coverUrl}
            shape="wide"
            cta="Ajouter une bannière"
          />
          <p className="text-xs text-ink-400">
            Image large affichée en fond de ta page. Format paysage, max 5 Mo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
