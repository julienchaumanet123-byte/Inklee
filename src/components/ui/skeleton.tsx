import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-ink-900 via-ink-800/80 to-ink-900 rounded-md",
        className
      )}
    />
  );
}
