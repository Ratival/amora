import * as React from "react";
import {
  Plus,
  Trash2,
  Building,
  Loader2,
} from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { getFileUrl } from "~/lib/api";
import { useAuth } from "~/contexts/auth-context";
import type { BankAccount } from "~/types/dashboard";
import { toast } from "sonner";

export function CoupleGiftPage() {
  const { currentCouple, updateCouple } = useAuth();
  const [addBankOpen, setAddBankOpen] = React.useState(false);
  const [deletingBank, setDeletingBank] = React.useState<BankAccount | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // New Bank Form State
  const [bankName, setBankName] = React.useState("BCA");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountHolder, setAccountHolder] = React.useState("");
  const [qrisUrl, setQrisUrl] = React.useState("");

  const couple = currentCouple;
  const bankAccounts = couple?.bankAccounts || [];

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couple || !accountNumber || !accountHolder) return;

    setSubmitting(true);
    try {
      const newBank: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName,
        accountNumber,
        accountHolder,
        qrisUrl: bankName === "QRIS" ? qrisUrl : undefined,
      };

      await updateCouple(couple.slug, {
        bankAccounts: [...bankAccounts, newBank],
      });

      toast.success("Rekening Bank / QRIS Berhasil Ditambahkan!");
      setAccountNumber("");
      setAccountHolder("");
      setQrisUrl("");
      setAddBankOpen(false);
    } catch (err: any) {
      toast.error("Gagal menambahkan rekening", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBank = (bankId: string) => {
    if (!couple) return;
    updateCouple(couple.slug, {
      bankAccounts: bankAccounts.filter((b) => b.id !== bankId),
    });
    toast.success("Rekening berhasil dihapus");
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Hadiah & Amplop Digital (Wedding Gift)"
        description="Atur nomor rekening transfer, QRIS digital, atau alamat pengiriman kado fisik."
        actions={
          <Button
            size="sm"
            onClick={() => setAddBankOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Rekening / QRIS</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-5xl space-y-6">
        {/* Total Angpao Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-background border border-amber-500/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Amplop Terkumpul
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              Rp {(couple?.totalAngpao || 0).toLocaleString("id-ID")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total transfer hadiah dari para tamu via rekening & QRIS Anda.
            </p>
          </div>
        </div>

        {/* Bank Accounts Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {bankAccounts.map((bank) => (
            <Card key={bank.id} className="border-border/80 shadow-xs relative overflow-hidden flex flex-col">
              <div className="h-2 w-full bg-primary" />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold text-foreground">
                      {bank.bankName}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingBank(bank)}
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Hapus Rekening"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-1 flex-1 text-xs space-y-2">
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <p className="text-[10px] text-muted-foreground uppercase">Nomor Rekening</p>
                  <p className="font-mono font-bold text-sm text-foreground mt-0.5">
                    {bank.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Atas Nama</p>
                  <p className="font-semibold text-xs text-foreground mt-0.5">
                    {bank.accountHolder}
                  </p>
                </div>
                {bank.qrisUrl && (
                  <div className="pt-2">
                    <img
                      src={getFileUrl(bank.qrisUrl)}
                      alt="QRIS Code"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Bank Modal */}
      <Dialog open={addBankOpen} onOpenChange={setAddBankOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddBankAccount}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Tambah Rekening / QRIS</DialogTitle>
              <DialogDescription className="text-xs">
                Informasi rekening akan ditampilkan pada bagian Gift di undangan online.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 text-xs space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Pilihan Bank / E-Wallet<span className="text-destructive ml-0.5">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="BCA">Bank BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="QRIS">QRIS All Payment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nomor Rekening / No. HP<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: 5220891234"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Atas Nama (Account Holder)<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: Jim Halpert"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              {bankName === "QRIS" && (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">URL Gambar Barcode QRIS</label>
                  <Input
                    placeholder="https://.../qris.jpg"
                    value={qrisUrl}
                    onChange={(e) => setQrisUrl(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddBankOpen(false)}
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
                  "Simpan Rekening"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Bank Account Confirmation Modal */}
      <AlertDialog open={!!deletingBank} onOpenChange={(open) => !open && setDeletingBank(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Rekening / QRIS</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus rekening{" "}
              <strong className="text-foreground font-semibold">{deletingBank?.bankName} ({deletingBank?.accountNumber})</strong> atas nama {deletingBank?.accountHolder}?
              <br />
              Tamu tidak akan dapat melihat rekening ini lagi pada bagian hadiah undangan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="text-xs cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deletingBank) {
                  handleDeleteBank(deletingBank.id);
                  setDeletingBank(null);
                }
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90 font-semibold cursor-pointer shadow-xs"
            >
              Hapus Rekening
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
