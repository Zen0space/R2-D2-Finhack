"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/duitlater/brand/zine";
import { buttonVariants } from "@/components/ui/button";
import { useSessionQuery } from "@/hooks/use-session-query";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const landingAnchors = [
  { href: "#gap", label: "Gap" },
  { href: "#solution", label: "Solution" },
  { href: "#stack", label: "Stack" },
  { href: "#demo", label: "Demo" },
  { href: "#ask", label: "Ask" },
] as const;

type AppNavItem = { href: string; label: string; nadiOnly?: boolean };

const appNav: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nadi/dashboard", label: "NADI", nadiOnly: true },
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
      toast.success("You've been signed out.");
      setIsUserMenuOpen(false);
      startTransition(() => router.push("/"));
    },
    onError: () => toast.error("Couldn't sign out right now."),
  });

  const isLandingPath = pathname === "/";
  const user = session?.user;
  const firstName = user ? user.name.split(" ")[0] ?? user.name : null;
  const isNadiStaff = user?.role === "nadi_staff";

  const showAnchors = isLandingPath;
  const visibleAppNav = appNav.filter((item) => (item.nadiOnly ? isNadiStaff : true));

  return (
    <header
      className="sticky top-0 z-40 border-b-[3px] border-[var(--dl-ink)] bg-[var(--dl-paper)]"
      style={{ boxShadow: "0 4px 0 var(--dl-ink)" }}
    >
      <div className="page-shell flex h-16 items-center gap-4 md:h-[72px]">
        <Link
          href={user && !isLandingPath ? "/dashboard" : "/"}
          className="flex shrink-0 items-center gap-3"
          aria-label="DuitLater home"
        >
          <Logo width={130} priority={isLandingPath} />
        </Link>

        {showAnchors ? (
          <nav
            className="hidden flex-1 items-center justify-center gap-1 md:flex"
            aria-label="Sections"
          >
            {landingAnchors.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="brutal-link zine-display px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--dl-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : user ? (
          <nav
            className="hidden flex-1 items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {visibleAppNav.map((item) => {
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
        ) : (
          <div className="flex-1" />
        )}

        <div className="hidden shrink-0 items-center gap-3 md:flex">
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
                <ChevronDown
                  size={14}
                  className={cn("transition-transform", isUserMenuOpen && "rotate-180")}
                />
              </button>
              {isUserMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 border-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] p-3"
                  style={{ boxShadow: "5px 5px 0 var(--dl-ink)" }}
                >
                  <div className="border-b-2 border-[var(--dl-ink)] pb-3">
                    <p className="zine-display text-base text-[var(--dl-ink)]">{user.name}</p>
                    {user.kampung?.name ? (
                      <p className="zine-display mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--dl-brick)]">
                        {user.kampung.name}
                      </p>
                    ) : null}
                  </div>
                  <ul className="grid gap-1 pt-3 text-sm">
                    <li>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--dl-paper-warm)]"
                      >
                        Dashboard
                      </Link>
                    </li>
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
                    <li className="mt-1 border-t-2 border-dashed border-[var(--dl-ink)]/30 pt-2">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => signOutMutation.mutate()}
                        disabled={signOutMutation.isPending}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[var(--dl-brick)] hover:bg-[var(--dl-paper-warm)] disabled:opacity-50"
                      >
                        <LogOut size={14} />{" "}
                        {signOutMutation.isPending ? "Signing out..." : "Sign out"}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "sm" }),
                "zine-display !bg-[var(--dl-brick)] !text-[var(--dl-paper)] hover:!bg-[var(--dl-brick-dark)]",
              )}
              style={{ boxShadow: "3px 3px 0 var(--dl-ink)" }}
            >
              Try Now
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((v) => !v)}
          className="ml-auto border-2 border-[var(--dl-ink)] p-2 md:hidden"
          style={{ boxShadow: "2px 2px 0 var(--dl-ink)" }}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t-2 border-[var(--dl-ink)] bg-[var(--dl-paper)] md:hidden">
          <nav className="page-shell grid gap-1 py-3" aria-label="Mobile">
            {showAnchors
              ? landingAnchors.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="zine-display border-l-4 border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--dl-ink)]"
                  >
                    {item.label}
                  </a>
                ))
              : user
                ? visibleAppNav.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                  })
                : null}

            <div className="mt-2 grid gap-2 border-t-2 border-dashed border-[var(--dl-ink)]/30 pt-3">
              {user ? (
                <>
                  <p className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-brick)]">
                    {firstName}
                    {user.kampung?.name ? ` · ${user.kampung.name}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => signOutMutation.mutate()}
                    disabled={signOutMutation.isPending}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "justify-center",
                    )}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "zine-display justify-center !bg-[var(--dl-brick)] !text-[var(--dl-paper)] hover:!bg-[var(--dl-brick-dark)]",
                  )}
                >
                  Try Now
                </Link>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
