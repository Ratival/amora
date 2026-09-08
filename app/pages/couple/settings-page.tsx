import * as React from "react";
import { Lock, QrCode, Globe, Save, Loader2 } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { useAuth } from "~/contexts/auth-context";
import { toast } from "sonner";

export function CoupleSettingsPage() {
  const { currentCouple, updateCouple } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const [slug, setSlug] = React.useState(currentCouple?.slug || "");
  const [rsvpDeadline, setRsvpDeadline] = React.useState(currentCouple?.rsvpDeadline || "");
  const [isPasswordProtected, setIsPasswordProtected] = React.useState<boolean>(
    currentCouple?.isPasswordProtected ?? false
  );
  const [password, setPassword] = React.useState<string>(currentCouple?.password || "");
  const [qrCheckInEnabled, setQrCheckInEnabled] = React.useState<boolean>(
    currentCouple?.qrCheckInEnabled ?? true
  );
  const [status, setStatus] = React.useState<"published" | "draft">(
    currentCouple?.status === "draft" ? "draft" : "published"
  );

  React.useEffect(() => {
    if (currentCouple) {
      setSlug(currentCouple.slug || "");
      setRsvpDeadline(currentCouple.rsvpDeadline || "");
      setIsPasswordProtected(currentCouple.isPasswordProtected ?? false);
      setPassword(currentCouple.password || "");
      setQrCheckInEnabled(currentCouple.qrCheckInEnabled ?? true);
      setStatus(currentCouple.status === "draft" ? "draft" : "published");
    }
  }, [currentCouple]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCouple) return;

    setSaving(true);
    try {
      await updateCouple(currentCouple.slug, {
        slug,
        rsvpDeadline,
        isPasswordProtected,
        password,
        qrCheckInEnabled,
        status,
      });

      toast.success("Pengaturan Undangan Berhasil Disimpan!");
    } catch (err: any) {
      toast.error("Gagal menyimpan pengaturan", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!currentCouple) return null;

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Pengaturan Undangan"
        description="Konfigurasi privasi, deadline RSVP, dan status publikasi website."
      />

      <div className="p-4 sm:p-6 space-y-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL & Status */}
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-5 pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                URL Undangan & Status Publikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-medium text-foreground block">Slug URL Khusus</label>
                <div className="flex items-center">
                  <span className="bg-muted px-3 h-9 flex items-center text-muted-foreground border border-r-0 border-border rounded-l-md text-xs font-mono">
                    domain.com/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="rounded-l-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div>
                  <p className="font-medium text-foreground">Status Website Live (Publikasi)</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Jika dinonaktifkan, pengunjung akan melihat halaman "Under Maintenance".
                  </p>
                </div>
                <Switch
                  checked={status === "published"}
                  onCheckedChange={(checked) => setStatus(checked ? "published" : "draft")}
                />
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60">
                <label className="font-medium text-foreground block">Batas Waktu Pengisian RSVP (Deadline)</label>
                <Input
                  type="date"
                  value={rsvpDeadline}
                  onChange={(e) => setRsvpDeadline(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Password */}
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-5 pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Keamanan & Proteksi Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Kunci Undangan dengan Password (Private)</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Hanya tamu yang memiliki kode akses yang dapat membuka isi undangan.
                  </p>
                </div>
                <Switch
                  checked={isPasswordProtected}
                  onCheckedChange={setIsPasswordProtected}
                />
              </div>

              {isPasswordProtected && (
                <div className="space-y-2 pt-3 border-t border-border/60">
                  <label className="font-medium text-foreground block">Password Akses</label>
                  <Input
                    type="text"
                    placeholder="Contoh: jimdanpam2026"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Check-in */}
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-5 pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                Sistem Check-in QR Code di Venue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Aktifkan QR Code di Undangan Tamu</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Petugas penerima tamu di venue dapat memindai QR Code untuk menandai kehadiran instan.
                  </p>
                </div>
                <Switch
                  checked={qrCheckInEnabled}
                  onCheckedChange={setQrCheckInEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2 pb-6">
            <Button type="submit" disabled={saving} size="default" className="gap-2 text-xs font-semibold rounded-md cursor-pointer px-6">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
