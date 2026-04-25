export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[65ch] flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--color-tabung-slate)]">
        TNG FINHACK 2026 · Financial Inclusion Track
      </p>
      <h1 className="mt-4 text-5xl leading-tight text-[color:var(--color-tabung-ink)]">
        Kutu Digitizer
      </h1>
      <p className="mt-3 font-[family-name:var(--font-display)] text-xl italic text-[color:var(--color-tabung-maroon)]">
        Communal savings, on rails the unbanked already use.
      </p>
      <p className="mt-6 text-base leading-relaxed text-[color:var(--color-tabung-ink)]/80">
        The practice is older than banks. Millions of Malaysians run a kutu on trust, paper, and
        WhatsApp — without a visible ledger. We build the digital rail without replacing the
        practice.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          Next.js 15
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          Tailwind v4
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          Hono + Drizzle
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          Postgres 16
        </span>
      </div>
      <p className="mt-10 font-[family-name:var(--font-mono)] text-xs text-[color:var(--color-tabung-slate)]">
        Phase 0 · Stack Activation · landing rendered
      </p>
    </main>
  );
}
