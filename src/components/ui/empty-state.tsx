import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-ink-700 bg-ink-900/30 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-ink-800/80 border border-ink-700 mb-4">
          <Icon className="w-6 h-6 text-ink-400" />
        </div>
      )}
      <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-400 max-w-sm mx-auto mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {cta && <div className="flex justify-center">{cta}</div>}
    </div>
  );
}
