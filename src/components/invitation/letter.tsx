import { couple, letter } from "@/lib/invitation";
import { Divider, Seal } from "./ornament";

export function Letter() {
  return (
    <section id="invite" className="scroll-mt-16 bg-paper px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-display text-xs tracking-invite text-cinnabar">双方家长 敬邀</p>
        <h2 className="mt-6 font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
          诚邀
        </h2>
        <Divider className="mx-auto mt-8 max-w-40" />
        <div className="mt-12 space-y-7 text-left font-serif text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">
          {letter.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center gap-3">
          <Seal size={56} />
          <p className="font-serif text-xl text-ink sm:text-2xl">
            {couple.groom}  ·  {couple.bride}
          </p>
          <p className="font-display italic text-muted">恭请光临</p>
        </div>
      </div>
    </section>
  );
}
