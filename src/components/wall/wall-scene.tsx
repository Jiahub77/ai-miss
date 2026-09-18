import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { photos } from "@/lib/invitation";
import { CssRing } from "@/components/chrome/css-ring";
import {
  attachRenderer,
  bindPointer,
  loadTextures,
  ndcFromEvent,
  prefersReducedMotion,
  releaseRenderer,
  resizeRenderer,
} from "@/lib/three-runtime";

type Frame = {
  group: THREE.Group;
  index: number;
  angle0: number;
};

export function WallScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [hoverTitle, setHoverTitle] = useState<string | null>(null);
  const apiRef = useRef<{
    focus: (i: number | null) => void;
    step: (dir: number) => void;
  } | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const host = hostRef.current;
    if (!stage || !host) return;

    let running = true;
    let dispose = () => {};
    const n = photos.length;

    const html = document.documentElement;
    const prevTouch = html.style.touchAction;
    const prevOverflow = document.body.style.overflow;
    html.style.touchAction = "none";
    document.body.style.overflow = "hidden";

    loadTextures(photos.map((p) => p.src)).then((textures) => {
      if (!running || !textures.length) return;
      const mounted = attachRenderer(host);
      if (!mounted) return;

      const { renderer, canvas } = mounted;
      const reduced = prefersReducedMotion();
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1c1814);

      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 40);
      const camPos = new THREE.Vector3(0, 0.2, 8.2);
      camera.position.copy(camPos);

      const ring = new THREE.Group();
      scene.add(ring);

      const frames: Frame[] = [];
      const petals: THREE.Mesh[] = [];
      const disposables: { dispose: () => void }[] = [];
      const tmpScale = new THREE.Vector3();
      const pointer = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();

      let rot = 0;
      let vel = 0;
      let dragging = false;
      let focused: number | null = null;
      let camZ = 8.2;
      let targetCamZ = 8.2;
      let restZ = 8.2;
      let focusZ = 6.6;
      let radius = 4.4;
      let hover: Frame | null = null;
      let last = performance.now();
      let idle = 0;
      let portrait = true;

      textures.forEach((tex, i) => {
        const img = tex.image as { width?: number; height?: number } | undefined;
        const aspect = (img?.width ?? 3) / (img?.height ?? 4);
        const h = 2.05;
        const w = h * Math.min(Math.max(aspect, 0.62), 1.4);
        const geo = new THREE.PlaneGeometry(w, h);
        const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
        const photo = new THREE.Mesh(geo, mat);
        photo.name = "photo";
        const frameGeo = new THREE.PlaneGeometry(w + 0.07, h + 0.07);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0xd4c8b8, side: THREE.DoubleSide });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.z = -0.02;
        const group = new THREE.Group();
        group.add(frame, photo);
        group.userData.index = i;
        ring.add(group);
        frames.push({ group, index: i, angle0: (i / n) * Math.PI * 2 });
        disposables.push(geo, mat, frameGeo, frameMat, tex);
      });

      const petalGeo = new THREE.CircleGeometry(0.04, 6);
      const petalMat = new THREE.MeshBasicMaterial({
        color: 0xe7dccb,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(petalGeo, petalMat);
      if (!reduced) {
        for (let i = 0; i < 32; i++) {
          const m = new THREE.Mesh(petalGeo, petalMat);
          m.position.set((Math.random() - 0.5) * 10, Math.random() * 6 - 1, (Math.random() - 0.5) * 10);
          m.userData.speed = 0.18 + Math.random() * 0.3;
          m.userData.drift = (Math.random() - 0.5) * 0.16;
          scene.add(m);
          petals.push(m);
        }
      }

      const layout = () => {
        for (const f of frames) {
          const a = f.angle0 + rot;
          f.group.position.set(Math.sin(a) * radius, Math.sin(a * 2) * 0.08, Math.cos(a) * radius);
          f.group.lookAt(camera.position.x, f.group.position.y, camera.position.z);
        }
      };

      const nearestIndex = () => {
        const stepA = (Math.PI * 2) / n;
        return ((Math.round(-rot / stepA) % n) + n) % n;
      };

      const snapTo = (i: number) => {
        const stepA = (Math.PI * 2) / n;
        const current = -rot / stepA;
        let diff = i - current;
        if (diff > n / 2) diff -= n;
        if (diff < -n / 2) diff += n;
        rot = rot - diff * stepA;
        vel = 0;
      };

      const focus = (i: number | null) => {
        focused = i;
        idle = 0;
        setActive(i);
        if (i == null) {
          targetCamZ = restZ;
          return;
        }
        snapTo(i);
        targetCamZ = focusZ;
      };

      const step = (dir: number) => {
        const cur = focused ?? nearestIndex();
        focus((cur + dir + n) % n);
      };

      apiRef.current = { focus, step };

      const pick = (): Frame | null => {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(frames.map((f) => f.group), true);
        if (!hits[0]) return null;
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && obj.parent !== ring) obj = obj.parent;
        return frames.find((f) => f.group === obj) ?? null;
      };

      const unbind = bindPointer(stage, {
        onDrag: (dx) => {
          dragging = true;
          idle = 0;
          vel = dx * (portrait ? 0.0018 : 0.0012);
          rot += vel;
          if (focused != null) {
            focused = null;
            setActive(null);
            targetCamZ = restZ;
          }
        },
        onTap: (e) => {
          ndcFromEvent(e, canvas, pointer);
          const hit = pick();
          if (hit) {
            if (focused === hit.index) focus(null);
            else focus(hit.index);
          } else if (focused != null) {
            focus(null);
          } else {
            focus(nearestIndex());
          }
        },
        onPinch: (delta) => {
          idle = 0;
          targetCamZ = THREE.MathUtils.clamp(targetCamZ - delta * 8, focusZ - 0.4, restZ + 2.2);
        },
        onHover: (e) => ndcFromEvent(e, canvas, pointer),
      });

      const onPointerUp = () => {
        dragging = false;
      };
      const onLost = () => {
        running = false;
        setReady(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "Escape") focus(null);
      };

      stage.addEventListener("pointerup", onPointerUp);
      stage.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("webglcontextlost", onLost, false);
      window.addEventListener("keydown", onKey);

      const fit = () => {
        const size = resizeRenderer(renderer, camera);
        portrait = size.portrait;
        radius = portrait ? 4.15 : 6.4;
        restZ = portrait ? 7.35 : 11.2;
        focusZ = portrait ? 6.15 : 8.6;
        targetCamZ = focused == null ? restZ : focusZ;
        camera.fov = portrait ? 54 : 40;
        camera.updateProjectionMatrix();
      };

      const ro = new ResizeObserver(fit);
      ro.observe(host);
      window.addEventListener("resize", fit);
      fit();

      const tick = (now: number) => {
        if (!running) return;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        idle += dt;

        if (!dragging && focused == null && !reduced && idle > 4.5 && !portrait) vel += 0.012 * dt;
        vel *= focused == null ? 0.9 : 0.78;
        rot += vel;

        if (!dragging && focused == null && Math.abs(vel) < 0.004) {
          const stepA = (Math.PI * 2) / n;
          const target = -nearestIndex() * stepA;
          let delta = target - rot;
          const tau = Math.PI * 2;
          delta = ((delta + Math.PI) % tau) - Math.PI;
          rot += delta * (1 - Math.exp(-dt * 3.2));
        }

        layout();
        camZ += (targetCamZ - camZ) * (1 - Math.exp(-dt * 3.4));
        camPos.set(0, portrait ? 0.28 : 0.12, camZ);
        camera.position.lerp(camPos, 1 - Math.exp(-dt * 4));
        camera.lookAt(0, portrait ? 0.2 : 0, radius * 0.35);

        if (!dragging) {
          const hit = pick();
          if (hit !== hover) {
            hover = hit;
            setHoverTitle(hit ? photos[hit.index]!.title : null);
          }
        }

        for (const f of frames) {
          const isF = focused === f.index;
          const isH = hover === f;
          const s = isF ? 1.1 : isH ? 1.05 : 1;
          tmpScale.set(s, s, s);
          f.group.scale.lerp(tmpScale, 1 - Math.exp(-dt * 8));
          const photo = f.group.getObjectByName("photo") as THREE.Mesh | undefined;
          const mat = photo?.material as THREE.MeshBasicMaterial | undefined;
          if (mat) {
            const dim = focused != null && !isF ? 0.28 : 1;
            mat.color.setRGB(dim, dim, dim);
          }
        }

        for (const p of petals) {
          p.position.y -= p.userData.speed * dt;
          p.position.x += p.userData.drift * dt;
          p.rotation.z += dt * 0.45;
          if (p.position.y < -3) {
            p.position.y = 5;
            p.position.x = (Math.random() - 0.5) * 10;
          }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      setReady(true);

      dispose = () => {
        running = false;
        canvas.removeEventListener("webglcontextlost", onLost);
        unbind();
        stage.removeEventListener("pointerup", onPointerUp);
        stage.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", fit);
        ro.disconnect();
        for (const d of disposables) d.dispose();
        releaseRenderer(renderer);
      };
    });

    return () => {
      running = false;
      dispose();
      html.style.touchAction = prevTouch;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const shown = active != null ? photos[active] : null;

  return (
    <div ref={stageRef} className="fixed inset-0 overflow-hidden bg-ink touch-none">
      {!ready ? (
        <CssRing photos={photos} onFront={(i) => setHoverTitle(photos[i]?.title ?? "照片墙")} />
      ) : null}
      <div ref={hostRef} className="absolute inset-0 pointer-events-none" />

      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-5 sm:top-20">
        <p className="text-center font-serif text-[11px] leading-relaxed tracking-wide text-paper/55 sm:text-xs sm:tracking-mark">
          左右滑动 · 点按取近
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 scene-veil">
        {shown ? (
          <>
            <p className="font-serif text-2xl text-paper sm:text-3xl">{shown.title}</p>
            <p className="mt-1 text-sm text-paper/65">{shown.caption}</p>
            <p className="mt-2 font-display tabular-nums text-xs tracking-widest text-paper/40">
              {String(active! + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
            <div className="pointer-events-auto mt-4 flex gap-1 sm:mt-5 sm:gap-2">
              <button type="button" className="h-11 min-w-11 px-4 text-sm text-paper/80 hover:text-paper" onClick={() => apiRef.current?.step(-1)}>
                上一帧
              </button>
              <button type="button" className="h-11 min-w-11 px-4 text-sm text-paper/80 hover:text-paper" onClick={() => apiRef.current?.focus(null)}>
                退远
              </button>
              <button type="button" className="h-11 min-w-11 px-4 text-sm text-paper/80 hover:text-paper" onClick={() => apiRef.current?.step(1)}>
                下一帧
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-serif text-xl text-paper/90 sm:text-2xl">{hoverTitle ?? "照片墙"}</p>
            <p className="mt-1 text-sm text-paper/50">左右滑动翻阅</p>
          </>
        )}
      </div>
    </div>
  );
}
