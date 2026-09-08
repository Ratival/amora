import * as React from "react";
import { Link } from "react-router";
import {
  HeartHandshake,
  Users,
  MessageSquareHeart,
  Plus,
  ExternalLink,
  Crown,
  Search,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useAuth } from "~/contexts/auth-context";
import { getAppBaseUrl, getAppDomain } from "~/lib/constants";
import { toast } from "sonner";

export function AdminOverviewPage() {
  const { couples, stats, createCouple, setActiveCoupleBySlug, refreshData } = useAuth();
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // New couple form state
  const [groomName, setGroomName] = React.useState("");
  const [brideName, setBrideName] = React.useState("");
  const [weddingDate, setWeddingDate] = React.useState("2026-11-28");
  const [couplePassword, setCouplePassword] = React.useState("password123");
  const [showPassword, setShowPassword] = React.useState(false);

  // Success credentials dialog state
  const [createdCredentials, setCreatedCredentials] = React.useState<{
    name: string;
    email: string;
    password: string;
    slug: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = React.useState(false);

  const cleanSlugPart = (name: string) =>
    name.trim().split(" ")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

  const liveSlug =
    groomName || brideName
      ? `${cleanSlugPart(groomName)}-${cleanSlugPart(brideName)}`.replace(/^-+|-+$/g, "")
      : "";

  const handleOpenCreate = () => {
    setGroomName("");
    setBrideName("");
    setCouplePassword("password123");
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName || !brideName) {
      toast.error("Nama kedua mempelai wajib diisi");
      return;
    }

    const generatedSlug = liveSlug || `undangan-${Date.now()}`;
    const generatedEmail = `${generatedSlug}@ratival.com`;
    const finalPassword = couplePassword || "password123";

    const created = await createCouple({
      groomName,
      brideName,
      slug: generatedSlug,
      title: `The Wedding of ${groomName} & ${brideName}`,
      ownerEmail: generatedEmail,
      weddingDate,
      status: "published",
      password: finalPassword,
    });

    setCreateOpen(false);
    setGroomName("");
    setBrideName("");

    // Show credentials modal
    setCreatedCredentials({
      name: `${groomName} & ${brideName}`,
      email: generatedEmail,
      password: finalPassword,
      slug: generatedSlug,
    });

    toast.success("Undangan & Akun Pengguna Berhasil Dibuat!");
  };

  const filteredCouples = couples.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    {
      title: "Total Pasangan & Undangan",
      value: couples.length.toString(),
      subtext: `${couples.filter((c) => c.status === "published").length} dipublikasikan`,
      icon: HeartHandshake,
      color: "text-rose-500",
    },
    {
      title: "Total Tamu Terdaftar",
      value: stats.totalGuests.toLocaleString("id-ID"),
      subtext: `${stats.totalRSVPs.toLocaleString("id-ID")} RSVP terkonfirmasi`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Ucapan & Doa Masuk",
      value: stats.totalWishes.toLocaleString("id-ID"),
      subtext: "Total dari seluruh pasangan",
      icon: MessageSquareHeart,
      color: "text-emerald-500",
    },
  ];

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Ringkasan Platform Amora"
        description="Pusat kendali dan monitoring SaaS undangan pernikahan online."
      />

      <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-5">
        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
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
                <p className="text-[11px] text-muted-foreground mt-1">
                  {stat.subtext}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Couples List Table */}
        <Card className="border-border/80 shadow-xs rounded-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-sm font-semibold">Daftar Undangan Pasangan</CardTitle>
              <CardDescription className="text-xs">
                Semua pasangan yang memiliki website undangan di Amora Platform.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full sm:w-60 relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari pasangan atau slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-md"
                />
              </div>

              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Pasangan</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Mempelai / Undangan</TableHead>
                  <TableHead className="text-xs font-semibold">Slug URL</TableHead>
                  <TableHead className="text-xs font-semibold">Tanggal Acara</TableHead>
                  <TableHead className="text-xs font-semibold">Tamu / RSVP</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                      Belum ada undangan pasangan terdaftar di database. Klik &quot;Tambah Pasangan&quot; untuk membuat undangan pertama.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCouples.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="font-semibold text-xs text-foreground">
                            {c.groomName ? `${c.groomName.split(" ")[0]} & ${c.brideName.split(" ")[0]}` : c.title}
                          </div>
                          {c.slug === "template" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              Demo Template
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.ownerEmail ? c.ownerEmail.replace("@amora.io", "@ratival.com") : `${c.slug}@ratival.com`}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-mono text-primary font-medium">
                        /{c.slug}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {c.weddingDate || "-"}
                      </TableCell>

                      <TableCell className="text-xs">
                        <span className="font-medium text-foreground">{c.guestCount}</span> Tamu
                        <span className="text-[11px] text-muted-foreground ml-1.5">
                          ({c.rsvpCount?.attending || 0} Hadir)
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            c.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {c.status === "published" ? "Terbit Live" : "Draft"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 px-2 text-xs rounded-md cursor-pointer"
                          >
                            <Link to={`/${c.slug}`} target="_blank">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            asChild
                            className="h-7 px-2.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          >
                            <Link
                              to={`/${c.slug}/dashboard`}
                              onClick={() => setActiveCoupleBySlug(c.slug)}
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Buka Dashboard
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Couple Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Buat Undangan Pernikahan Baru</DialogTitle>
              <DialogDescription className="text-xs">
                Tambahkan pasangan baru ke sistem SaaS Amora.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Pengantin Pria (Groom)<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: Jim Halpert"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Pengantin Wanita (Bride)<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: Pam Beesly"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Slug URL Dashboard & Undangan</label>
                <div className="flex items-center">
                  <span className="bg-muted px-2.5 h-8 flex items-center text-muted-foreground border border-r-0 rounded-l-md text-xs font-mono">
                    {getAppDomain()}/
                  </span>
                  <Input
                    disabled
                    value={liveSlug}
                    placeholder="otomatis-dari-nama"
                    className="text-xs h-8 rounded-l-none font-mono bg-muted/60 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Slug URL dibuat otomatis: {getAppDomain()}/{liveSlug || "nama-pasangan"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Akun Pasangan</label>
                <Input
                  disabled
                  value={liveSlug ? `${liveSlug}@ratival.com` : ""}
                  placeholder="otomatis@ratival.com"
                  className="text-xs h-8 font-mono bg-muted/60 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Email dibuat otomatis untuk akun login pasangan: {liveSlug ? `${liveSlug}@ratival.com` : "nama-pasangan@ratival.com"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Tanggal Pernikahan<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Password Akun Pasangan
                  </label>
                  <span className="text-[10px] text-muted-foreground">Default: password123</span>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={couplePassword}
                    onChange={(e) => setCouplePassword(e.target.value)}
                    placeholder="password123"
                    className="text-xs h-8 pr-8 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Password ini akan digunakan pasangan untuk masuk ke dashboard mereka di halaman login.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="text-xs cursor-pointer">
                Simpan & Buat Undangan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Created Credentials Modal */}
      <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="h-5 w-5" />
              <span>Akun Pasangan Berhasil Dibuat!</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Simpan dan bagikan informasi akun login berikut kepada pasangan pengantin:
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Nama Pasangan</span>
                <span className="font-semibold text-foreground text-sm">{createdCredentials.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Email Login</span>
                  <span className="font-mono font-semibold text-foreground">{createdCredentials.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Password</span>
                  <span className="font-mono font-bold text-primary">{createdCredentials.password}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-border/60">
                <span className="text-muted-foreground block text-[11px]">Link Website Undangan</span>
                <span className="font-mono text-xs text-foreground">
                  {getAppBaseUrl()}/{createdCredentials.slug}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (createdCredentials) {
                  const baseUrl = getAppBaseUrl();
                  const text = `Akun Undangan Amora:\nNama: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nLink: ${baseUrl}/${createdCredentials.slug}`;
                  navigator.clipboard.writeText(text);
                  setCopiedCreds(true);
                  toast.success("Informasi Akun Berhasil Disalin!");
                  setTimeout(() => setCopiedCreds(false), 2000);
                }
              }}
              className="text-xs gap-1.5 cursor-pointer rounded-md"
            >
              {copiedCreds ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCreds ? "Tersalin!" : "Salin Informasi Akun"}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setCreatedCredentials(null)}
              className="text-xs cursor-pointer rounded-md"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
