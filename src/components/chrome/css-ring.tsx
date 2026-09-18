import { useEffect, useRef } from "react";
import { photos as allPhotos } from "@/lib/invitation";

type Item = (typeof allPhotos)[number];

type Props = {
  photos: Item[];
  autoRotate?: boolean;
  onFront?: (index: number) => void;
};

export function CssRing({ photos, autoRotate = false, onFront }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const velRef = useRef(autoRotate ? 0.08 : 0);
  const frontRef = useRef(-1);
  const onFrontRef = useRef(onFront);
  onFrontRef.current = onFront;

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = photos.length;
    let dragging = false;
    let lastX = 0;
    let pointerId = -1;
    let running = true;
    let last = performance.now();
    let moved = 0;

    const apply = () => {
      ring.style.transform = `translate(-50%, -46%) rotateY(${rotRef.current}deg)`;
      const step = 360 / n;
      const idx = ((Math.round(-rotRef.current / step) % n) + n) % n;
      if (idx !== frontRef.current) {
        frontRef.current = idx;
        onFrontRef.current?.(idx);
      }
    };

    const isUi = (e: Event) => {
      const t = e.target as HTMLElement | null;
      return Boolean(t?.closest("a, button"));
    };

    const onDown = (e: PointerEvent) => {
      if (isUi(e)) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      pointerId = e.pointerId;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      velRef.current = dx * 0.07;
      rotRef.current += velRef.current;
      apply();
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      if (moved < 12) velRef.current = 0;
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove, { passive: false });
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    apply();

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now;
      if (!dragging) {
        if (autoRotate && !reduced) velRef.current += 0.35 * dt;
        velRef.current *= 0.92;
        rotRef.current += velRef.current;
        apply();
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(id);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, [autoRotate, photos.length]);

  const n = photos.length;
  const step = 360 / n;

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 overflow-hidden bg-ink touch-none [--ring-r:min(38vw,340px)]"
    >
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 42%" }}
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-[42%] h-0 w-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "translate(-50%, -46%) rotateY(0deg)",
          }}
        >
          {photos.map((photo, i) => (
            <figure
              key={photo.src}
              className="absolute overflow-hidden bg-paper-deep shadow-border"
              style={{
                width: "min(42vw, 220px)",
                height: "min(56vw, 292px)",
                marginLeft: "calc(min(42vw, 220px) / -2)",
                marginTop: "calc(min(56vw, 292px) / -2)",
                transform: `rotateY(${i * step}deg) translateZ(var(--ring-r))`,
                backfaceVisibility: "hidden",
                border: "6px solid #d4c8b8",
              }}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="size-full object-cover"
                draggable={false}
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
