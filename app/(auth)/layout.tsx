import { BadgeCheck, HandCoins, Lightbulb, Rocket, Users } from "lucide-react";
import { Logo } from "@/components/logo";

const PILLARS = [
  { icon: Lightbulb, title: "Submit your Big Idea", text: "Get your venture concept in front of people who can help it grow." },
  { icon: Rocket, title: "Build a professional profile", text: "Your story, skills, ventures and journey - one profile that grows with you." },
  { icon: HandCoins, title: "Get matched to funding", text: "Grants, programs and opportunities for young entrepreneurs across Sierra Leone." },
  { icon: BadgeCheck, title: "Get vetted, get seen", text: "Verified businesses and featured founders stand out to partners and investors." },
];

/**
 * Split layout for login and sign-up: the NaWeHub story on the left (large screens), the form on
 * the right. On phones the story collapses to the logo and headline above the form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-neutral-900 text-white lg:block">
        <div className="absolute inset-0" aria-hidden>
          <div className="animate-drift absolute -left-24 -top-24 size-[28rem] rounded-full bg-primary-500/35 blur-[110px]" />
          <div className="animate-drift absolute -bottom-32 right-0 size-[26rem] rounded-full bg-secondary-500/30 blur-[110px] [animation-delay:-6s]" />
          <div className="tile-pattern absolute inset-0 opacity-40" />
        </div>
        <div className="relative flex h-full flex-col justify-between gap-10 p-12">
          <div className="animate-fade-in-up">
            <Logo size="md" className="text-white" />
          </div>

          <div className="max-w-xl">
            <p className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-200 [animation-delay:80ms] [animation-fill-mode:both]">
              <Users className="size-4" />
              Built for Sierra Leone&apos;s next generation of founders
            </p>
            <h1 className="animate-fade-in-up mt-6 font-display text-4xl font-semibold leading-tight xl:text-5xl [animation-delay:160ms] [animation-fill-mode:both]">
              Your venture, your network, your <span className="text-primary-300">funding</span> — in one place.
            </h1>
            <p className="animate-fade-in-up mt-5 text-lg text-white/70 [animation-delay:240ms] [animation-fill-mode:both]">
              NaWeHub is where young entrepreneurs build a real profile, submit their big ideas, register their
              businesses, and connect to the opportunities backing them.
            </p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <li key={p.title} className="stagger-in flex gap-3" style={{ "--stagger": i + 4 } as React.CSSProperties}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <p.icon className="size-5 text-primary-300" />
                  </span>
                  <span>
                    <span className="block font-semibold">{p.title}</span>
                    <span className="text-sm text-white/60">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} NaWeHub. Built for young entrepreneurs.</p>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--color-primary-100))_0%,transparent_45%),radial-gradient(circle_at_80%_75%,hsl(var(--color-secondary-100))_0%,transparent_45%)] dark:opacity-20"
        />
        {/* Phones and tablets: the brand panel is hidden, so lead with the logo and promise. */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <Logo size="lg" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Your venture, your network, your funding — in one place.
          </p>
        </div>
        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </section>
    </div>
  );
}
