export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[65ch] flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--color-tabung-slate)]">
        TNG FINHACK 2026 · Financial Inclusion Track
      </p>
      <h1 className="mt-4 text-5xl leading-tight text-[color:var(--color-tabung-ink)]">
        DuitLater
      </h1>
      <p className="mt-3 font-[family-name:var(--font-display)] text-xl italic text-[color:var(--color-tabung-maroon)]">
        Sendiri tak mampu, ramai-ramai boleh.
      </p>
      <p className="mt-6 text-base leading-relaxed text-[color:var(--color-tabung-ink)]/80">
        Pool PayLater untuk komuniti B40. Dua hingga lapan ahli gabungkan TNG PayLater
        allowance individu mereka untuk membeli barang-barang yang sendiri tak mampu —
        difasilitasi oleh NADI centre, dipandu oleh Penasihat AI dalam Bahasa Melayu,
        dengan katalog daripada MyKasih MySARA.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          TNG PayLater
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          NADI · MCMC
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          MyKasih · MySARA
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          Next.js 15 · Tailwind v4
        </span>
        <span className="rounded-full border border-[color:var(--color-tabung-sand)] px-3 py-1 text-xs text-[color:var(--color-tabung-slate)]">
          Hono · Drizzle · Postgres 16
        </span>
      </div>
      <p className="mt-10 font-[family-name:var(--font-mono)] text-xs text-[color:var(--color-tabung-slate)]">
        Phase 0 · Stack Activation · landing rendered · test bed: NADI Felda Gedangsa, Hulu Selangor
      </p>
    </main>
  );
}
