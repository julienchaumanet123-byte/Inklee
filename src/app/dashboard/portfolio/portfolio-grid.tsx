"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2, Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPortfolioImages, deletePortfolioImage } from "./actions";

type Image = {
  id: string;
  image_url: string;
  caption: string | null;
};

export function PortfolioGrid({
  studioId: _studioId,
  images,
  remaining,
}: {
  studioId: string;
  images: Image[];
  remaining: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("images", file);
    }

    startUpload(async () => {
      const result = await uploadPortfolioImages(formData);
      if (result.error) {
        setUploadMessage(result.error);
      } else if (result.uploaded) {
        setUploadMessage(`${result.uploaded} image(s) ajoutée(s) ✓`);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadMessage(null), 4000);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={triggerFilePicker} disabled={uploading || remaining <= 0}>
          <Upload className="w-4 h-4" />
          {uploading ? "Upload…" : "Ajouter des images"}
        </Button>
        {remaining <= 0 && (
          <span className="text-xs text-amber-400">
            Limite atteinte pour ton plan
          </span>
        )}
        {uploadMessage && (
          <span className="text-xs text-ink-300">{uploadMessage}</span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={onFilesSelected}
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/30 p-16 text-center">
          <ImagePlus className="w-12 h-12 mx-auto mb-4 text-ink-600" />
          <h3 className="font-medium mb-2">Aucune image pour l'instant.</h3>
          <p className="text-sm text-ink-400 mb-6">
            Upload tes meilleures réalisations pour montrer ton style.
          </p>
          <Button variant="outline" onClick={triggerFilePicker}>
            <Upload className="w-4 h-4" />
            Choisir des images
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <PortfolioCard key={img.id} image={img} />
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ image }: { image: Image }) {
  const [isPending, startDelete] = useTransition();

  function handleDelete() {
    if (!confirm("Supprimer cette image ?")) return;
    const formData = new FormData();
    formData.set("id", image.id);
    startDelete(async () => {
      await deletePortfolioImage(formData);
    });
  }

  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-ink-800 bg-ink-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.image_url}
        alt={image.caption ?? ""}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink-950/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 flex items-center justify-center"
        title="Supprimer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
