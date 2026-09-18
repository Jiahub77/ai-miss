import { Link } from "@tanstack/react-router";
import { couple } from "@/lib/invitation";
import { Seal } from "./ornament";

export function SiteFooter() {
  return (
    <footer className="bg-ink px-6 py-20 text-center text-paper sm:py-24">
      <Seal className="mx-auto text-paper/90" size={56} />
      <p className="mt-8 font-serif text-xl tracking-wide sm:text-2xl">
        {couple.groom}  ·  {couple.bride}
      </p>
      <p className="mt-3 font-display text-sm tracking-mark text-paper/55">清和 晚棠 同心</p>
      <Link
        to="/wall"
        className="mt-8 inline-flex h-11 items-center text-sm tracking-wide text-paper/70 transition-colors duration-150 hover:text-paper"
      >
        去照片墙
      </Link>
    </footer>
  );
}
