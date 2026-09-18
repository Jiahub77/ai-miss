import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { HomeLockup } from "@/components/home/home-lockup";
import {
  attachRenderer,
  bindPointer,
  loadTextures,
  prefersReducedMotion,
  releaseRenderer,
  resizeRenderer,
} from "@/lib/three-runtime";

const HERO = "/images/lanterns.jpg";

export function HomeScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const host = hostRef.current;
    if (!stage || !host) return;

    let running = true;
    let dispose = () => {};

    loadTextures([HERO]).then((textures) => {
      if (!running || !textures[0]) return;
      const mounted = attachRenderer(host);
      if (!mounted) return;

      const { renderer, canvas } = mounted;
      const reduced = prefersReducedMotion();
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1c1814);

      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
      const cam = new THREE.Vector3(0, 0, 5.05);
      camera.position.copy(cam);

      const tex = textures[0];
      const img = tex.image as { width?: number; height?: number } | undefined;
      const aspect = (img?.width ?? 16) / (img?.height ?? 9);
      const h = 5.6;
      const w = h * aspect;
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({ map: tex });
      const plane = new THREE.Mesh(geo, mat);
      scene.add(plane);

      const petals: THREE.Mesh[] = [];
      const petalGeo = new THREE.CircleGeometry(0.035, 6);
      const petalMat = new THREE.MeshBasicMaterial({
        color: 0xe8dccb,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      if (!reduced) {
        for (let i = 0; i < 14; i++) {
          const m = new THREE.Mesh(petalGeo, petalMat);
          m.position.set((Math.random() - 0.5) * 7, Math.random() * 5 - 1.5, 0.6 + Math.random() * 1.4);
          m.userData.speed = 0.04 + Math.random() * 0.05;
          m.userData.drift = (Math.random() - 0.5) * 0.03;
          scene.add(m);
          petals.push(m);
        }
      }

      let panX = 0;
      let panY = 0;
      let targetX = 0;
      let targetY = 0;
      let last = performance.now();

      const unbind = bindPointer(stage, {
        onDrag: (dx, dy) => {
          targetX -= dx * 0.0009;
          targetY += dy * 0.0005;
        },
        onHover: (e) => {
          const rect = stage.getBoundingClientRect();
          targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.28;
          targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 0.12;
        },
      });

      const onLost = () => {
        running = false;
        setReady(false);
      };
      canvas.addEventListener("webglcontextlost", onLost, false);

      const fit = () => {
        resizeRenderer(renderer, camera);
        camera.fov = camera.aspect < 0.8 ? 44 : 36;
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
        const t = now / 1000;

        panX += (targetX - panX) * (1 - Math.exp(-dt * 1.6));
        panY += (targetY - panY) * (1 - Math.exp(-dt * 1.6));
        const breathe = reduced ? 0 : Math.sin(t * 0.08) * 0.06;
        camera.position.set(panX, panY * 0.65, 5.05 + breathe);
        camera.lookAt(panX * 0.2, panY * 0.1, 0);

        for (const p of petals) {
          p.position.y -= p.userData.speed * dt;
          p.position.x += p.userData.drift * dt;
          p.rotation.z += dt * 0.12;
          if (p.position.y < -2.8) p.position.y = 3.2;
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
        window.removeEventListener("resize", fit);
        ro.disconnect();
        geo.dispose();
        mat.dispose();
        tex.dispose();
        petalGeo.dispose();
        petalMat.dispose();
        releaseRenderer(renderer);
      };
    });

    return () => {
      running = false;
      dispose();
    };
  }, []);

  return (
    <div ref={stageRef} className="fixed inset-0 overflow-hidden bg-ink touch-none">
      {!ready ? (
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="size-full object-cover" />
        </div>
      ) : null}
      <div ref={hostRef} className="absolute inset-0 pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 z-10 cover-veil" />
      <HomeLockup />
    </div>
  );
}
