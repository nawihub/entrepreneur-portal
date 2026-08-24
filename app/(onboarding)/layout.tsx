import { RequireAuth } from "@/components/require-auth";
import { Logo } from "@/components/logo";

/** Distraction-free, LinkedIn-style onboarding shell: no TopNav/rails, just
 * the wizard - mirrors app/(auth)/layout.tsx's look but is auth-gated
 * (RequireAuth), since onboarding only makes sense for a logged-in user. */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--color-primary-100))_0%,transparent_45%),radial-gradient(circle_at_80%_75%,hsl(var(--color-secondary-100))_0%,transparent_45%)] dark:opacity-20"
        />
        <div className="mb-8 animate-fade-in-up">
          <Logo size="lg" />
        </div>
        <div className="w-full max-w-lg animate-fade-in-up">{children}</div>
      </div>
    </RequireAuth>
  );
}
