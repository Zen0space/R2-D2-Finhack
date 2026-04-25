"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, Menu, Settings as SettingsIcon, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/duitlater/brand/zine";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSessionQuery } from "@/hooks/use-session-query";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; nadiOnly?: boolean };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nadi/dashboard", label: "NADI" },
  { href: "/settings", label: "Settings" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSessionQuery();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      toast.success("Anda dah sign out.");
      setIsUserMenuOpen(false);
      startTransition(() => router.push("/sign-in"));
    },
    onError: () => toast.error("Couldn't sign out right now."),
  });

  const isLandingPath = pathname === "/";
  const user = session?.user;
  const firstName = user ? user.name.split(" ")[0] ?? user.name : null;
  const isNadiStaff = user?.role === "nadi_staff";

  const visibleNav = navItems.filter((item) => (item.nadiOnly ? isNadiStaff : true));

  return (
    <header
      className="sticky top-0 z-40 border-b-[3px] border-[var(--dl-ink)] bg-[var(--dl-paper)]"
      style={{ boxShadow: "0 4px 0 var(--dl-ink)" }}
    >
      <div className="page-shell flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3" aria-label="DuitLater home">
          <Logo width={130} priority={isLandingPath} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "brutal-link zine-display px-3 py-2 text-sm tracking-[0.06em]",
                  active && "text-[var(--dl-brick)]",
                )}
                data-active={active ? "true" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <InstallAppButton />
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="zine-display flex items-center gap-2 border-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] px-3 py-1.5 text-sm tracking-wide hover:bg-[var(--dl-paper-warm)]"
                style={{ boxShadow: "3px 3px 0 var(--dl-ink)" }}
              >
                <span className="flex h-7 w-7 items-center justify-center bg-[var(--dl-teal)] text-[var(--dl-paper)]">
                  {firstName?.[0] ?? "?"}
                </span>
                <span className="hidden lg:inline">{firstName}</span>
                <ChevronDown size={14} className={cn("transition-transform", isUserMenuOpen && "rotate-180")} />
              </button>
              {isUserMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 border-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] p-3"
                  style={{ boxShadow: "5px 5px 0 var(--dl-ink)" }}
                >
                  <div className="border-b-2 border-[var(--dl-ink)] pb-3">
                    <p className="zine-display text-base text-[var(--dl-ink)]">{user.name}</p>
                    <p className="text-xs text-[var(--dl-slate)]">{user.email}</p>
                    <p className="zine-display mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--dl-brick)]">
                      {user.kampung.name}
                    </p>
                  </div>
                  <ul className="grid gap-1 pt-3 text-sm">
                    {isNadiStaff ? (
                      <li>
                        <Link
                          href="/nadi/dashboard"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--dl-paper-warm)]"
                        >
                          <ShieldCheck size={14} /> Portal NADI
                        </Link>
                      </li>
                    ) : null}
                    <li>
                      <Link
                        href="/settings"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--dl-paper-warm)]"
                      >
                        <SettingsIcon size={14} /> Settings
                      </Link>
                    </li>
                    <li className="mt-1 border-t-2 border-dashed border-[var(--dl-ink)]/30 pt-2">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => signOutMutation.mutate()}
                        disabled={signOutMutation.isPending}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[var(--dl-brick)] hover:bg-[var(--dl-paper-warm)] disabled:opacity-50"
                      >
                        <LogOut size={14} />{" "}
                        {signOutMutation.isPending ? "Sedang keluar..." : "Sign out"}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }))} href="/sign-in">
                Sign in
              </Link>
              <Link className={cn(buttonVariants({ size: "sm" }))} href="/sign-up">
                Daftar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((v) => !v)}
          className="md:hidden border-2 border-[var(--dl-ink)] p-2"
          style={{ boxShadow: "2px 2px 0 var(--dl-ink)" }}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] md:hidden">
          <nav className="page-shell grid gap-1 py-3" aria-label="Mobile">
            {visibleNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "zine-display border-l-4 px-3 py-2 text-sm tracking-[0.06em]",
                    active
                      ? "border-[var(--dl-brick)] bg-[var(--dl-paper-warm)] text-[var(--dl-brick)]"
                      : "border-transparent text-[var(--dl-ink)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid gap-2 border-t-2 border-dashed border-[var(--dl-ink)]/30 pt-3">
              {user ? (
                <>
                  <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-brick)]">
                    {firstName} · {user.kampung.name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOutMutation.mutate()}
                    disabled={signOutMutation.isPending}
                  >
                    <LogOut size={14} /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }))} href="/sign-in">
                    Sign in
                  </Link>
                  <Link className={cn(buttonVariants({ size: "sm" }))} href="/sign-up">
                    Daftar
                  </Link>
                </>
              )}
              <InstallAppButton />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
