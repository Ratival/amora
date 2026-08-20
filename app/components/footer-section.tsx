import { motion } from "motion/react";
import { Heart } from "lucide-react";

const FOOTER_IMG =
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1800&h=1200&fit=crop";

export function FooterSection() {
  return (
    <footer className="relative w-full bg-[#FAF5EE] p-2 sm:p-3 md:p-4">
      {/* Inset cinematic container with exact equal top, bottom, left, and right padding */}
      <div className="relative w-full h-[calc(100vh-16px)] sm:h-[calc(100vh-24px)] md:h-[calc(100vh-32px)] min-h-[460px] sm:min-h-[520px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between items-center p-5 sm:p-8 md:p-14">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={FOOTER_IMG}
            alt="Jim & Pam"
            className="w-full h-full object-cover"
          />
          {/* Ambient overlays for warm contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/40" />
        </div>

        {/* Top spacer */}
        <div className="relative z-10" />

        {/* Centered Romantic Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 text-center max-w-4xl px-4"
        >
          <p className="font-['Instrument_Serif'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl italic text-[#FAF5EE] leading-tight drop-shadow-xl lowercase">
            you're my favorite person to do anything with for the rest of my life.
          </p>
        </motion.div>

        {/* Footer Signature & Details */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center gap-2 text-center"
        >
          <div className="flex items-center gap-2 font-['Instrument_Serif'] text-lg sm:text-xl italic text-[#FAF5EE]/90">
            <span>Jim</span>
            <Heart className="w-3.5 h-3.5 fill-[#C86D51] text-[#C86D51]" />
            <span>Pam</span>
            <span className="opacity-40">·</span>
            <span className="text-xs uppercase tracking-[0.25em] font-sans font-medium text-[#FAF5EE]/70">
              June 18, 2027
            </span>
          </div>

          <p className="text-[11px] text-[#FAF5EE]/50 tracking-wider">
            With love, thank you for being part of our story.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
