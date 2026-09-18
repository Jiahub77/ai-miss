import { schedule } from "@/lib/invitation";
import { Divider } from "./ornament";

export function Schedule() {
  return (
    <section className="bg-paper px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-xl">
        <header className="text-center">
          <h2 className="font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
            当日行程
          </h2>
          <Divider className="mx-auto mt-8 max-w-40" />
        </header>
        <ol className="mt-14">
          {schedule.map((row) => (
            <li
              key={row.time}
              className="flex items-baseline gap-6 border-t border-line py-5 last:border-b"
            >
              <span className="w-20 shrink-0 font-display text-xl tabular-nums tracking-wider text-cinnabar">
                {row.time}
              </span>
              <span className="font-serif text-lg text-ink">{row.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
