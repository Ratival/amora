import * as React from "react";
import { Link } from "react-router";
import {
  Plus,
  ExternalLink,
  Crown,
  Search,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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
import type { CoupleProject } from "~/types/dashboard";
import { toast } from "sonner";

export function AdminCouplesPage() {
  const { couples, createCouple, updateCouple, deleteCouple, setActiveCoupleBySlug, refreshData } = useAuth();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deletingCouple, setDeletingCouple] = React.useState<CoupleProject | null>(null);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Form State
  const [groomName, setGroomName] = React.useState("");
  const [brideName, setBrideName] = React.useState("");
  const [weddingDate, setWeddingDate] = React.useState("2026-11-20");
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName || !brideName) return;

    setCreating(true);
    try {
      const finalSlug = liveSlug || `undangan-${Date.now()}`;
      const finalEmail = `${finalSlug}@ratival.com`;
      const finalPassword = couplePassword || "password123";

      const created = await createCouple({
        groomName,
        brideName,
        slug: finalSlug,
        title: `The Wedding of ${groomName} & ${brideName}`,
        ownerEmail: finalEmail,
        weddingDate,
        status: "published",
        password: finalPassword,
      });

      setCreateOpen(false);
      setGroomName("");
      setBrideName("");
      setCouplePassword("password123");

      // Show credentials modal
      setCreatedCredentials({
        name: `${groomName} & ${brideName}`,
        email: finalEmail,
        password: finalPassword,
        slug: finalSlug,
      });

      toast.success("Undangan & Akun Pengguna Berhasil Dibuat!");
    } catch (err: any) {
      toast.error("Gagal menambahkan pasangan", { description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (slugToToggle: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    await updateCouple(slugToToggle, { status: nextStatus });
    toast.success(`Status undangan diubah menjadi ${nextStatus === "published" ? "Live" : "Draft"}`);
  };

  const filteredCouples = couples.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Kelola Pasangan & Undangan"
        description="Kelola seluruh akun pengantin dan status publikasi website mereka."
      />

      <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-4">
        {/* Page Toolbar with Action button, Filters, and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-md border border-border/80">
            {["all", "published", "draft"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-sm cursor-pointer transition-colors ${
                  statusFilter === tab
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "Semua" : tab === "published" ? "Terbit (Live)" : "Draft"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full sm:w-64 relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama mempelai..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-md"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Pasangan</span>
            </Button>
          </div>
        </div>

        <Card className="border-border/80 shadow-xs rounded-md">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pasangan</TableHead>
                  <TableHead className="text-xs">Slug Undangan</TableHead>
                  <TableHead className="text-xs">Tanggal Pernikahan</TableHead>
                  <TableHead className="text-xs">Tamu Undangan</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                      Belum ada pasangan terdaftar di database. Klik &quot;Tambah Pasangan Baru&quot; untuk membuat undangan.
                    </TableCell>
                  </TableRow>
                ) : (
                    filteredCouples.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="font-semibold text-xs text-foreground">
                            {c.groomName && c.brideName ? `${c.groomName} & ${c.brideName}` : c.title}
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

                      <TableCell className="text-xs font-mono font-medium text-primary">
                        /{c.slug}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {c.weddingDate || "-"}
                      </TableCell>

                      <TableCell className="text-xs">
                        <span className="font-semibold">{c.guestCount}</span> orang
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c.slug, c.status)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm cursor-pointer transition-opacity hover:opacity-80 ${
                            c.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {c.status === "published" ? "● Terbit (Klik u/ Ubah)" : "● Draft (Klik u/ Ubah)"}
                        </button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 px-2 text-xs rounded-sm cursor-pointer"
                          >
                            <Link to={`/${c.slug}`} target="_blank">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            asChild
                            className="h-7 px-2.5 text-xs rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          >
                            <Link
                              to={`/${c.slug}/dashboard`}
                              onClick={() => setActiveCoupleBySlug(c.slug)}
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Dashboard
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCouple(c)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Hapus Pasangan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Tambah Pasangan Baru</DialogTitle>
              <DialogDescription className="text-xs">
                Masukkan detail mempelai untuk membuat portal undangan baru.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Pengantin Pria<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Groom Name"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="text-xs h-8 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Pengantin Wanita<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Bride Name"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="text-xs h-8 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Slug URL Website Undangan</label>
                <div className="flex items-center">
                  <span className="bg-muted px-2.5 h-8 flex items-center text-muted-foreground border border-r-0 rounded-l-md text-xs font-mono">
                    {getAppDomain()}/
                  </span>
                  <Input
                    disabled
                    value={liveSlug}
                    placeholder="otomatis-dari-nama"
                    className="text-xs h-8 font-mono rounded-l-none bg-muted/60 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Slug URL dibuat otomatis dari nama kedua mempelai: /{liveSlug || "nama-pasangan"}
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
                  Tanggal Acara<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="text-xs h-8 rounded-md"
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
                    className="text-xs h-8 pr-8 font-mono rounded-md"
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
                className="text-xs cursor-pointer rounded-md"
              >
                Batal
              </Button>
              <Button type="submit" disabled={creating} size="sm" className="text-xs cursor-pointer rounded-md">
                {creating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Pasangan"
                )}
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
      {/* Delete Couple Confirmation Modal */}
      <AlertDialog open={!!deletingCouple} onOpenChange={(open) => !open && setDeletingCouple(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Data Pasangan & Undangan</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus data undangan pernikahan untuk{" "}
              <strong className="text-foreground font-semibold">"{deletingCouple?.title}"</strong> (/{deletingCouple?.slug})?
              <br />
              Seluruh data tamu, ucapan, galeri, dan konfigurasi website pasangan ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="text-xs cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (deletingCouple) {
                  try {
                    await deleteCouple(deletingCouple.id);
                    toast.success(`Data pasangan "${deletingCouple.title}" berhasil dihapus.`);
                    setDeletingCouple(null);
                  } catch (err: any) {
                    toast.error("Gagal menghapus pasangan", { description: err.message });
                  }
                }
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90 font-semibold cursor-pointer shadow-xs"
            >
              Hapus Pasangan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
