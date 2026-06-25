import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Particles from "./Particles";

export function MiniPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    window.scrollTo(0, 0);
    setOpened(true);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
  }, [opened]);

  return (
    <>
      <audio ref={audioRef} src="/shape_of_my_heart.mp3" loop />

      <AnimatePresence>
        {!opened && (
          <motion.div
            key="cover"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#1A1816]"
          >
            <div className="absolute inset-0">
              <Particles
                particleCount={150}
                particleColors={["#C8A96B", "#E8D5A3", "#FFFFFF"]}
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
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative z-10 font-['Instrument_Serif'] text-[#C8A96B]/80 text-xs tracking-[0.4em] uppercase mb-6"
            >
              The Wedding of
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="relative z-10 font-['Instrument_Serif'] text-white text-5xl md:text-7xl italic"
            >
              Jim & Pam
            </motion.h1>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="relative z-10 mt-12 rounded-full border border-[#C8A96B] px-8 py-3 text-sm font-medium text-[#C8A96B] tracking-wider uppercase transition-colors hover:bg-[#C8A96B] hover:text-[#1A1816]"
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
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm"
          >
            <motion.span
              key={isPlaying ? "pause" : "play"}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
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
