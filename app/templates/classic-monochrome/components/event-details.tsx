import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Clock, Video } from "lucide-react";
import { useAuth } from "~/contexts/auth-context";
import type { CoupleProject } from "~/types/dashboard";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}


const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatWeddingDate(rawDate?: string): string {
  if (!rawDate) return "18 June 2027";
  const trimmed = rawDate.trim();

  // 1. Check YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthName = MONTH_NAMES[monthIdx] || "January";
    return `${dayStr} ${monthName} ${year}`;
  }

  // 2. Check Indonesian month names in freeform strings
  const indonesianMonths: Record<string, string> = {
    januari: "January",
    februari: "February",
    maret: "March",
    april: "April",
    mei: "May",
    juni: "June",
    juli: "July",
    agustus: "August",
    september: "September",
    oktober: "October",
    november: "November",
    desember: "December",
  };

  const matchParts = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (matchParts) {
    const day = parseInt(matchParts[1], 10);
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const rawMonth = matchParts[2].toLowerCase();
    const monthName = indonesianMonths[rawMonth] || (rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1));
    const year = matchParts[3];
    return `${dayStr} ${monthName} ${year}`;
  }

  // 3. Try standard Date
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const day = parsed.getDate();
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthName = MONTH_NAMES[parsed.getMonth()];
    const year = parsed.getFullYear();
    return `${dayStr} ${monthName} ${year}`;
  }

  return trimmed;
}

function parseWeddingTargetDate(weddingDate?: string, akadDate?: string, akadTime?: string): Date {
  const parseISO = (val: string, timeStr?: string) => {
    const match = val.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      let hour = 10;
      let minute = 0;
      if (timeStr) {
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          hour = parseInt(timeMatch[1], 10);
          minute = parseInt(timeMatch[2], 10);
        }
      }
      return new Date(year, month, day, hour, minute, 0);
    }
    return null;
  };

  // 1. Try weddingDate (usually ISO YYYY-MM-DD)
  if (weddingDate) {
    const d = parseISO(weddingDate, akadTime);
    if (d && !isNaN(d.getTime())) return d;
  }

  // 2. Try akadDate if ISO
  if (akadDate) {
    const d = parseISO(akadDate, akadTime);
    if (d && !isNaN(d.getTime())) return d;
  }

  // 3. Try text-based date from akadDate or weddingDate (e.g. "Sabtu, 24 Oktober 2026")
  const dateCandidates = [akadDate, weddingDate].filter(Boolean) as string[];
  const monthIndexMap: Record<string, number> = {
    januari: 0,
    january: 0,
    februari: 1,
    february: 1,
    maret: 2,
    march: 2,
    april: 3,
    mei: 4,
    may: 4,
    juni: 5,
    june: 5,
    juli: 6,
    july: 6,
    agustus: 7,
    august: 7,
    september: 8,
    oktober: 9,
    october: 9,
    november: 10,
    desember: 11,
    december: 11,
  };

  for (const cand of dateCandidates) {
    const match = cand.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2].toLowerCase();
      const monthIdx = monthIndexMap[monthStr] ?? 5;
      const year = parseInt(match[3], 10);
      let hour = 10;
      let minute = 0;
      if (akadTime) {
        const timeMatch = akadTime.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          hour = parseInt(timeMatch[1], 10);
          minute = parseInt(timeMatch[2], 10);
        }
      }
      const d = new Date(year, monthIdx, day, hour, minute, 0);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 4. Try new Date() directly
  if (weddingDate && !isNaN(Date.parse(weddingDate))) {
    return new Date(weddingDate);
  }

  return new Date("2027-06-18T10:00:00");
}

