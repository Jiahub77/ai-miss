import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/chrome/app-nav";
import { HomeScene } from "@/components/home/home-scene";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="bg-ink text-paper">
      <AppNav />
      <HomeScene />
    </main>
  );
}
