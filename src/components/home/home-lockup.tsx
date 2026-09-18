import { Link } from "@tanstack/react-router";
import { couple, venue } from "@/lib/invitation";
import { Seal } from "@/components/invitation/ornament";

export function HomeLockup() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20 text-center">
      <p className="rise font-display text-xs tracking-hero text-paper/80 sm:text-sm">敬邀</p>
      <Seal className="rise delay-1 mt-7 text-paper sm:mt-8" size={58} />
      <h1 className="rise delay-2 mt-8 font-serif font-medium leading-none text-paper sm:mt-10">
        <span className="flex flex-col items-center gap-2 sm:gap-3">
          <span className="name-display">{couple.groom}</span>
          <span className="font-display text-lg font-normal tracking-invite text-paper/70 sm:text-xl">与</span>
          <span className="name-display">{couple.bride}</span>
        </span>
      </h1>
      <p className="rise delay-3 mt-8 max-w-md font-serif text-sm leading-relaxed tracking-wide text-paper/80 sm:mt-10 sm:text-base">
        公历二〇二六年十月十日 星期六
        <span className="mt-1 block text-xs tracking-widest text-paper/55 sm:text-sm">
          {venue.city} · {venue.name}
        </span>
      </p>
      <div className="pointer-events-auto rise delay-4 mt-12 flex flex-col items-center gap-4 sm:mt-14 sm:flex-row sm:gap-10">
        <Link
          to="/invite"
          className="inline-flex h-12 min-w-40 items-center justify-center border border-paper/55 px-8 text-sm tracking-wide text-paper transition-colors duration-150 hover:bg-paper hover:text-ink"
        >
          开启请柬
        </Link>
        <Link
          to="/wall"
          className="inline-flex h-12 items-center text-sm tracking-wide text-paper/70 transition-colors duration-150 hover:text-paper"
        >
          照片墙
        </Link>
      </div>
    </div>
  );
}
