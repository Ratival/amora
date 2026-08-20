import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Clock } from "lucide-react";

// Target Wedding Date: June 18, 2027 10:00:00
const WEDDING_DATE = new Date("2027-06-18T10:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft {
  const difference = +WEDDING_DATE - +new Date();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function EventDetails() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <section className="relative w-full bg-[#FAF5EE] py-28 md:py-36 px-6 overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C86D51]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto flex flex-col items-center">
        {/* Quote */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-['Instrument_Serif'] text-xl md:text-3xl italic text-center text-[#281D19]/70 max-w-2xl leading-relaxed mb-12"
        >
          Two hearts, one journey, and a lifetime to cherish.
        </motion.p>

        {/* Big Date Header */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-['Instrument_Serif'] text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-center text-[#281D19] tracking-tight mb-8 sm:mb-12 lowercase"
        >
          june 18, 2027
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
              {mounted ? timeLeft.days : 388}
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
              {mounted ? String(timeLeft.hours).padStart(2, "0") : "01"}
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
              {mounted ? String(timeLeft.minutes).padStart(2, "0") : "18"}
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
              {mounted ? String(timeLeft.seconds).padStart(2, "0") : "48"}
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] text-[#281D19]/40 uppercase font-sans mt-0.5">
              SECONDS
            </span>
          </div>
        </motion.div>

        {/* Event Cards (Holy Matrimony & Wedding Reception) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          {/* Holy Matrimony Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#FCF9F5] border border-[#EBE3D7] rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-medium text-[#C86D51] mb-3">
                Holy Matrimony
              </span>
              <p className="text-sm md:text-base text-[#281D19]/70 leading-relaxed mb-4 sm:mb-6 font-light">
                With great joy, we invite you to witness our Holy Matrimony on
              </p>
              <h3 className="font-['Instrument_Serif'] text-2xl sm:text-3xl md:text-4xl italic text-[#281D19] mb-4">
                Friday, June 18, 2027
              </h3>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#281D19]/80 border-t border-[#EBE3D7]/60">
                <div className="flex items-center gap-3 pt-3">
                  <Clock className="w-4 h-4 text-[#C86D51] shrink-0" />
                  <span>10:00 AM – 12:00 PM</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                  <span>St. Augustine Chapel, 142 Cathedral Way, NY</span>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() =>
                  addToGoogleCalendar(
                    "Holy Matrimony - Jim & Pam",
                    "Holy Matrimony ceremony for Jim & Pam",
                    "St. Augustine Chapel, 142 Cathedral Way, NY",
                    "20270618T100000Z",
                    "20270618T120000Z",
                  )
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#C86D51]/50 px-5 py-2.5 text-xs font-medium text-[#C86D51] hover:bg-[#C86D51] hover:text-[#FAF5EE] transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Add to Calendar
              </button>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#FAF5EE] border border-[#EBE3D7] px-5 py-2.5 text-xs font-medium text-[#281D19]/80 hover:text-[#281D19] hover:border-[#281D19]/40 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                View Location
              </a>
            </div>
          </motion.div>

          {/* Wedding Reception Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[#FCF9F5] border border-[#EBE3D7] rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-medium text-[#C86D51] mb-3">
                Wedding Reception
              </span>
              <p className="text-sm md:text-base text-[#281D19]/70 leading-relaxed mb-4 sm:mb-6 font-light">
                followed by an evening of celebration at our
              </p>
              <h3 className="font-['Instrument_Serif'] text-2xl sm:text-3xl md:text-4xl italic text-[#281D19] mb-4">
                Wedding Reception
              </h3>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#281D19]/80 border-t border-[#EBE3D7]/60">
                <div className="flex items-center gap-3 pt-3">
                  <Clock className="w-4 h-4 text-[#C86D51] shrink-0" />
                  <span>06:00 PM – Late</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                  <span>The Glasshouse Botanical Pavilion, NY</span>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() =>
                  addToGoogleCalendar(
                    "Wedding Reception - Jim & Pam",
                    "Wedding Reception celebration for Jim & Pam",
                    "The Glasshouse Botanical Pavilion, NY",
                    "20270618T180000Z",
                    "20270618T230000Z",
                  )
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#C86D51]/50 px-5 py-2.5 text-xs font-medium text-[#C86D51] hover:bg-[#C86D51] hover:text-[#FAF5EE] transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Add to Calendar
              </button>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#FAF5EE] border border-[#EBE3D7] px-5 py-2.5 text-xs font-medium text-[#281D19]/80 hover:text-[#281D19] hover:border-[#281D19]/40 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                View Location
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
