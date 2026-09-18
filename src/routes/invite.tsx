import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/chrome/app-nav";
import { Cover } from "@/components/invitation/cover";
import { Details } from "@/components/invitation/details";
import { Family } from "@/components/invitation/family";
import { SiteFooter } from "@/components/invitation/footer";
import { Letter } from "@/components/invitation/letter";
import { Schedule } from "@/components/invitation/schedule";
import { Story } from "@/components/invitation/story";
import { Travel } from "@/components/invitation/travel";

export const Route = createFileRoute("/invite")({ component: InvitePage });

function InvitePage() {
  return (
    <main className="bg-paper text-ink">
      <AppNav />
      <Cover />
      <Letter />
      <Story />
      <Details />
      <Schedule />
      <Family />
      <Travel />
      <SiteFooter />
    </main>
  );
}
