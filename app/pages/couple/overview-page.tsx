import * as React from "react";
import { Link, useParams } from "react-router";
import {
  Users,
  MessageSquareHeart,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/contexts/auth-context";
import { getAppBaseUrl } from "~/lib/constants";
import { toast } from "sonner";

export function CoupleOverviewPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { couples, currentCouple, guests, wishes } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const activeSlug = slug || currentCouple?.slug || "template";
  const couple = couples.find((c) => c.slug === activeSlug) || currentCouple;

  const invitationUrl = `${getAppBaseUrl()}/${couple?.slug || "template"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    toast.success("Link Undangan Berhasil Disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter guests for this couple
  const coupleGuests = guests.filter((g) => g.coupleSlug?.toLowerCase() === couple?.slug?.toLowerCase());
  const attendingGuests = coupleGuests.filter((g) => g.rsvpStatus === "Attending");
  const tentativeGuests = coupleGuests.filter((g) => g.rsvpStatus === "Tentative");
  const regretGuests = coupleGuests.filter((g) => g.rsvpStatus === "Regret");
  const pendingGuests = coupleGuests.filter((g) => g.rsvpStatus === "Pending");

  const totalPaxAttending = attendingGuests.reduce((acc, g) => acc + g.pax, 0);

  // Filter wishes for this couple
  const coupleWishes = wishes.filter((w) => w.coupleSlug?.toLowerCase() === couple?.slug?.toLowerCase());

  if (!couple) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Undangan pernikahan tidak ditemukan.
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tamu Diundang",
      value: coupleGuests.length.toString(),
      subtext: `${couple.guestCount} kuota undangan`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Konfirmasi Hadir (RSVP)",
      value: `${attendingGuests.length} Tamu`,
      subtext: `Total estimasi ${totalPaxAttending} Pax`,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      title: "Ucapan & Doa Masuk",
      value: coupleWishes.length.toString(),
      subtext: `${coupleWishes.filter((w) => w.isPinned).length} disematkan di atas`,
      icon: MessageSquareHeart,
      color: "text-rose-500",
    },
    {
      title: "Check-in di Venue",
      value: `${coupleGuests.filter((g) => g.attended).length} Tamu`,
      subtext: "Terverifikasi via QR Code",
      icon: QrCode,
      color: "text-amber-500",
    },
  ];

  return (
    <main className="flex-1">
      <DashboardHeader
        title={`Dashboard Pernikahan ${(couple.groomName || "Groom").split(" ")[0]} & ${(couple.brideName || "Bride").split(" ")[0]}`}
        description={`Tanggal Pernikahan: ${couple.weddingDate || "-"}`}
        badge={
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              couple.status === "published"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {couple.status === "published" ? "● Undangan Live" : "● Draft"}
          </span>
        }
      />

      <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-5">
        {/* Quick Invitation Link Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/40 border border-border/80 rounded-md">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-foreground">Link Undangan Digital:</span>
            <span className="font-mono text-primary bg-background px-2.5 py-1 rounded-sm border border-border text-[11px] truncate max-w-[280px]">
              {invitationUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-7 px-2.5 text-xs gap-1.5 rounded-sm cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Tersalin!" : "Salin Link"}</span>
            </Button>
            <Button
              size="sm"
              asChild
              className="h-7 px-2.5 text-xs gap-1.5 rounded-sm cursor-pointer"
            >
              <Link to={`/${couple.slug}`} target="_blank">
                <ExternalLink className="h-3 w-3" />
                <span>Buka Website</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-1.5 rounded-md bg-muted/60">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RSVP Status & Checklist Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* RSVP Status Breakdown */}
          <Card className="border-border/80 shadow-xs lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Distribusi Respon Kehadiran (RSVP)
                </CardTitle>
                <CardDescription className="text-xs">
                  Ringkasan respon tamu yang telah mengisi form konfirmasi.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="h-7 text-xs cursor-pointer">
                <Link to={`/${couple.slug}/dashboard/guests`}>
                  Kelola Tamu →
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Hadir</p>
                  <p className="text-2xl font-bold mt-1">{attendingGuests.length}</p>
                  <p className="text-[11px] opacity-80">{totalPaxAttending} Pax</p>
                </div>
                <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Tentatif / Ragu</p>
                  <p className="text-2xl font-bold mt-1">{tentativeGuests.length}</p>
                  <p className="text-[11px] opacity-80">Menunggu kabar</p>
                </div>
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Berhalangan</p>
                  <p className="text-2xl font-bold mt-1">{regretGuests.length}</p>
                  <p className="text-[11px] opacity-80">Kirim doa</p>
                </div>
                <div className="p-3 rounded-md bg-muted/60 border border-border text-muted-foreground">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Belum Respon</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{pendingGuests.length}</p>
                  <p className="text-[11px]">Perlu diingatkan</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tingkat Konfirmasi Tamu</span>
                  <span className="font-semibold text-foreground">
                    {coupleGuests.length > 0
                      ? Math.round(((attendingGuests.length + tentativeGuests.length + regretGuests.length) / coupleGuests.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${coupleGuests.length ? (attendingGuests.length / coupleGuests.length) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-blue-500 h-full"
                    style={{
                      width: `${coupleGuests.length ? (tentativeGuests.length / coupleGuests.length) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{
                      width: `${coupleGuests.length ? (regretGuests.length / coupleGuests.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Checklist */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Kelengkapan Undangan
              </CardTitle>
              <CardDescription className="text-xs">
                Tahapan persiapan website undangan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {[
                { title: "Profil Mempelai & Orang Tua", done: !!couple.groomName && !!couple.brideName, link: `/${couple.slug}/dashboard/event` },
                { title: "Jadwal Akad & Resepsi", done: !!couple.akadVenue, link: `/${couple.slug}/dashboard/event` },
                { title: "Daftar Tamu Ditambahkan", done: coupleGuests.length > 0, link: `/${couple.slug}/dashboard/guests` },
                { title: "Galeri Foto & Background Musik", done: couple.galleryPhotos.length > 0, link: `/${couple.slug}/dashboard/gallery` },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.link}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className="font-medium text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.done
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.done ? "Selesai" : "Belum Diatur"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

