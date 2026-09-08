import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Particles from "./Particles";
import { useAuth } from "~/contexts/auth-context";
import { getFileUrl } from "~/lib/api";
import { formatGuestName } from "~/lib/utils";
import { DEFAULT_TEMPLATE_COUPLE } from "~/lib/mock-data";

export function MiniPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opened, setOpened] = useState(false);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentCouple, couples } = useAuth();

  // Extract personalized guest name from query params (?to=...) or path params (/:slug/:guestName)
  const queryGuest = searchParams.get("to");
  let pathGuest = "";
  const pathParts = location.pathname.split("/").filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0] !== "dashboard" && pathParts[0] !== "login") {
    pathGuest = pathParts[1];
  }

  const rawGuestName = queryGuest || pathGuest;
  const formattedGuestName = formatGuestName(rawGuestName);

  const activeSlug = pathParts[0] || "template";
  const couple =
    activeSlug === "template"
      ? DEFAULT_TEMPLATE_COUPLE
      : couples.find((c) => c.slug.toLowerCase() === activeSlug.toLowerCase()) || currentCouple || DEFAULT_TEMPLATE_COUPLE;

  const groomFirst = couple?.groomName ? couple.groomName.split(" ")[0] : "Jim";
  const brideFirst = couple?.brideName ? couple.brideName.split(" ")[0] : "Pam";
  const coupleTitle = `${groomFirst} & ${brideFirst}`;

  const audioSrc = couple?.musicUrl ? getFileUrl(couple.musicUrl) : "/shape_of_my_heart.mp3";

  const handleOpen = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Audio autoplay blocked by browser policy:", err);
            setIsPlaying(false);
          });
      }
    }
    window.scrollTo(0, 0);
    setOpened(true);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Audio play error:", err));
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const val = opened ? "" : "hidden";
    document.documentElement.style.overflow = val;
    document.body.style.overflow = val;
  }, [opened]);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <AnimatePresence>
        {!opened && (
          <motion.div
            key="cover"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#FAFAF9] select-none"
          >
            <div className="absolute inset-0">
              <Particles
                particleCount={150}
                particleColors={["#C86D51", "#D97D54", "#E07A5F", "#EBB15B", "#C26749"]}
                particleSpread={10}
                speed={0.05}
                particleBaseSize={80}
                sizeRandomness={1.5}
                alphaParticles={true}
                moveParticlesOnHover={true}
                particleHoverFactor={1}
                disableRotation={true}
                cameraDistance={25}
                className=""
              />
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative z-10 font-['Instrument_Serif'] text-[#C86D51] text-xs sm:text-sm tracking-[0.45em] uppercase mb-3 sm:mb-4 font-medium"
            >
              The Wedding of
            </motion.p>

            {/* Couple Name */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="relative z-10 font-['Instrument_Serif'] text-[#281D19] text-5xl sm:text-6xl md:text-7xl lg:text-8xl italic text-center px-6 py-3 tracking-wide"
            >
              {coupleTitle}
            </motion.h1>

            {/* Personalized Guest Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="relative z-10 mt-8 sm:mt-10 md:mt-12 text-center max-w-md px-6 py-2"
            >
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C86D51] font-semibold mb-1.5">
                Kepada Yth. Bapak/Ibu/Saudara/i:
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-[#281D19] font-medium tracking-normal">
                {formattedGuestName || "Tamu Undangan"}
              </p>
            </motion.div>

            {/* Open Invitation Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="relative z-10 mt-8 sm:mt-10 rounded-full bg-[#C86D51] px-8 py-3 text-xs sm:text-sm font-medium text-white tracking-widest uppercase shadow-md transition-all duration-300 hover:bg-[#B85D42] cursor-pointer"
            >
              Open Invitation
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {opened && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
            onClick={toggle}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#281D19] border border-[#E7E5E4] shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
          >
            <motion.span
              key={isPlaying ? "pause" : "play"}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              )}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
