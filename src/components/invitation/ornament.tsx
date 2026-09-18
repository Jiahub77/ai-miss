import { cn } from "@/lib/utils";

export function Seal({ className, size = 72 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn("relative grid place-items-center text-cinnabar", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <circle cx="50" cy="50" r="47.5" fill="none" stroke="currentColor" strokeWidth="1.15" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="0.35" />
      </svg>
      <span className="font-serif leading-none" style={{ fontSize: size * 0.46 }}>
        囍
      </span>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <span className="size-1.5 rotate-45 bg-cinnabar/80" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function VerticalMark({ children }: { children: string }) {
  return (
    <p
      className="hidden xl:flex font-serif text-subtle tracking-invite text-xs"
      style={{ writingMode: "vertical-rl" }}
      aria-hidden="true"
    >
      {children}
    </p>
  );
}
