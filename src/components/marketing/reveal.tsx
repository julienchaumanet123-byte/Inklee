"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  rootMargin?: string;
  as?: "div" | "section" | "li" | "article";
  once?: boolean;
};

/**
 * Wraps children and fades + translates them up when they scroll into view.
 * Uses IntersectionObserver. Triggers only once by default.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  rootMargin = "0px 0px -10% 0px",
  as: Tag = "div",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin, threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  const sharedClass = cn(
    "transition-all duration-700 ease-out will-change-transform",
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
    className
  );
  const sharedStyle = { transitionDelay: `${delay}ms` };

  // Tag-specific rendering pour que les refs soient typées correctement
  if (Tag === "li") {
    return (
      <li
        ref={ref as React.RefObject<HTMLLIElement>}
        style={sharedStyle}
        className={sharedClass}
      >
        {children}
      </li>
    );
  }
  if (Tag === "section") {
    return (
      <section
        ref={ref as React.RefObject<HTMLElement>}
        style={sharedStyle}
        className={sharedClass}
      >
        {children}
      </section>
    );
  }
  if (Tag === "article") {
    return (
      <article
        ref={ref as React.RefObject<HTMLElement>}
        style={sharedStyle}
        className={sharedClass}
      >
        {children}
      </article>
    );
  }
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={sharedStyle}
      className={sharedClass}
    >
      {children}
    </div>
  );
}
