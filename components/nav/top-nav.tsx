"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Home,
  Lightbulb,
  Building2,
  HandCoins,
  BookOpen,
  Bell,
  MessageSquare,
  LogOut,
  Settings,
  UserRound,
  Bookmark,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/big-ideas", label: "Big Ideas", icon: Lightbulb },
  { href: "/businesses", label: "Businesses", icon: Building2 },
  { href: "/opportunities", label: "Opportunities", icon: HandCoins },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

/** Structural reference is LinkedIn's top bar (logo, search, nav icons,
 * notifications, messages, profile menu) - visuals/content are all
 * NaWeHub's own. Notifications and messages have no backend endpoint in
 * the catalog yet, so both are stubbed as "coming soon" popovers rather
 * than wired to a fabricated API. */
export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");

  async function handleLogout() {
    useAuthStore.getState().clear();
    await authApi.logout().catch(() => null);
    router.replace("/login");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/entrepreneurs?query=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-sticky border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo markOnly className="lg:hidden" />
        <Logo className="hidden lg:flex" />

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-sm sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entrepreneurs…"
            className="pl-9"
            aria-label="Search entrepreneurs"
          />
        </form>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "relative h-auto flex-col gap-0.5 px-3 py-1.5 text-muted-foreground",
                  active && "text-primary-700 after:absolute after:inset-x-3 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-primary-500 dark:text-primary-300",
                )}
              >
                <Link href={item.href} aria-current={active ? "page" : undefined}>
                  <item.icon className="size-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <p className="font-display font-semibold">Notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coming soon - there&apos;s no notifications endpoint in the API yet.
              </p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Messages">
                <MessageSquare className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <p className="font-display font-semibold">Messages</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coming soon - there&apos;s no messaging endpoint in the API yet.
              </p>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full transition-transform hover:scale-105" aria-label="Account menu">
                <Avatar>
                  <AvatarImage src={resolveMediaUrl(user?.profilePhotoUrl) ?? undefined} alt={user?.displayName} />
                  <AvatarFallback>{initials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.displayName ?? "My account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/me">
                  <UserRound /> View profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/resources?view=saved">
                  <Bookmark /> Saved resources
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav className="flex items-center justify-around border-t border-border/60 py-1 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 text-muted-foreground",
                active && "text-primary-700 dark:text-primary-300",
              )}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
