import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  Rocket,
  HandCoins,
  BadgeCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const PILLARS = [
  {
    icon: Lightbulb,
    title: "Pitch your Big Idea",
    description:
      "Submit your venture concept for review and get it in front of people who can help it grow.",
  },
  {
    icon: Rocket,
    title: "Build a professional profile",
    description:
      "Your story, skills, ventures, and journey - one profile that grows with you, not a résumé PDF.",
  },
  {
    icon: HandCoins,
    title: "Get matched to funding",
    description:
      "Browse grants, programs, and opportunities curated for young entrepreneurs across Sierra Leone.",
  },
  {
    icon: BadgeCheck,
    title: "Get vetted, get seen",
    description:
      "Verified businesses and featured founders stand out to partners, investors, and the community.",
  },
];

export default function MarketingHome() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-sticky border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--color-primary-100))_0%,transparent_50%),radial-gradient(circle_at_85%_30%,hsl(var(--color-secondary-100))_0%,transparent_45%)] dark:opacity-25"
          />
          <div className="container-page flex flex-col items-center gap-8 py-20 text-center lg:py-28">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
              <Users className="size-4" />
              Built for Sierra Leone&apos;s next generation of founders
            </div>
            <h1 className="animate-fade-in-up max-w-3xl text-4xl font-semibold lg:text-6xl">
              Your venture, your network, your <span className="text-primary-600 dark:text-primary-400">funding</span>{" "}
              — in one place.
            </h1>
            <p className="animate-fade-in-up max-w-xl text-lg text-muted-foreground">
              NaWeHub is where young entrepreneurs build a real profile, pitch their big ideas,
              register their businesses, and connect to the opportunities backing them.
            </p>
            <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create your profile <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container-page py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, i) => (
              <Card
                key={pillar.title}
                className="card-interactive animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary">
                    <pillar.icon className="size-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 bg-secondary-50/60 dark:bg-secondary-950/20">
          <div className="container-page flex flex-col items-center gap-6 py-16 text-center lg:py-20">
            <h2 className="max-w-2xl text-3xl font-semibold lg:text-4xl">
              Ready to put your idea on the map?
            </h2>
            <p className="max-w-lg text-muted-foreground">
              It takes less than five minutes to set up your profile and start exploring
              opportunities matched to you.
            </p>
            <Button size="lg" asChild className="btn-secondary-glow" variant="secondary">
              <Link href="/register">
                Join NaWeHub <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo size="sm" href={null} />
          <p>&copy; {new Date().getFullYear()} NaWeHub. Built for young entrepreneurs.</p>
        </div>
      </footer>
    </div>
  );
}
