import * as React from "react";
import { Globe, MessageCircle, Save, Loader2 } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { api } from "~/lib/api";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const [waGatewayUrl, setWaGatewayUrl] = React.useState("https://api.fonnte.com/send");
  const [waApiKey, setWaApiKey] = React.useState("amora_wa_live_992182049182");
  const [allowRegistration, setAllowRegistration] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.admin.getSettings();
        if (res.success && res.data) {
          if (res.data.waGatewayUrl) setWaGatewayUrl(res.data.waGatewayUrl);
          if (res.data.waApiKey) setWaApiKey(res.data.waApiKey);
          if (res.data.allowRegistration !== undefined) setAllowRegistration(res.data.allowRegistration);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.admin.updateSettings({
        waGatewayUrl,
        waApiKey,
        allowRegistration,
      });
      if (res.success) {
        toast.success("Pengaturan Platform Berhasil Disimpan!");
      } else {
        toast.error("Gagal menyimpan pengaturan", { description: res.message });
      }
    } catch (err: any) {
      toast.error("Gagal menyimpan pengaturan", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Pengaturan Platform"
        description="Konfigurasi pendaftaran pasangan, integrasi WhatsApp Gateway, dan API sistem Amora."
      />

      <div className="p-4 sm:p-6 space-y-6 w-full max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Pendaftaran & Akses */}
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-5 pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Registrasi & Akses Publik
              </CardTitle>
              <CardDescription className="text-xs">
                Pengaturan hak akses dan pendaftaran akun baru pada platform Amora.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Izinkan Pendaftaran Pasangan Mandiri</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Jika aktif, calon pengantin dapat membuat akun dan undangan dari halaman depan.
                  </p>
                </div>
                <Switch
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Gateway */}
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-5 pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                WhatsApp Gateway API
              </CardTitle>
              <CardDescription className="text-xs">
                Koneksi gateway untuk pengiriman link undangan dan konfirmasi RSVP otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-medium text-foreground block">API Endpoint Gateway</label>
                <Input
                  value={waGatewayUrl}
                  onChange={(e) => setWaGatewayUrl(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-foreground block">API Token / Secret Key</label>
                <Input
                  type="password"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} size="default" className="gap-2 text-xs font-semibold rounded-md cursor-pointer px-6">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Semua Pengaturan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
