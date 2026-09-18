import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { couple } from "@/lib/invitation";

const links = [
  { to: "/", label: "主页" },
  { to: "/invite", label: "请柬" },
  { to: "/wall", label: "照片墙" },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onInvite = pathname === "/invite";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!onInvite) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onInvite]);

  const lightBar = onInvite && scrolled;
  const ink = lightBar;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,color] duration-250 ease-out",
        lightBar
          ? "bg-paper/92 text-ink shadow-border backdrop-blur-sm"
          : "bg-transparent text-paper",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link
          to="/"
          className={cn(
            "font-serif text-sm tracking-label sm:text-base",
            ink ? "text-ink" : "text-paper",
          )}
        >
          {couple.groom} · {couple.bride}
        </Link>
        <nav className="flex items-center gap-5 sm:gap-8" aria-label="站点">
          {links.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "min-h-11 py-3 text-sm tracking-wide transition-opacity duration-150",
                  ink
                    ? active
                      ? "text-cinnabar"
                      : "text-muted hover:text-ink"
                    : active
                      ? "text-paper"
                      : "text-paper/65 hover:text-paper",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
