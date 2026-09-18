import { travel } from "@/lib/invitation";
import { Divider } from "./ornament";

export function Travel() {
  return (
    <section id="travel" className="scroll-mt-16 bg-paper px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="font-display text-xs tracking-invite text-cinnabar">{travel.kicker}</p>
          <h2 className="mt-4 font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
            {travel.title}
          </h2>
          <Divider className="mx-auto mt-8 max-w-40" />
        </header>
        <ul className="mt-14 space-y-10">
          {travel.items.map((item) => (
            <li key={item.heading} className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:gap-8">
              <p className="font-serif text-lg text-cinnabar">{item.heading}</p>
              <p className="leading-8 text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
