import { RequireAuth } from "@/components/require-auth";
import { TopNav } from "@/components/nav/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
    </RequireAuth>
  );
}
