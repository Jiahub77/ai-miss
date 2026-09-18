import { useState } from "react";
import { CalendarPlus, Copy, MapPin } from "lucide-react";
import { calendarBlob, venue } from "@/lib/invitation";
import { Button } from "@/components/ui/button";
import { Divider } from "./ornament";

export function Details() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const onCalendar = () => {
    const url = URL.createObjectURL(calendarBlob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "qinghe-wantang-wedding.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="day" className="scroll-mt-16 bg-surface px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h2 className="font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
            时 与 地
          </h2>
          <Divider className="mx-auto mt-8 max-w-40" />
        </header>

        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16">
          <article>
            <p className="font-display text-xs tracking-invite text-cinnabar">日期</p>
            <p className="mt-4 font-serif text-2xl text-ink sm:text-3xl">
              公历二〇二六年十月十日 星期六
            </p>
            <p className="mt-2 text-muted">农历丙午年九月初一</p>
            <dl className="mt-8 space-y-3 text-ink-soft">
              <div className="flex justify-between gap-6 border-b border-line py-3">
                <dt>典礼</dt>
                <dd className="tabular-nums tracking-wider">16:30</dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-line py-3">
                <dt>晚宴</dt>
                <dd className="tabular-nums tracking-wider">18:18</dd>
              </div>
            </dl>
            <Button variant="outline" className="mt-8" onClick={onCalendar}>
              <CalendarPlus className="size-4" />
              加入日历
            </Button>
          </article>

          <article>
            <p className="font-display text-xs tracking-invite text-cinnabar">地点</p>
            <p className="mt-4 font-serif text-2xl text-ink sm:text-3xl">{venue.name}</p>
            <p className="mt-2 text-muted">{venue.city}</p>
            <p className="mt-6 flex items-start gap-2 text-ink-soft">
              <MapPin className="mt-1 size-4 shrink-0 text-cinnabar" />
              <span>{venue.address}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={onCopy}>
                <Copy className="size-4" />
                {copied ? "已复制" : "复制地址"}
              </Button>
              <a
                className="inline-flex h-11 items-center px-4 text-sm tracking-wide text-muted transition-colors duration-150 hover:text-ink"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
              >
                查看地图
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
