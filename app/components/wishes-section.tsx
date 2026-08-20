import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Heart, CheckCircle2, MessageSquareHeart } from "lucide-react";

interface Wish {
  id: string;
  name: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  message: string;
  time: string;
}

const INITIAL_WISHES: Wish[] = [
  {
    id: "1",
    name: "Michael & Sarah",
    attendance: "hadir",
    message:
      "Selamat menempuh hidup baru untuk Jim & Pam! Semoga cinta dan kebahagiaan senantiasa menyertai perjalanan keluarga kalian berdua sampai maut memisahkan. Aamiin.",
    time: "10 menit yang lalu",
  },
  {
    id: "2",
    name: "Dwight Schrute",
    attendance: "hadir",
    message:
      "Selamat untuk kalian berdua! Semoga pernikahan ini selalu dipenuhi dengan berkat, kehangatan, serta cinta kasih yang tak pernah pudar.",
    time: "1 jam yang lalu",
  },
  {
    id: "3",
    name: "Angela & Kevin",
    attendance: "hadir",
    message:
      "Happy wedding Jim and Pam! Wishing you a lifetime of love, laughter, and endless shared adventures. See you at the reception!",
    time: "3 jam yang lalu",
  },
  {
    id: "4",
    name: "Stanley Hudson",
    attendance: "tidak_hadir",
    message:
      "Selamat berbahagia! Mohon maaf belum bisa hadir langsung, namun doa terbaik kami panjatkan untuk kebahagiaan kalian berdua.",
    time: "5 jam yang lalu",
  },
];

export function WishesSection() {
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newWish: Wish = {
      id: Date.now().toString(),
      name: name.trim(),
      attendance,
      message: message.trim(),
      time: "Baru saja",
    };

    setWishes([newWish, ...wishes]);
    setName("");
    setMessage("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <section className="relative w-full bg-[#FAF5EE] pt-24 sm:pt-32 pb-16 sm:pb-20 px-6 overflow-hidden">
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
            doa & ucapan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm md:text-base text-[#281D19]/60 max-w-md mx-auto"
          >
            Kirimkan doa dan ucapan hangat untuk mengiringi langkah baru pernikahan kami.
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
            className="lg:col-span-5 bg-[#FCF9F5] border border-[#EBE3D7] rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-6 text-[#281D19]">
              <MessageSquareHeart className="w-5 h-5 text-[#C86D51]" />
              <h3 className="font-semibold text-base text-[#281D19]">Tulis Doa & Ucapan</h3>
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
                  className="w-full bg-[#FAF5EE] border border-[#EBE3D7] rounded-xl px-4 py-3 text-sm text-[#281D19] placeholder:text-[#281D19]/35 focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51] transition-all"
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
                        ? "bg-[#C86D51] text-[#FAF5EE] border-[#C86D51] shadow-xs"
                        : "bg-[#FAF5EE] text-[#281D19]/70 border-[#EBE3D7] hover:border-[#281D19]/30"
                    }`}
                  >
                    Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance("tidak_hadir")}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all cursor-pointer ${
                      attendance === "tidak_hadir"
                        ? "bg-[#C86D51] text-[#FAF5EE] border-[#C86D51] shadow-xs"
                        : "bg-[#FAF5EE] text-[#281D19]/70 border-[#EBE3D7] hover:border-[#281D19]/30"
                    }`}
                  >
                    Berhalangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance("ragu")}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all cursor-pointer ${
                      attendance === "ragu"
                        ? "bg-[#C86D51] text-[#FAF5EE] border-[#C86D51] shadow-xs"
                        : "bg-[#FAF5EE] text-[#281D19]/70 border-[#EBE3D7] hover:border-[#281D19]/30"
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
                  className="w-full bg-[#FAF5EE] border border-[#EBE3D7] rounded-xl p-4 text-sm text-[#281D19] placeholder:text-[#281D19]/35 focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51] transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#C86D51] hover:bg-[#B85D42] text-[#FAF5EE] font-medium text-sm py-3 px-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Kirim Ucapan
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
                    <span>Terima kasih! Doa dan ucapan Anda telah berhasil terkirim.</span>
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
            className="lg:col-span-7 bg-[#FCF9F5] border border-[#EBE3D7] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EBE3D7]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C86D51]" />
                <span className="font-semibold text-sm text-[#281D19]">Doa & Ucapan Masuk</span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EBE3D7] text-[#281D19]/70 font-medium">
                {wishes.length} Pesan
              </span>
            </div>

            {/* Scrollable feed */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-wishes-scroll">
              <AnimatePresence initial={false}>
                {wishes.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#FAF5EE] border border-[#EBE3D7]/70 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C86D51]/15 text-[#C86D51] flex items-center justify-center font-medium text-xs">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[#281D19]">{item.name}</h4>
                          <span className="text-[11px] text-[#281D19]/40">{item.time}</span>
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
