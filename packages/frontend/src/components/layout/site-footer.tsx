import Link from "next/link";
import { Logo } from "@/components/duitlater/brand/zine";

const productLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nadi/dashboard", label: "Portal NADI" },
] as const;

type TeamMember = { role: string; name: string; contact?: string };

const team: TeamMember[] = [
  { role: "Pitch", name: "Izham", contact: "zarulijam@gmail.com" },
  { role: "Backend", name: "Hakim" },
  { role: "Frontend", name: "Akmal" },
  { role: "PM", name: "Khairul" },
  { role: "Brand · Design", name: "Hanif" },
];

const REPO_URL = "https://github.com/Ijam18/duitlater";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t-[3px] border-[var(--dl-ink)] bg-[var(--dl-teal)] text-[var(--dl-paper)]"
      style={{ boxShadow: "0 -4px 0 var(--dl-ink)" }}
    >
      <div className="page-shell grid gap-10 px-4 py-12 md:grid-cols-[1.3fr_1.1fr_1fr] md:gap-12">
        <div className="grid gap-3">
          <Logo width={150} className="brightness-0 invert" />
          <p className="text-sm text-[var(--dl-paper)] opacity-85 md:max-w-xs">
            Pool TNG PayLater. Combine, vote, buy. TNG · NADI · MyKasih.
          </p>
          <span
            className="zine-display mt-2 inline-block w-fit border-2 border-[var(--dl-paper)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
            style={{ boxShadow: "2px 2px 0 var(--dl-ink)" }}
          >
            TNGD FINHACK 2026 · Financial Inclusion
          </span>
        </div>

        <div className="grid gap-3">
          <p className="zine-display text-[11px] uppercase tracking-[0.24em] text-[var(--dl-paper)] opacity-70">
            Team R2-D2
          </p>
          <ul className="grid gap-1.5">
            {team.map((member) => (
              <li key={member.name} className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="zine-display text-[10px] uppercase tracking-[0.18em] opacity-65">
                  {member.role}
                </span>
                <span className="zine-display text-sm tracking-wide">{member.name}</span>
                {member.contact ? (
                  <a
                    href={`mailto:${member.contact}`}
                    className="brutal-link text-xs opacity-75 hover:opacity-100"
                  >
                    · {member.contact}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3">
          <p className="zine-display text-[11px] uppercase tracking-[0.24em] text-[var(--dl-paper)] opacity-70">
            Product
          </p>
          <ul className="grid gap-1.5 text-sm">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="brutal-link text-[var(--dl-paper)]">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="brutal-link text-[var(--dl-paper)]"
              >
                GitHub
              </a>
            </li>
          </ul>
          <p className="mt-2 text-xs text-[var(--dl-paper)] opacity-70">
            MIT-licensed. Any NADI, any state, any kampung can run it.
          </p>
        </div>
      </div>

      <div className="border-t-2 border-[rgba(245,240,220,0.25)]">
        <div className="page-shell flex flex-col items-start justify-between gap-1 px-4 py-3 text-[11px] text-[var(--dl-paper)] opacity-70 md:flex-row md:items-center">
          <p>© {year} DuitLater · Prepared by R2-D2 for TNGD FINHACK 2026</p>
          <p className="zine-display tracking-[0.18em]">maji-core · BMAD phase-gated</p>
        </div>
      </div>
    </footer>
  );
}
