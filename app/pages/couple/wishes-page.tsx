import * as React from "react";
import { useParams } from "react-router";
import {
  Pin,
  Reply,
  Trash2,
  Search,
} from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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
import { useAuth } from "~/contexts/auth-context";
import { api } from "~/lib/api";
import type { Wish } from "~/types/dashboard";
import { toast } from "sonner";

export function CoupleWishesPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const { currentCouple, wishes: contextWishes, refreshData } = useAuth();
  const [search, setSearch] = React.useState("");
  const [replyingWish, setReplyingWish] = React.useState<Wish | null>(null);
  const [deletingWish, setDeletingWish] = React.useState<Wish | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [wishesList, setWishesList] = React.useState<Wish[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const couple = currentCouple;
  const coupleSlug = routeSlug || couple?.slug || "template";

  const fetchCoupleWishes = React.useCallback(async () => {
    if (!coupleSlug) {
      setWishesList([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let res = await api.couple.getWishes(coupleSlug);
      if (!res.success || !Array.isArray(res.data) || res.data.length === 0) {
        // Fallback to public wishes endpoint to ensure wishes are always retrieved
        const pubRes = await api.public.getWishes(coupleSlug);
        if (pubRes.success && Array.isArray(pubRes.data) && pubRes.data.length > 0) {
          res = pubRes;
        }
      }

      if (res.success && Array.isArray(res.data)) {
        const mapped: Wish[] = res.data.map((w: any) => ({
          id: w.id,
          coupleSlug: w.coupleSlug || coupleSlug,
          name: w.guestName || w.name,
          relationship: w.relationship || "Tamu Undangan",
          message: w.message,
          attendance: w.attendingStatus?.toLowerCase().includes("tidak")
            ? "not_attending"
            : w.attendingStatus?.toLowerCase().includes("ragu")
            ? "tentative"
            : "attending",
          isPinned: w.isPinned || false,
          isApproved: true,
          reply: w.replies?.[0]?.message || w.reply || "",
          createdAt: w.createdAt || new Date().toISOString(),
        }));
        setWishesList(mapped);
      } else {
        setWishesList([]);
      }
    } catch (err) {
      console.error("Failed to load wishes in dashboard:", err);
      setWishesList([]);
    } finally {
      setIsLoading(false);
    }
  }, [coupleSlug]);

  React.useEffect(() => {
    fetchCoupleWishes();
  }, [fetchCoupleWishes]);

  const activeWishes = !isLoading || wishesList.length > 0
    ? wishesList
    : contextWishes.filter((w) => w.coupleSlug.toLowerCase() === coupleSlug.toLowerCase());

  const filteredWishes = activeWishes.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.message.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenReply = (wish: Wish) => {
    setReplyingWish(wish);
    setReplyText(wish.reply || "");
  };

  const handleTogglePin = async (wish: Wish) => {
    const nextPinned = !wish.isPinned;
    setWishesList((prev) =>
      prev.map((w) => (w.id === wish.id ? { ...w, isPinned: nextPinned } : w))
    );
    if (coupleSlug && coupleSlug !== "template") {
      try {
        await api.couple.togglePinWish(coupleSlug, wish.id);
        await refreshData();
      } catch (err) {
        console.error("Failed to toggle pin:", err);
        // Revert on error
        setWishesList((prev) =>
          prev.map((w) => (w.id === wish.id ? { ...w, isPinned: wish.isPinned } : w))
        );
        toast.error("Gagal mengubah status sematan ucapan.");
      }
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingWish) return;
    const targetId = replyingWish.id;
    const previousReply = replyingWish.reply;
    
    setWishesList((prev) =>
      prev.map((w) => (w.id === targetId ? { ...w, reply: replyText } : w))
    );
    
    if (coupleSlug && coupleSlug !== "template") {
      try {
        await api.couple.replyWish(coupleSlug, targetId, replyText);
        await refreshData();
        toast.success("Balasan ucapan berhasil disimpan!");
      } catch (err) {
        console.error("Failed to save reply:", err);
        setWishesList((prev) =>
          prev.map((w) => (w.id === targetId ? { ...w, reply: previousReply } : w))
        );
        toast.error("Gagal menyimpan balasan ucapan.");
      }
    } else {
      toast.success("Balasan ucapan berhasil disimpan!");
    }
    setReplyingWish(null);
  };

  const handleDeleteWish = async () => {
    if (!deletingWish) return;
    const targetWish = deletingWish;
    setWishesList((prev) => prev.filter((w) => w.id !== targetWish.id));

    if (coupleSlug && coupleSlug !== "template") {
      try {
        await api.couple.deleteWish(coupleSlug, targetWish.id);
        await refreshData();
        toast.success(`Ucapan dari "${targetWish.name}" berhasil dihapus.`);
      } catch (err) {
        console.error("Failed to delete wish:", err);
        setWishesList((prev) => [...prev, targetWish]);
        toast.error("Gagal menghapus ucapan.");
      }
    } else {
      toast.success(`Ucapan dari "${targetWish.name}" berhasil dihapus.`);
    }
    setDeletingWish(null);
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Ucapan & Doa Tamu"
        description="Pantau, moderasi ucapan, dan balas pesan hangat dari para tamu undangan."
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-80 relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari ucapan atau nama pengirim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Total {activeWishes.length} Ucapan Masuk
          </div>
        </div>

        {/* Wishes Feed */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filteredWishes.length === 0 ? (
            <div className="col-span-full p-12 text-center border border-dashed rounded-xl text-xs text-muted-foreground">
              Belum ada ucapan dan doa yang masuk.
            </div>
          ) : (
            filteredWishes.map((wish) => (
              <Card
                key={wish.id}
                className={`border-border/80 shadow-xs relative flex flex-col ${
                  wish.isPinned ? "border-primary/60 bg-primary/2" : ""
                }`}
              >
                {wish.isPinned && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <Pin className="h-3 w-3 fill-current" />
                    <span>Disematkan</span>
                  </div>
                )}

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {wish.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-xs font-bold text-foreground">
                        {wish.name}
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        {wish.relationship} • {new Date(wish.createdAt).toLocaleDateString("id-ID")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 flex-1 text-xs space-y-3">
                  <p className="text-foreground leading-relaxed italic">
                    "{wish.message}"
                  </p>

                  {/* Reply snippet */}
                  {wish.reply && (
                    <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60 text-xs">
                      <p className="text-[10px] font-bold text-primary mb-0.5">Balasan Anda:</p>
                      <p className="text-muted-foreground">{wish.reply}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-3 border-t border-border/60 bg-muted/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(wish)}
                      className={`h-7 px-2 text-[11px] cursor-pointer ${
                        wish.isPinned ? "text-primary font-bold" : "text-muted-foreground"
                      }`}
                    >
                      <Pin className="h-3 w-3 mr-1" />
                      {wish.isPinned ? "Lepas Pin" : "Sematkan"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenReply(wish)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      {wish.reply ? "Edit Balasan" : "Balas"}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingWish(wish)}
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Hapus Ucapan"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      <Dialog open={!!replyingWish} onOpenChange={(open) => !open && setReplyingWish(null)}>
        {replyingWish && (
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSaveReply}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold">
                  Balas Ucapan dari {replyingWish.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Balasan akan ditampilkan di bawah ucapan pada website undangan.
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 text-xs space-y-2">
                <div className="p-2.5 rounded-lg bg-muted/40 italic text-muted-foreground">
                  "{replyingWish.message}"
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-semibold text-foreground">
                    Teks Balasan Anda<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Textarea
                    required
                    placeholder="Terima kasih atas doa dan ucapannya..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="text-xs min-h-[80px]"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyingWish(null)}
                  className="text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="text-xs cursor-pointer">
                  Kirim Balasan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
      {/* Delete Wish Confirmation Modal */}
      <AlertDialog open={!!deletingWish} onOpenChange={(open) => !open && setDeletingWish(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Ucapan Tamu</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus ucapan dari{" "}
              <strong className="text-foreground font-semibold">"{deletingWish?.name}"</strong>?
              <br />
              Pesan ini akan dihapus dari buku tamu dan tidak akan ditampilkan lagi pada website undangan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="text-xs cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await handleDeleteWish();
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90 font-semibold cursor-pointer shadow-xs"
            >
              Hapus Ucapan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
