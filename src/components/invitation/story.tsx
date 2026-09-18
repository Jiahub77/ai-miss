import { story } from "@/lib/invitation";
import { Divider } from "./ornament";

export function Story() {
  return (
    <section id="story" className="scroll-mt-16 bg-paper px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-20">
        <figure className="overflow-hidden bg-paper-deep">
          <img
            src={story.image}
            alt=""
            className="aspect-3/4 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div>
          <p className="font-display text-xs tracking-invite text-cinnabar">{story.kicker}</p>
          <h2 className="mt-4 font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
            {story.title}
          </h2>
          <Divider className="mt-8 max-w-32" />
          <div className="mt-8 space-y-6 font-serif text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
