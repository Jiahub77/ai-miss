import { families } from "@/lib/invitation";
import { Divider } from "./ornament";

export function Family() {
  return (
    <section id="family" className="scroll-mt-16 bg-surface px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-display text-xs tracking-invite text-cinnabar">{families.kicker}</p>
        <h2 className="mt-4 font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
          {families.title}
        </h2>
        <Divider className="mx-auto mt-8 max-w-40" />
        <div className="mt-16 grid gap-12 sm:grid-cols-2 sm:gap-16">
          {families.sides.map((side) => (
            <article key={side.house}>
              <p className="font-serif text-2xl text-ink sm:text-3xl">{side.house}</p>
              <p className="mt-4 text-lg text-ink-soft">{side.people}</p>
              <p className="mt-2 text-sm text-muted">{side.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
