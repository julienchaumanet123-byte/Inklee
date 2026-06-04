import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-ink-700 bg-ink-900/50 px-4 py-3 text-sm",
          "placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:border-white/50",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
