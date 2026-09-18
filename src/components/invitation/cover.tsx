import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { couple } from "@/lib/invitation";
import { Seal } from "./ornament";

export function Cover() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <section id="cover" className="relative min-h-dvh grain overflow-hidden bg-ink">
      <div className="absolute inset-0">
        {reduceMotion ? (
          <img src="/images/still-life.jpg" alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/still-life.jpg"
            aria-hidden="true"
          >
            <source src="/images/hero.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 cover-veil" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-16 pt-24 text-center text-paper">
        <p className="rise delay-1 font-display text-xs tracking-hero text-paper/80 sm:text-sm">
          敬邀
        </p>
        <Seal className="rise mt-8 text-paper" size={68} />
        <h1 className="rise delay-2 mt-10 name-display font-serif font-medium leading-none text-paper">
          <span className="flex flex-col items-center gap-3 sm:gap-4">
            <span>{couple.groom}</span>
            <span className="font-display text-lg font-normal tracking-invite text-paper/70 sm:text-xl">
              与
            </span>
            <span>{couple.bride}</span>
          </span>
        </h1>
        <p className="rise delay-3 mt-10 max-w-md font-serif text-sm leading-relaxed tracking-wide text-paper/80 sm:text-base">
          公历二〇二六年十月十日 星期六
          <span className="mt-1 block text-xs tracking-widest text-paper/60 sm:text-sm">
            农历丙午年九月初一
          </span>
        </p>
        <a
          href="#invite"
          className="rise delay-5 group mt-16 flex min-h-11 flex-col items-center gap-1 text-paper/70"
        >
          <span className="text-xs tracking-mark">向下翻阅</span>
          <ChevronDown className="size-4 transition-transform duration-250 group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
