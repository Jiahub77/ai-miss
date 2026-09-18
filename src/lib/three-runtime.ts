import * as THREE from "three";

export function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function attachRenderer(host: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;pointer-events:none;";
  host.appendChild(canvas);

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x1c1814, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer() ? 1.5 : 2));
    return { renderer, canvas };
  } catch {
    canvas.remove();
    return null;
  }
}

export function releaseRenderer(renderer: THREE.WebGLRenderer) {
  const canvas = renderer.domElement;
  renderer.dispose();
  renderer.forceContextLoss();
  canvas.remove();
}

export function resizeRenderer(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
  const canvas = renderer.domElement;
  const parent = canvas.parentElement;
  const width = Math.max(1, Math.round(parent?.clientWidth || window.innerWidth));
  const height = Math.max(1, Math.round(parent?.clientHeight || window.innerHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer() ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  return { width, height, portrait: height / width > 1.15 };
}

export function loadTextures(urls: string[]) {
  return new Promise<THREE.Texture[]>((resolve) => {
    const out: Array<THREE.Texture | undefined> = [];
    let left = urls.length;
    if (!urls.length) {
      resolve([]);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(out.filter((t): t is THREE.Texture => Boolean(t)));
    };

    const one = () => {
      left -= 1;
      if (left <= 0) finish();
    };

    urls.forEach((url, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        out[i] = tex;
        one();
      };
      img.onerror = () => one();
      img.src = url;
    });

    window.setTimeout(finish, 6000);
  });
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function bindPointer(
  target: HTMLElement,
  handlers: {
    onDrag: (dx: number, dy: number) => void;
    onTap?: (e: PointerEvent) => void;
    onPinch?: (delta: number) => void;
    onHover?: (e: PointerEvent) => void;
  },
) {
  const pointers = new Map<number, { x: number; y: number }>();
  let lastPinch = 0;
  let moved = 0;
  let dragging = false;

  const pinchDist = () => {
    const pts = [...pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
  };

  const isUi = (e: Event) => {
    const t = e.target as HTMLElement | null;
    return Boolean(t?.closest("a, button, input, textarea"));
  };

  const onDown = (e: PointerEvent) => {
    if (isUi(e)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragging = true;
      moved = 0;
      if (e.pointerType === "mouse") {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          /* Safari */
        }
      }
    } else {
      lastPinch = pinchDist();
    }
  };

  const onMove = (e: PointerEvent) => {
    handlers.onHover?.(e);
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    prev.x = e.clientX;
    prev.y = e.clientY;
    if (pointers.size >= 2) {
      const d = pinchDist();
      if (lastPinch) handlers.onPinch?.((d - lastPinch) * 0.012);
      lastPinch = d;
      e.preventDefault();
      return;
    }
    if (!dragging) return;
    moved += Math.abs(dx) + Math.abs(dy);
    handlers.onDrag(dx, dy);
    e.preventDefault();
  };

  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinch = 0;
    if (pointers.size === 0 && dragging) {
      dragging = false;
      if (moved < 14) handlers.onTap?.(e);
    }
  };

  const onLost = () => {
    pointers.clear();
    dragging = false;
    lastPinch = 0;
  };

  const prevent = (e: Event) => {
    if (isUi(e)) return;
    e.preventDefault();
  };
  target.addEventListener("pointerdown", onDown);
  target.addEventListener("pointermove", onMove, { passive: false });
  target.addEventListener("pointerup", onUp);
  target.addEventListener("pointercancel", onUp);
  target.addEventListener("lostpointercapture", onLost);
  target.addEventListener("contextmenu", prevent);
  target.addEventListener("touchstart", prevent, { passive: false });
  target.addEventListener("touchmove", prevent, { passive: false });

  return () => {
    target.removeEventListener("pointerdown", onDown);
    target.removeEventListener("pointermove", onMove);
    target.removeEventListener("pointerup", onUp);
    target.removeEventListener("pointercancel", onUp);
    target.removeEventListener("lostpointercapture", onLost);
    target.removeEventListener("contextmenu", prevent);
    target.removeEventListener("touchstart", prevent);
    target.removeEventListener("touchmove", prevent);
  };
}

export function ndcFromEvent(e: PointerEvent, el: HTMLElement, out: THREE.Vector2) {
  const rect = el.getBoundingClientRect();
  out.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
  out.y = -((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
}
