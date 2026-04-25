import Link from "next/link";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";

const productLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nadi/dashboard", label: "Portal NADI" },
  { href: "/settings", label: "Settings" },
] as const;

const team = [
  { name: "Ijam", role: "Pitch · narrative" },
  { name: "Moon", role: "Backend · infra" },
  { name: "Akmal", role: "Frontend" },
  { name: "Kairu", role: "PM · phase gate" },
  { name: "MatNep", role: "Brand · design" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t-[3px] border-[var(--dl-ink)] bg-[var(--dl-teal)] text-[var(--dl-paper)]"
      style={{ boxShadow: "0 -4px 0 var(--dl-ink)" }}
    >
      <ScribbleCircle
        color="paper"
        size={320}
        variant="loop"
        className="-left-12 -top-16 opacity-15"
      />
      <ScribbleCircle
        color="paper"
        size={260}
        variant="double"
        className="-right-10 bottom-8 opacity-12"
      />

      <div className="page-shell relative grid gap-12 px-4 py-14 md:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr] md:gap-10">
        <div className="grid gap-5">
          <Logo width={180} className="brightness-0 invert" />
          <BrushHeadline color="cream" size="xl" rotate={-3} as="p">
            Built ramai-ramai.
          </BrushHeadline>
          <p className="max-w-md text-sm text-[var(--dl-paper)] opacity-85">
            Pool TNG PayLater untuk komuniti B40 — combine, vote, beli barang yang sorang tak
            mampu. Built on real Malaysian rails: TNG · NADI · MyKasih.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span
              className="zine-display border-2 border-[var(--dl-paper)] px-2.5 py-1 text-xs uppercase tracking-[0.18em]"
              style={{ boxShadow: "3px 3px 0 var(--dl-ink)" }}
            >
              TNG FINHACK 2026
            </span>
            <span className="zine-display text-xs uppercase tracking-[0.18em] text-[var(--dl-paper)] opacity-80">
              Financial Inclusion track
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          <p className="zine-display text-xs uppercase tracking-[0.22em] text-[var(--dl-paper)] opacity-70">
            Product
          </p>
          <ul className="grid gap-2 text-sm">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="brutal-link inline-block py-0.5 text-[var(--dl-paper)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3">
          <p className="zine-display text-xs uppercase tracking-[0.22em] text-[var(--dl-paper)] opacity-70">
            Team R2-D2
          </p>
          <ul className="grid gap-2 text-sm">
            {team.map((member) => (
              <li key={member.name} className="flex flex-col">
                <span className="zine-display tracking-wide text-[var(--dl-paper)]">{member.name}</span>
                <span className="text-xs text-[var(--dl-paper)] opacity-70">{member.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3">
          <p className="zine-display text-xs uppercase tracking-[0.22em] text-[var(--dl-paper)] opacity-70">
            Repo
          </p>
          <ul className="grid gap-2 text-sm">
            <li>
              <a
                href="https://github.com/Zen0space/R2-D2-Finhack"
                target="_blank"
                rel="noreferrer"
                className="brutal-link inline-block py-0.5 text-[var(--dl-paper)]"
              >
                GitHub
              </a>
            </li>
            <li>
              <Link href="/" className="brutal-link inline-block py-0.5 text-[var(--dl-paper)]">
                Pitch home
              </Link>
            </li>
          </ul>
          <p className="mt-2 text-xs text-[var(--dl-paper)] opacity-60">
            Splatink font for hackathon use only — commercial license required for production.
          </p>
        </div>
      </div>

      <div className="border-t-2 border-[rgba(245,240,220,0.25)]">
        <div className="page-shell flex flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-[var(--dl-paper)] opacity-70 md:flex-row md:items-center">
          <p>© {year} DuitLater · KrackedDevs · MIT-licensed code</p>
          <p className="zine-display tracking-[0.18em]">Built with maji-core · BMAD phase-gated</p>
        </div>
      </div>
    </footer>
  );
}
