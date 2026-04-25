"use client";

import {
  CheckCircle2,
  Home,
  Layers3,
  Landmark,
  Sparkles,
  SwatchBook,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { useDesignLanguage } from "@/components/providers/design-language-provider";
import { BrushHeadline, Logo, ScribbleCircle } from "@/components/duitlater/brand/zine";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { designLanguages } from "@/lib/design-language/config";
import { cn } from "@/lib/utils";

const languageIconMap = {
  zine: Sparkles,
  "neo-nusantara": Landmark,
  skeu: Layers3,
} as const;

const languageToneMap = {
  zine: "maroon",
  "neo-nusantara": "maroon",
  skeu: "gold",
} as const;

export function SettingsPage() {
  const { designLanguage, setDesignLanguage } = useDesignLanguage();
  const activeLanguage =
    designLanguages.find((item) => item.id === designLanguage) ?? designLanguages[0];

  return (
    <main className="px-4 py-6 sm:px-6 lg:py-10">
      <div className="page-shell grid gap-6">
        <header className="panel-surface relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
          <ScribbleCircle
            color="brick"
            size={300}
            variant="loop"
            className="-right-12 -top-14 opacity-15"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Logo width={130} />
                <Badge tone="gold">Settings</Badge>
                <Badge tone="neutral">Surface lab</Badge>
              </div>
              <div className="grid gap-3">
                <BrushHeadline color="brick" size="2xl" rotate={-2} as="h1">
                  Pilih design language untuk app ini.
                </BrushHeadline>
                <p className="max-w-3xl text-base text-[color:var(--dl-slate)] sm:text-lg">
                  Pilihan ini disimpan pada browser semasa dan terus ubah tokens, komponen shared,
                  serta permukaan utama app untuk tujuan eksperimen visual.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <InstallAppButton />
              <Link className={cn(buttonVariants({ variant: "outline" }))} href="/">
                <Home aria-hidden="true" size={16} />
                Landing
              </Link>
              <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/dashboard">
                <SwatchBook aria-hidden="true" size={16} />
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-2">
          {designLanguages.map((language) => {
            const Icon = languageIconMap[language.id];
            const isActive = language.id === designLanguage;

            return (
              <Card
                className={cn(
                  "overflow-hidden",
                  isActive ? "ring-2 ring-[color:rgba(47,106,63,0.18)]" : null,
                )}
                key={language.id}
              >
                <CardHeader className="gap-4 border-b border-[color:rgba(224,216,200,0.72)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={isActive ? "forest" : languageToneMap[language.id]}>
                          {isActive ? "Aktif" : language.badge}
                        </Badge>
                        {language.id === "skeu" ? <Badge tone="neutral">Local-only</Badge> : null}
                      </div>
                      <div className="grid gap-2">
                        <CardTitle className="text-4xl">{language.name}</CardTitle>
                        <CardDescription className="text-base">{language.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.76)] text-[color:var(--dl-maroon)]">
                      <Icon aria-hidden="true" size={22} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-4 py-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {language.traits.map((trait) => (
                      <div
                        className="rounded-[1.25rem] border border-[color:var(--dl-sand)] bg-[color:rgba(248,244,236,0.68)] p-4 text-sm font-medium text-[color:var(--dl-ink)]"
                        key={trait}
                      >
                        {trait}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.5rem] border border-[color:var(--dl-sand)] bg-white/78 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dl-slate)]">
                      Signal
                    </p>
                    <p className="mt-2 text-sm text-[color:var(--dl-ink)]">{language.tokens}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      disabled={isActive}
                      size="lg"
                      onClick={() => {
                        setDesignLanguage(language.id);
                        toast.success(`${language.name} kini aktif untuk browser ini.`);
                      }}
                    >
                      {isActive ? "Sedang aktif" : `Guna ${language.shortName}`}
                    </Button>

                    {isActive ? (
                      <span className="inline-flex items-center gap-2 text-sm text-[color:var(--dl-forest)]">
                        <CheckCircle2 aria-hidden="true" size={16} />
                        Disimpan untuk browser ini
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader className="gap-3">
              <Badge tone="maroon">Aktif sekarang</Badge>
              <CardTitle className="text-4xl">{activeLanguage.name}</CardTitle>
              <CardDescription className="text-base">
                Fokus eksperimen ini ialah shared tokens, komponen, dan surface utama supaya kesan
                pilihan boleh rasa di seluruh app tanpa fork UI sepenuhnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {activeLanguage.traits.map((trait) => (
                <div
                  className="flex items-center gap-3 rounded-[1.4rem] border border-[color:var(--dl-sand)] bg-white/78 p-4"
                  key={trait}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[color:rgba(200,148,31,0.14)] text-[color:var(--dl-gold-dark)]">
                    <Sparkles aria-hidden="true" size={18} />
                  </div>
                  <p className="text-sm text-[color:var(--dl-ink)] sm:text-base">{trait}</p>
                </div>
              ))}

              <div className="rounded-[1.4rem] border border-[color:rgba(122,46,46,0.14)] bg-[color:rgba(122,46,46,0.05)] p-4 text-sm text-[color:var(--dl-slate)]">
                Beberapa surface custom yang sangat spesifik masih kekal ikut layout asal. Untuk
                eksperimen pertama ini, coverage utama duduk pada background, tokens, buttons, cards,
                badges, input, dan panel shared.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <Badge tone="gold">Live preview</Badge>
              <CardTitle className="text-4xl">Preview komponen semasa</CardTitle>
              <CardDescription className="text-base">
                Sampel kecil ini guna primitives yang sama dengan halaman auth, dashboard, dan join flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field hint="Read-only preview" htmlFor="preview-pool" label="Nama pool">
                  <Input defaultValue="Pool Belian Dapur" id="preview-pool" readOnly />
                </Field>

                <Field htmlFor="preview-category" label="Kategori">
                  <Select defaultValue="keperluan-rumah" id="preview-category">
                    <option value="keperluan-rumah">Keperluan rumah</option>
                    <option value="jagaan">Penjagaan diri</option>
                    <option value="jimat-tenaga">Jimat tenaga</option>
                  </Select>
                </Field>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge tone="maroon">Draft</Badge>
                <Badge tone="gold">Invite terbuka</Badge>
                <Badge tone="forest">Ready</Badge>
                <Badge tone="neutral">Preview only</Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg">Simpan pilihan</Button>
                <Button size="lg" variant="secondary">
                  CTA kedua
                </Button>
                <Button size="lg" variant="outline">
                  Outline action
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
