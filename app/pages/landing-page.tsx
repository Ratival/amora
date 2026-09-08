import * as React from "react";
import { Link } from "react-router";
import {
  Heart,
  ArrowRight,
  ExternalLink,
  CalendarCheck,
  CreditCard,
  Image as ImageIcon,
  MessageSquareHeart,
} from "lucide-react";
import { Button } from "~/components/ui/button";

export function LandingPage() {
  const capabilities = [
    {
      icon: CalendarCheck,
      title: "RSVP & Konfirmasi Hadir",
      description: "Tamu dapat mengonfirmasi kehadiran serta jumlah pendamping secara langsung dan realtime.",
    },
    {
      icon: CreditCard,
      title: "Amplop Digital & Hadiah",
      description: "Kemudahan pengiriman tanda kasih via transfer bank terverifikasi maupun QRIS.",
    },
    {
      icon: ImageIcon,
      title: "Galeri Foto & Cerita",
      description: "Bagikan perjalanan kisah cinta dan dokumentasi momen prewedding dengan tampilan sinematik.",
    },
    {
      icon: MessageSquareHeart,
      title: "Buku Tamu & Ucapan",
      description: "Kumpulan doa restu dan pesan hangat dari keluarga serta sahabat terdekat.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-neutral-200">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight leading-none text-foreground">
                Amora
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5 font-mono">
                by Ratival
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              <Link to="/template" target="_blank" className="flex items-center gap-1.5">
                <span>Lihat Demo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button size="sm" asChild className="text-xs font-medium rounded-lg cursor-pointer">
              <Link to="/login">
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-muted/40 text-[11px] font-mono text-muted-foreground mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>amora.ratival.com</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-tight font-normal text-foreground leading-[1.12]">
                Undangan pernikahan digital, <br className="hidden sm:inline" />
                <span className="italic font-light text-neutral-600 dark:text-neutral-300">
                  dirancang dengan penuh kesan.
                </span>
              </h1>

              <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Bagikan momen sakral dan kebahagiaan Anda kepada para tamu dengan tampilan yang elegan, interaktif, dan mudah dikelola dalam satu platform.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="default" asChild className="text-xs font-medium rounded-lg h-10 px-5 cursor-pointer">
                  <Link to="/login" className="flex items-center gap-2">
                    <span>Mulai Kelola Undangan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button variant="outline" size="default" asChild className="text-xs font-medium rounded-lg h-10 px-5 border-border cursor-pointer">
                  <Link to="/template" target="_blank" className="flex items-center gap-2">
                    <span>Lihat Contoh Undangan</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Showcase Visual */}
            <div className="mt-14 pt-8 border-t border-border/80">
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    amora.ratival.com/template
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/template"
                      target="_blank"
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                    >
                      <span>Buka</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="relative aspect-16/9 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&auto=format&fit=crop&q=80"
                    alt="Wedding Invitation Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-6 sm:p-10 text-white">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-300">
                      The Wedding of
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-serif italic mt-1 font-normal">
                      Jim Halpert & Pamela Beesly
                    </h2>
                    <p className="text-xs text-neutral-300 mt-1.5 font-sans">
                      Sabtu, 24 Oktober 2026 • Niagara Chapel & Garden
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Capabilities */}
        <section className="py-20 border-t border-border/80 bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="max-w-xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-foreground">
                Fitur esensial untuk momen berharga Anda
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Dirancang untuk memudahkan pasangan pengantin dan memberikan kenyamanan bagi seluruh tamu undangan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {capabilities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live Invitation Spotlight */}
        <section className="py-20 border-t border-border/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Live Experience
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-normal text-foreground mt-1">
                  Eksplorasi contoh undangan secara langsung
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Rasakan pengalaman interaktif mulai dari pembuka amplop surat, pemutar musik, konfirmasi RSVP, hingga kolom ucapan doa.
                </p>
              </div>

              <Button size="default" asChild className="text-xs font-medium rounded-lg shrink-0 cursor-pointer">
                <Link to="/template" target="_blank" className="flex items-center gap-2">
                  <span>Buka Contoh Undangan</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/80 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 fill-current text-foreground" />
            <span className="font-semibold text-foreground">Amora</span>
            <span>by Ratival</span>
          </div>
          <p className="font-mono text-[11px]">
            © {new Date().getFullYear()} Amora. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
