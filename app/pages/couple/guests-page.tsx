import * as React from "react";
import {
  Plus,
  Search,
  MessageCircle,
  Copy,
  Trash2,
  Loader2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
import { useAuth } from "~/contexts/auth-context";
import { getAppBaseUrl } from "~/lib/constants";
import type { Guest } from "~/types/dashboard";
import { toast } from "sonner";

export function CoupleGuestsPage() {
  const { currentCouple, guests, addGuest, updateGuest, deleteGuest } = useAuth();
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [deleteGuestTarget, setDeleteGuestTarget] = React.useState<Guest | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Add Guest Form State
  const [guestName, setGuestName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [category, setCategory] = React.useState<Guest["category"]>("Sahabat");
  const [pax, setPax] = React.useState(2);
  const [tableNumber, setTableNumber] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const couple = currentCouple;
  const coupleSlug = couple?.slug || "template";

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName) return;

    setSubmitting(true);
    try {
      await addGuest({
        coupleSlug,
        name: guestName,
        phone,
        category,
        pax: Number(pax) || 1,
        rsvpStatus: "Pending",
        attended: false,
        tableNumber,
        notes,
      });

      toast.success("Tamu Undangan Berhasil Ditambahkan!");
      setGuestName("");
      setPhone("");
      setTableNumber("");
      setNotes("");
      setAddDialogOpen(false);
    } catch (err: any) {
      toast.error("Gagal menambahkan tamu", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const coupleGuests = guests.filter((g) => g.coupleSlug === coupleSlug);

  const filteredGuests = coupleGuests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      (g.tableNumber && g.tableNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPersonalizedUrl = (name: string) => {
    const origin = getAppBaseUrl();
    const encoded = encodeURIComponent(name);
    return `${origin}/${coupleSlug}?to=${encoded}`;
  };

  const handleCopyGuestLink = (name: string) => {
    const url = getPersonalizedUrl(name);
    navigator.clipboard.writeText(url);
    toast.success(`Link untuk ${name} berhasil disalin!`);
  };

  const handleSendWhatsApp = (guest: Guest) => {
    const url = getPersonalizedUrl(guest.name);
    const text = `Halo *${guest.name}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir dan memberikan doa restu pada pernikahan kami:\n\n*${(couple?.groomName || "Groom").split(" ")[0]} & ${(couple?.brideName || "Bride").split(" ")[0]}*\n\nBuka undangan digital Anda melalui link berikut:\n${url}\n\nMerupakan suatu kehormatan & kebahagiaan bagi kami apabila Anda berkenan hadir.\n\nTerima kasih.`;
    const cleanPhone = guest.phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleToggleCheckIn = (id: string, currentStatus: boolean) => {
    updateGuest(id, {
      attended: !currentStatus,
      checkInTime: !currentStatus ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : undefined,
    });
    toast.success(!currentStatus ? "Tamu Berhasil Check-in di Venue!" : "Status Check-in dibatalkan");
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Daftar Tamu & RSVP"
        description="Kelola daftar undangan, generate link personal, dan blast via WhatsApp."
      />

      <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-4">
        {/* Page Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-md border border-border/80 flex-wrap">
            {["All", "VIP", "Keluarga", "Sahabat", "Rekan Kerja"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-sm cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full sm:w-64 relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau meja..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-md"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Tamu</span>
            </Button>
          </div>
        </div>

        <Card className="border-border/80 shadow-xs rounded-md">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Nama Tamu</TableHead>
                  <TableHead className="text-xs font-semibold">Kategori</TableHead>
                  <TableHead className="text-xs font-semibold">Pax</TableHead>
                  <TableHead className="text-xs font-semibold">Status RSVP</TableHead>
                  <TableHead className="text-xs font-semibold">Check-in Venue</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Kirim Undangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Belum ada data tamu pada filter ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="py-3">
                        <div className="font-semibold text-xs text-foreground">{g.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {g.phone || "Tanpa No. HP"} {g.tableNumber ? `• ${g.tableNumber}` : ""}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            g.category === "VIP"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {g.category}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs font-medium">
                        {g.pax} Orang
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            g.rsvpStatus === "Attending"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : g.rsvpStatus === "Tentative"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : g.rsvpStatus === "Regret"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {g.rsvpStatus === "Attending"
                            ? "Hadir"
                            : g.rsvpStatus === "Tentative"
                            ? "Tentatif"
                            : g.rsvpStatus === "Regret"
                            ? "Berhalangan"
                            : "Belum Respon"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleCheckIn(g.id, g.attended)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-opacity hover:opacity-80 ${
                            g.attended
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {g.attended ? `✓ Hadir (${g.checkInTime || "OK"})` : "○ Belum Hadir"}
                        </button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyGuestLink(g.name)}
                            title="Salin Link Khusus Tamu"
                            className="h-7 px-2 text-xs cursor-pointer"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Link
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleSendWhatsApp(g)}
                            title="Blast via WhatsApp"
                            className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WA
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteGuestTarget(g)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Hapus Tamu"
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* Add Guest Modal */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Tambah Tamu Undangan</DialogTitle>
              <DialogDescription className="text-xs">
                Data tamu akan otomatis dibuatkan link personal undangan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Tamu / Keluarga<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: Dwight Schrute & Partner"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">No. WhatsApp</label>
                <Input
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Kategori<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Guest["category"])}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Estimasi Pax<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nomor Meja (Opsional)</label>
                <Input
                  placeholder="Contoh: Table A1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddDialogOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting} size="sm" className="text-xs cursor-pointer">
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Tamu"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Guest Confirmation Modal */}
      <AlertDialog open={!!deleteGuestTarget} onOpenChange={(open) => !open && setDeleteGuestTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Tamu Undangan</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus data tamu{" "}
              <strong className="text-foreground font-semibold">"{deleteGuestTarget?.name}"</strong> ({deleteGuestTarget?.category}, {deleteGuestTarget?.pax} Pax)?
              <br />
              Link undangan personal dan QR Code check-in tamu ini tidak akan dapat digunakan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="text-xs cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (deleteGuestTarget) {
                  await deleteGuest(deleteGuestTarget.id);
                  toast.success(`Tamu "${deleteGuestTarget.name}" berhasil dihapus.`);
                  setDeleteGuestTarget(null);
                }
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90 font-semibold cursor-pointer shadow-xs"
            >
              Hapus Tamu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
