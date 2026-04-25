import Link from "next/link";
import { WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center px-4 py-10">
      <section className="page-shell">
        <div className="panel-surface mx-auto grid max-w-xl gap-5 rounded-[2rem] px-6 py-10 text-center md:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:rgba(122,46,46,0.12)] text-[color:var(--dl-maroon)]">
            <WifiOff aria-hidden="true" size={30} />
          </div>
          <div className="space-y-3">
            <p className="section-kicker justify-center">Offline</p>
            <h1 className="text-4xl">Internet terputus sekejap.</h1>
            <p className="text-sm text-[color:var(--dl-slate)] sm:text-base">
              Bila sambungan kembali, skrin DuitLater akan segar semula. Buat masa ini anda masih
              boleh kembali ke halaman utama yang sudah dicache.
            </p>
          </div>
          <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mx-auto")} href="/">
            Kembali ke utama
          </Link>
        </div>
      </section>
    </main>
  );
}