export function EventDetails({ couple: propCouple }: { couple?: CoupleProject | null }) {
  const { currentCouple: contextCouple } = useAuth();
  const couple = propCouple || contextCouple;

  const targetDate = parseWeddingTargetDate(
    couple?.weddingDate,
    couple?.akadDate,
    couple?.akadTime
  );

  const calculateTimeLeft = (): TimeLeft => {
    const difference = +targetDate - +new Date();
    if (difference <= 0 || isNaN(difference)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [couple?.weddingDate, couple?.akadDate, couple?.akadTime]);

  const addToGoogleCalendar = (
    title: string,
    details: string,
    location: string,
    startDate: string,
    endDate: string,
  ) => {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title,
    )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
      location,
    )}&dates=${startDate}/${endDate}`;
    window.open(url, "_blank");
  };

  const displayDate = formatWeddingDate(couple?.weddingDate || couple?.akadDate);

  return (
    <section className="relative w-full bg-[#FAFAF9] py-28 md:py-36 px-6 overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C86D51]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto flex flex-col items-center">
        {/* Quote */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-['Instrument_Serif'] text-xl md:text-3xl italic text-center text-[#281D19]/75 max-w-2xl leading-relaxed mb-12"
        >
          {couple?.storyQuote || "Two hearts, one journey, and a lifetime to cherish."}
        </motion.p>

        {/* Big Date Header */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-['Instrument_Serif'] text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-center text-[#281D19] tracking-tight mb-8 sm:mb-12"
        >
          {displayDate}
        </motion.h2>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-2 sm:gap-5 md:gap-8 mb-16 sm:mb-24 w-full max-w-xl px-2"
        >
          {/* Days */}
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
            <span className="font-['Instrument_Serif'] text-3xl sm:text-5xl md:text-6xl text-[#281D19]">
              {mounted ? timeLeft.days : 48}
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] text-[#281D19]/40 uppercase font-sans mt-0.5">
              DAYS
            </span>
          </div>

          <span className="font-['Instrument_Serif'] text-xl sm:text-3xl md:text-5xl text-[#281D19]/30 -translate-y-1 sm:-translate-y-2">
            :
          </span>

          {/* Hours */}
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
            <span className="font-['Instrument_Serif'] text-3xl sm:text-5xl md:text-6xl text-[#281D19]">
              {mounted ? String(timeLeft.hours).padStart(2, "0") : "00"}
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] text-[#281D19]/40 uppercase font-sans mt-0.5">
              HOURS
            </span>
          </div>

          <span className="font-['Instrument_Serif'] text-xl sm:text-3xl md:text-5xl text-[#281D19]/30 -translate-y-1 sm:-translate-y-2">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
            <span className="font-['Instrument_Serif'] text-3xl sm:text-5xl md:text-6xl text-[#281D19]">
              {mounted ? String(timeLeft.minutes).padStart(2, "0") : "00"}
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] text-[#281D19]/40 uppercase font-sans mt-0.5">
              MINUTES
            </span>
          </div>

          <span className="font-['Instrument_Serif'] text-xl sm:text-3xl md:text-5xl text-[#281D19]/30 -translate-y-1 sm:-translate-y-2">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
            <span className="font-['Instrument_Serif'] text-3xl sm:text-5xl md:text-6xl text-[#281D19]">
              {mounted ? String(timeLeft.seconds).padStart(2, "0") : "00"}
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] text-[#281D19]/40 uppercase font-sans mt-0.5">
              SECONDS
            </span>
          </div>
        </motion.div>

        {/* Live Stream Banner (if configured) */}
        {couple?.liveStreamUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-xs"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="h-10 w-10 rounded-full bg-[#C86D51]/10 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-[#C86D51]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#281D19]">Live Streaming Tersedia</h4>
                <p className="text-xs text-[#281D19]/60">Saksikan siaran langsung pernikahan kami secara daring</p>
              </div>
            </div>
            <a
              href={
                couple.liveStreamUrl.startsWith("http://") || couple.liveStreamUrl.startsWith("https://")
                  ? couple.liveStreamUrl
                  : `https://${couple.liveStreamUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#C86D51] text-white px-5 py-2 text-xs font-medium hover:bg-[#b55c42] transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Video className="w-3.5 h-3.5" />
              Tonton Live
            </a>
          </motion.div>
        )}

        {/* Event Cards (Holy Matrimony & Wedding Reception) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          {/* Holy Matrimony Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-medium text-[#C86D51] mb-3">
                Akad & Holy Matrimony
              </span>
              <p className="text-sm md:text-base text-[#281D19]/70 leading-relaxed mb-4 sm:mb-6 font-light">
                Dengan penuh rasa syukur, kami mengundang Anda untuk menyaksikan momen sakral pernikahan kami:
              </p>
              <h3 className="font-['Instrument_Serif'] text-2xl sm:text-3xl md:text-4xl italic text-[#281D19] mb-4">
                {couple?.akadDate || "Friday, June 18, 2027"}
              </h3>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#281D19]/80 border-t border-[#E7E5E4]">
                <div className="flex items-center gap-3 pt-3">
                  <Clock className="w-4 h-4 text-[#C86D51] shrink-0" />
                  <span>{couple?.akadTime || "10:00 AM – 12:00 PM"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{couple?.akadVenue || "St. Augustine Chapel"}</div>
                    <div className="text-[#281D19]/60">{couple?.akadAddress || "142 Cathedral Way, NY"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() =>
                  addToGoogleCalendar(
                    `Akad Nikah - ${couple ? `${couple.groomName.split(" ")[0]} & ${couple.brideName.split(" ")[0]}` : "Jim & Pam"}`,
                    "Holy Matrimony & Akad ceremony",
                    couple?.akadAddress || "St. Augustine Chapel, 142 Cathedral Way, NY",
                    "20270618T100000Z",
                    "20270618T120000Z",
                  )
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#C86D51]/50 px-5 py-2.5 text-xs font-medium text-[#C86D51] hover:bg-[#C86D51] hover:text-white transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Add to Calendar
              </button>
              {couple?.akadMapsUrl ? (
                <a
                  href={couple.akadMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] px-5 py-2.5 text-xs font-medium text-[#281D19]/80 hover:text-[#281D19] hover:border-[#281D19]/40 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Buka Maps
                </a>
              ) : (
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] px-5 py-2.5 text-xs font-medium text-[#281D19]/80 hover:text-[#281D19] hover:border-[#281D19]/40 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Buka Maps
                </a>
              )}
            </div>
          </motion.div>

          {/* Wedding Reception Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-medium text-[#C86D51] mb-3">
                Resepsi Pernikahan
              </span>
              <p className="text-sm md:text-base text-[#281D19]/70 leading-relaxed mb-4 sm:mb-6 font-light">
                Dilanjutkan dengan perayaan resepsi kebahagiaan kami:
              </p>
              <h3 className="font-['Instrument_Serif'] text-2xl sm:text-3xl md:text-4xl italic text-[#281D19] mb-4">
                {couple?.resepsiDate || "Friday, June 18, 2027"}
              </h3>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#281D19]/80 border-t border-[#E7E5E4]">
                <div className="flex items-center gap-3 pt-3">
                  <Clock className="w-4 h-4 text-[#C86D51] shrink-0" />
                  <span>{couple?.resepsiTime || "06:00 PM – Selesai"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{couple?.resepsiVenue || "The Glasshouse Botanical Pavilion"}</div>
                    <div className="text-[#281D19]/60">{couple?.resepsiAddress || "NY Botanical Way, New York"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() =>
                  addToGoogleCalendar(
                    `Resepsi Nikah - ${couple ? `${couple.groomName.split(" ")[0]} & ${couple.brideName.split(" ")[0]}` : "Jim & Pam"}`,
                    "Wedding Reception celebration",
                    couple?.resepsiAddress || "The Glasshouse Botanical Pavilion, NY",
                    "20270618T180000Z",
                    "20270618T230000Z",
                  )
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#C86D51]/50 px-5 py-2.5 text-xs font-medium text-[#C86D51] hover:bg-[#C86D51] hover:text-white transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Add to Calendar
              </button>
              {couple?.resepsiMapsUrl ? (
                <a
                  href={couple.resepsiMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] px-5 py-2.5 text-xs font-medium text-[#281D19]/80 hover:text-[#281D19] hover:border-[#281D19]/40 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Buka Maps
                </a>
              ) : (
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] px-5 py-2.5 text-xs font-medium text-[#281D19]/80 hover:text-[#281D19] hover:border-[#281D19]/40 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Buka Maps
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

