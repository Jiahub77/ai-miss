import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/chrome/app-nav";
import { WallScene } from "@/components/wall/wall-scene";

export const Route = createFileRoute("/wall")({ component: WallPage });

function WallPage() {
  return (
    <main className="bg-ink text-paper">
      <AppNav />
      <WallScene />
    </main>
  );
}
