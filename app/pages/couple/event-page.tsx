import * as React from "react";
import { Save, Calendar, Sparkles, Quote, Loader2, Clock } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/contexts/auth-context";
import {
  parseAnyDateToISO,
  formatIndoDateFromISO,
  parseTimeRange,
  buildTimeRangeString,
  type TimezoneCode,
} from "~/lib/datetime";
import { toast } from "sonner";

export function CoupleEventPage() {
  const { currentCouple, updateCouple } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const [groomName, setGroomName] = React.useState(currentCouple?.groomName || "");
  const [groomParents, setGroomParents] = React.useState(currentCouple?.groomParents || "");
  const [groomInstagram, setGroomInstagram] = React.useState(currentCouple?.groomInstagram || "");

  const [brideName, setBrideName] = React.useState(currentCouple?.brideName || "");
  const [brideParents, setBrideParents] = React.useState(currentCouple?.brideParents || "");
  const [brideInstagram, setBrideInstagram] = React.useState(currentCouple?.brideInstagram || "");

  // Akad Date & Time Picker States
  const [akadDateISO, setAkadDateISO] = React.useState(() => parseAnyDateToISO(currentCouple?.akadDate));
  const [akadStartTime, setAkadStartTime] = React.useState(() => parseTimeRange(currentCouple?.akadTime).startTime);
  const [akadEndTime, setAkadEndTime] = React.useState(() => parseTimeRange(currentCouple?.akadTime).endTime);
  const [akadIsUntilEnd, setAkadIsUntilEnd] = React.useState(() => parseTimeRange(currentCouple?.akadTime).isUntilEnd);
  const [akadTimezone, setAkadTimezone] = React.useState<TimezoneCode>(() => parseTimeRange(currentCouple?.akadTime).timezone);
  const [akadVenue, setAkadVenue] = React.useState(currentCouple?.akadVenue || "");
  const [akadAddress, setAkadAddress] = React.useState(currentCouple?.akadAddress || "");
  const [akadMapsUrl, setAkadMapsUrl] = React.useState(currentCouple?.akadMapsUrl || "");

  // Resepsi Date & Time Picker States
  const [resepsiDateISO, setResepsiDateISO] = React.useState(() => parseAnyDateToISO(currentCouple?.resepsiDate));
  const [resepsiStartTime, setResepsiStartTime] = React.useState(() => parseTimeRange(currentCouple?.resepsiTime).startTime);
  const [resepsiEndTime, setResepsiEndTime] = React.useState(() => parseTimeRange(currentCouple?.resepsiTime).endTime);
  const [resepsiIsUntilEnd, setResepsiIsUntilEnd] = React.useState(() => parseTimeRange(currentCouple?.resepsiTime).isUntilEnd);
  const [resepsiTimezone, setResepsiTimezone] = React.useState<TimezoneCode>(() => parseTimeRange(currentCouple?.resepsiTime).timezone);
  const [resepsiVenue, setResepsiVenue] = React.useState(currentCouple?.resepsiVenue || "");
  const [resepsiAddress, setResepsiAddress] = React.useState(currentCouple?.resepsiAddress || "");
  const [resepsiMapsUrl, setResepsiMapsUrl] = React.useState(currentCouple?.resepsiMapsUrl || "");

  const [storyQuote, setStoryQuote] = React.useState(
    currentCouple?.storyQuote || "Two hearts, one journey, and a lifetime to cherish."
  );
  const [liveStreamUrl, setLiveStreamUrl] = React.useState(
    currentCouple?.liveStreamUrl || ""
  );

  React.useEffect(() => {
    if (currentCouple) {
      setGroomName(currentCouple.groomName || "");
      setGroomParents(currentCouple.groomParents || "");
      setGroomInstagram(currentCouple.groomInstagram || "");
      setBrideName(currentCouple.brideName || "");
      setBrideParents(currentCouple.brideParents || "");
      setBrideInstagram(currentCouple.brideInstagram || "");

      const parsedAkadTime = parseTimeRange(currentCouple.akadTime);
      const parsedResepsiTime = parseTimeRange(currentCouple.resepsiTime);

      setAkadDateISO(parseAnyDateToISO(currentCouple.akadDate) || "");
      setAkadStartTime(parsedAkadTime.startTime);
      setAkadEndTime(parsedAkadTime.endTime);
      setAkadIsUntilEnd(parsedAkadTime.isUntilEnd);
      setAkadTimezone(parsedAkadTime.timezone);
      setAkadVenue(currentCouple.akadVenue || "");
      setAkadAddress(currentCouple.akadAddress || "");
      setAkadMapsUrl(currentCouple.akadMapsUrl || "");

      setResepsiDateISO(parseAnyDateToISO(currentCouple.resepsiDate) || "");
      setResepsiStartTime(parsedResepsiTime.startTime);
      setResepsiEndTime(parsedResepsiTime.endTime);
      setResepsiIsUntilEnd(parsedResepsiTime.isUntilEnd);
      setResepsiTimezone(parsedResepsiTime.timezone);
      setResepsiVenue(currentCouple.resepsiVenue || "");
      setResepsiAddress(currentCouple.resepsiAddress || "");
      setResepsiMapsUrl(currentCouple.resepsiMapsUrl || "");

      setLiveStreamUrl(currentCouple.liveStreamUrl || "");
      setStoryQuote(currentCouple.storyQuote || "Two hearts, one journey, and a lifetime to cherish.");
    }
  }, [currentCouple]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCouple) return;

    const formattedAkadDate = formatIndoDateFromISO(akadDateISO);
    const formattedAkadTime = buildTimeRangeString(akadStartTime, akadEndTime, akadIsUntilEnd, akadTimezone);
    const formattedResepsiDate = formatIndoDateFromISO(resepsiDateISO);
    const formattedResepsiTime = buildTimeRangeString(resepsiStartTime, resepsiEndTime, resepsiIsUntilEnd, resepsiTimezone);

    setSaving(true);
    try {
      await updateCouple(currentCouple.slug, {
        groomName,
        groomParents,
        groomInstagram,
        brideName,
        brideParents,
        brideInstagram,
        weddingDate: akadDateISO || resepsiDateISO || currentCouple.weddingDate,
        akadDate: formattedAkadDate || akadDateISO,
        akadTime: formattedAkadTime,
        akadVenue,
        akadAddress,
        akadMapsUrl,
        resepsiDate: formattedResepsiDate || resepsiDateISO,
        resepsiTime: formattedResepsiTime,
        resepsiVenue,
        resepsiAddress,
        resepsiMapsUrl,
        liveStreamUrl,
        storyQuote,
      });

      toast.success("Informasi Mempelai & Acara Berhasil Disimpan!");
    } catch (err: any) {
      toast.error("Gagal menyimpan data", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!currentCouple) return null;

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Detail Mempelai & Acara"
        description="Lengkapi nama kedua mempelai, orang tua, serta jadwal akad dan resepsi pernikahan."
      />

      <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-5 w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Couple Names & Family Info */}
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            {/* Groom Card */}
            <Card className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Mempelai Pria (Groom)
                </CardTitle>
                <CardDescription className="text-xs">
                  Nama dan informasi keluarga pengantin pria.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">
                    Nama Lengkap<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="Contoh: Jim Halpert"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">Nama Orang Tua / Wali</label>
                  <Input
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    placeholder="Putra dari Bpk. Gerald Halpert & Ibu Betsy Halpert"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">Username Instagram (Opsional)</label>
                  <Input
                    value={groomInstagram}
                    onChange={(e) => setGroomInstagram(e.target.value)}
                    placeholder="@jimhalpert"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bride Card */}
            <Card className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Mempelai Wanita (Bride)
                </CardTitle>
                <CardDescription className="text-xs">
                  Nama dan informasi keluarga pengantin wanita.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">
                    Nama Lengkap<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="Contoh: Pam Beesly"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">Nama Orang Tua / Wali</label>
                  <Input
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    placeholder="Putri dari Bpk. William Beesly & Ibu Helene Beesly"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">Username Instagram (Opsional)</label>
                  <Input
                    value={brideInstagram}
                    onChange={(e) => setBrideInstagram(e.target.value)}
                    placeholder="@pambeesly"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Schedules */}
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            {/* Akad Card */}
            <Card className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Akad Nikah / Pemberkatan (Holy Matrimony)
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Atur tanggal dan waktu pelaksanaan akad nikah (Zona waktu Indonesia).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Date & Timezone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="font-medium text-foreground block">
                      Tanggal Akad<span className="text-destructive ml-0.5">*</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={akadDateISO}
                      onChange={(e) => setAkadDateISO(e.target.value)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-foreground block">
                      Zona Waktu
                    </label>
                    <select
                      value={akadTimezone}
                      onChange={(e) => setAkadTimezone(e.target.value as TimezoneCode)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="WIB">WIB (Indonesia Barat - GMT+7)</option>
                      <option value="WITA">WITA (Indonesia Tengah - GMT+8)</option>
                      <option value="WIT">WIT (Indonesia Timur - GMT+9)</option>
                    </select>
                  </div>
                </div>

                {/* Time Range */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-foreground block">
                      Waktu Pelaksanaan<span className="text-destructive ml-0.5">*</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-normal text-muted-foreground hover:text-foreground select-none">
                      <input
                        type="checkbox"
                        checked={akadIsUntilEnd}
                        onChange={(e) => setAkadIsUntilEnd(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>Sampai Selesai</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-muted-foreground mb-1 block">Jam Mulai</span>
                      <Input
                        type="time"
                        required
                        value={akadStartTime}
                        onChange={(e) => setAkadStartTime(e.target.value)}
                        className="cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground mb-1 block">Jam Selesai</span>
                      <Input
                        type="time"
                        disabled={akadIsUntilEnd}
                        value={akadIsUntilEnd ? "" : akadEndTime}
                        onChange={(e) => setAkadEndTime(e.target.value)}
                        placeholder="--:--"
                        className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Badge Box */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Format Undangan:
                  </span>
                  <Badge variant="outline" className="gap-1 font-mono font-normal bg-background">
                    <Calendar className="h-3 w-3 text-primary" />
                    {akadDateISO ? formatIndoDateFromISO(akadDateISO) : "Pilih tanggal"}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-mono font-normal bg-background">
                    <Clock className="h-3 w-3 text-primary" />
                    {buildTimeRangeString(akadStartTime, akadEndTime, akadIsUntilEnd, akadTimezone)}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">
                    Nama Tempat / Gedung<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={akadVenue}
                    onChange={(e) => setAkadVenue(e.target.value)}
                    placeholder="St. Augustine Chapel / Masjid Agung ..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">
                    Alamat Lengkap<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={akadAddress}
                    onChange={(e) => setAkadAddress(e.target.value)}
                    placeholder="Jl. Lembah Niagara No. 12, Bandung"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">Google Maps Link</label>
                  <Input
                    value={akadMapsUrl}
                    onChange={(e) => setAkadMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resepsi Card */}
            <Card className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Resepsi Pernikahan (Wedding Reception)
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Atur tanggal dan waktu perayaan resepsi (Zona waktu Indonesia).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Date & Timezone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="font-medium text-foreground block">
                      Tanggal Resepsi<span className="text-destructive ml-0.5">*</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={resepsiDateISO}
                      onChange={(e) => setResepsiDateISO(e.target.value)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-foreground block">
                      Zona Waktu
                    </label>
                    <select
                      value={resepsiTimezone}
                      onChange={(e) => setResepsiTimezone(e.target.value as TimezoneCode)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="WIB">WIB (Indonesia Barat - GMT+7)</option>
                      <option value="WITA">WITA (Indonesia Tengah - GMT+8)</option>
                      <option value="WIT">WIT (Indonesia Timur - GMT+9)</option>
                    </select>
                  </div>
                </div>

                {/* Time Range */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-foreground block">
                      Waktu Pelaksanaan<span className="text-destructive ml-0.5">*</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-normal text-muted-foreground hover:text-foreground select-none">
                      <input
                        type="checkbox"
                        checked={resepsiIsUntilEnd}
                        onChange={(e) => setResepsiIsUntilEnd(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>Sampai Selesai</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-muted-foreground mb-1 block">Jam Mulai</span>
                      <Input
                        type="time"
                        required
                        value={resepsiStartTime}
                        onChange={(e) => setResepsiStartTime(e.target.value)}
                        className="cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground mb-1 block">Jam Selesai</span>
                      <Input
                        type="time"
                        disabled={resepsiIsUntilEnd}
                        value={resepsiIsUntilEnd ? "" : resepsiEndTime}
                        onChange={(e) => setResepsiEndTime(e.target.value)}
                        placeholder="--:--"
                        className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Badge Box */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Format Undangan:
                  </span>
                  <Badge variant="outline" className="gap-1 font-mono font-normal bg-background">
                    <Calendar className="h-3 w-3 text-primary" />
                    {resepsiDateISO ? formatIndoDateFromISO(resepsiDateISO) : "Pilih tanggal"}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-mono font-normal bg-background">
                    <Clock className="h-3 w-3 text-primary" />
                    {buildTimeRangeString(resepsiStartTime, resepsiEndTime, resepsiIsUntilEnd, resepsiTimezone)}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">
                    Nama Tempat / Ballroom<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={resepsiVenue}
                    onChange={(e) => setResepsiVenue(e.target.value)}
                    placeholder="The Grand Ballroom Dunder ..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">
                    Alamat Lengkap<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={resepsiAddress}
                    onChange={(e) => setResepsiAddress(e.target.value)}
                    placeholder="Jl. Asia Afrika No. 88, Bandung"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground block">Google Maps Link</label>
                  <Input
                    value={resepsiMapsUrl}
                    onChange={(e) => setResepsiMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote & Live Stream */}
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Quote className="h-4 w-4 text-primary" />
                Kutipan Pernikahan & Live Streaming
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground block">Kutipan / Ayat Pernikahan (Quote di Website)</label>
                <Textarea
                  value={storyQuote}
                  onChange={(e) => setStoryQuote(e.target.value)}
                  placeholder="Two hearts, one journey, and a lifetime to cherish."
                  className="min-h-[70px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-foreground block">Link Video Live Streaming (YouTube / Zoom)</label>
                <Input
                  value={liveStreamUrl}
                  onChange={(e) => setLiveStreamUrl(e.target.value)}
                  placeholder="https://youtube.com/live/..."
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-1 pb-6">
            <Button type="submit" disabled={saving} size="default" className="gap-2 text-xs font-semibold rounded-md cursor-pointer px-6">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Acara</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

