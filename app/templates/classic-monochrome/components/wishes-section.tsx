import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Send, Heart, CheckCircle2, MessageSquareHeart, Loader2 } from "lucide-react";
import { useAuth } from "~/contexts/auth-context";
import { api } from "~/lib/api";
import { formatGuestName } from "~/lib/utils";
import { toast } from "sonner";
import type { CoupleProject } from "~/types/dashboard";

interface Wish {
  id: string;
  name: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  message: string;
  reply?: string;
  replyAuthor?: string;
  time: string;
}

export function WishesSection({
  couple: propCouple,
  guestName,
  isTemplatePreview,
}: {
  couple?: CoupleProject | null;
  guestName?: string;
  isTemplatePreview?: boolean;
}) {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { currentCouple: contextCouple } = useAuth();

  // Authoritative couple slug resolution from props, route params, or context
  const effectiveSlug =
    propCouple?.slug ||
    (routeSlug && routeSlug !== "dashboard" ? routeSlug : null) ||
    contextCouple?.slug ||
    "template";

  const formattedInitialName = formatGuestName(guestName);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState(formattedInitialName);
  const [attendance, setAttendance] = useState<
    "hadir" | "tidak_hadir" | "ragu"
  >("hadir");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (guestName) {
      setName(formatGuestName(guestName));
    }
  }, [guestName]);

  const fetchWishes = useCallback(async () => {
    if (!effectiveSlug) return;

    try {
      const res = await api.public.getWishes(effectiveSlug);
      if (res.success && Array.isArray(res.data)) {
        const fromServer: Wish[] = res.data.map((w: any) => ({
          id: w.id,
          name: w.guestName,
          message: w.message,
          attendance: w.attendingStatus?.toLowerCase().includes("tidak")
            ? "tidak_hadir"
            : w.attendingStatus?.toLowerCase().includes("ragu")
            ? "ragu"
            : "hadir",
          reply: w.replies?.[0]?.message || w.reply || "",
          replyAuthor: w.replies?.[0]?.author || "",
          time: w.createdAt
            ? new Date(w.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Baru saja",
        }));

        setWishes(fromServer);
      }
    } catch (err) {
      console.error("Failed to load wishes:", err);
    }
  }, [effectiveSlug]);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const attendingStr =
      attendance === "hadir"
        ? "Hadir"
        : attendance === "tidak_hadir"
        ? "Tidak Hadir"
        : "Ragu-ragu";

    try {
      const res = await api.public.submitWish(effectiveSlug, {
        guestName: name.trim(),
        message: message.trim(),
        attendingStatus: attendingStr,
        relationship: "Tamu Undangan",
      });

      if (res.success && res.data) {
        const created = res.data;
        const newWish: Wish = {
          id: created.id || `wish-${Date.now()}`,
          name: created.guestName || name.trim(),
          attendance,
          message: created.message || message.trim(),
          reply: created.replies?.[0]?.message || created.reply || "",
          time: "Baru saja",
        };
        setWishes((prev) => [newWish, ...prev]);
        setName(formattedInitialName || "");
        setMessage("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3500);
      } else {
        toast.error(res.message || "Gagal mengirimkan ucapan ke server.");
      }
    } catch (err) {
      console.error("Failed to submit wish to backend:", err);
      toast.error("Gagal terhubung ke backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groomFirst = propCouple?.groomName
    ? propCouple.groomName.split(" ")[0]
    : contextCouple?.groomName
    ? contextCouple.groomName.split(" ")[0]
    : "";
  const brideFirst = propCouple?.brideName
    ? propCouple.brideName.split(" ")[0]
    : contextCouple?.brideName
    ? contextCouple.brideName.split(" ")[0]
    : "";
  const coupleDisplayName =
    groomFirst && brideFirst
      ? `${groomFirst} & ${brideFirst}`
      : propCouple?.groomName && propCouple?.brideName
      ? `${propCouple.groomName} & ${propCouple.brideName}`
      : contextCouple?.groomName && contextCouple?.brideName
      ? `${contextCouple.groomName} & ${contextCouple.brideName}`
      : "Mempelai";

  return (
    <section className="relative w-full bg-[#FAFAF9] pt-24 sm:pt-32 pb-16 sm:pb-20 px-6 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-[#C86D51]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.35em] text-[#C86D51] font-medium mb-3"
          >
            Wishes & Blessings
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-['Instrument_Serif'] text-5xl sm:text-7xl md:text-8xl italic text-[#281D19] tracking-tight mb-4"
          >
            Doa & Ucapan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm md:text-base text-[#281D19]/60 max-w-md mx-auto"
          >
            Kirimkan doa dan ucapan hangat untuk mengiringi langkah baru
            pernikahan kami.
          </motion.p>
        </div>

        {/* 2-Column Form & Wishes List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-6 text-[#281D19]">
              <MessageSquareHeart className="w-5 h-5 text-[#C86D51]" />
              <h3 className="font-semibold text-base text-[#281D19]">
                Tulis Doa & Ucapan
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Field */}
              <div>
                <label className="block text-xs font-medium text-[#281D19]/70 mb-1.5 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Alexander & Keluarga"
                  className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl px-4 py-3 text-sm text-[#281D19] placeholder:text-[#281D19]/35 focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51] transition-all"
                />
              </div>

              {/* Kehadiran Field */}
              <div>
                <label className="block text-xs font-medium text-[#281D19]/70 mb-1.5 uppercase tracking-wider">
                  Konfirmasi Kehadiran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendance("hadir")}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all cursor-pointer ${
                      attendance === "hadir"
                        ? "bg-[#C86D51] text-white border-[#C86D51] shadow-xs"
                        : "bg-[#FAFAF9] text-[#281D19]/70 border-[#E7E5E4] hover:border-[#281D19]/30"
                    }`}
                  >
                    Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance("tidak_hadir")}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all cursor-pointer ${
                      attendance === "tidak_hadir"
                        ? "bg-[#C86D51] text-white border-[#C86D51] shadow-xs"
                        : "bg-[#FAFAF9] text-[#281D19]/70 border-[#E7E5E4] hover:border-[#281D19]/30"
                    }`}
                  >
                    Berhalangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance("ragu")}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all cursor-pointer ${
                      attendance === "ragu"
                        ? "bg-[#C86D51] text-white border-[#C86D51] shadow-xs"
                        : "bg-[#FAFAF9] text-[#281D19]/70 border-[#E7E5E4] hover:border-[#281D19]/30"
                    }`}
                  >
                    Ragu-ragu
                  </button>
                </div>
              </div>

              {/* Ucapan Field */}
              <div>
                <label className="block text-xs font-medium text-[#281D19]/70 mb-1.5 uppercase tracking-wider">
                  Doa & Ucapan
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan dan doa terbaik Anda di sini..."
                  className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-4 text-sm text-[#281D19] placeholder:text-[#281D19]/35 focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51] transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#C86D51] hover:bg-[#B85D42] text-white font-medium text-sm py-3 px-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirimkan Ucapan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Ucapan</span>
                  </>
                )}
              </button>

              {/* Success alert */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 bg-[#EAF3EA] text-[#2B612E] p-3 rounded-xl text-xs font-medium border border-[#CDE3CD]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2B612E] shrink-0" />
                    <span>
                      Terima kasih! Doa dan ucapan Anda telah berhasil terkirim.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Wishes List (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7 bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C86D51]" />
                <span className="font-semibold text-sm text-[#281D19]">
                  Doa & Ucapan Masuk
                </span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] text-[#281D19]/70 font-medium">
                {wishes.length} Pesan
              </span>
            </div>

            {/* Scrollable feed */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-wishes-scroll">
              {wishes.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#281D19]/45 italic">
                  Belum ada ucapan & doa restu yang masuk. Jadilah yang pertama mengirimkan ucapan!
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {wishes.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C86D51]/15 text-[#C86D51] flex items-center justify-center font-medium text-xs">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[#281D19]">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-[#281D19]/40">
                            {item.time}
                          </span>
                        </div>
                      </div>

                      {/* Attendance Badge */}
                      <span
                        className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                          item.attendance === "hadir"
                            ? "bg-[#EAF3EA] text-[#2B612E]"
                            : item.attendance === "tidak_hadir"
                              ? "bg-[#F7EBEB] text-[#9E3636]"
                              : "bg-[#FFF6E5] text-[#8C651A]"
                        }`}
                      >
                        {item.attendance === "hadir"
                          ? "Hadir"
                          : item.attendance === "tidak_hadir"
                            ? "Berhalangan"
                            : "Ragu"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#281D19]/80 leading-relaxed font-light pl-0 sm:pl-12 pt-1 sm:pt-0">
                      {item.message}
                    </p>

                    {item.reply && (
                      <div className="mt-3 ml-0 sm:ml-12 p-3 rounded-xl bg-white border border-[#E7E5E4] text-xs shadow-2xs">
                        <p className="font-semibold text-[11px] text-[#C86D51] mb-1">
                          Balasan dari {item.replyAuthor || coupleDisplayName}:
                        </p>
                        <p className="text-[#281D19]/80 italic font-light">{item.reply}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

