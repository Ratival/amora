import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoryImage {
  id: number;
  image: string;
  caption: string;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  startPhoto: number;
  endPhoto: number;
  side: "left" | "right";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Chapter One",
    description:
      "In the most unplanned, the-universe-has-a-sense-of-humor way — paths crossed, moments collided, and somehow it felt like the universe had been waiting for this moment all along.",
    startPhoto: 1,
    endPhoto: 3,
    side: "left",
  },
  {
    id: 2,
    title: "Chapter Two",
    description:
      "Two cities, late-night video calls, spontaneous visits, shared playlists, and a trail of little moments that made the hard days feel lighter.",
    startPhoto: 4,
    endPhoto: 6,
    side: "right",
  },
  {
    id: 3,
    title: "Chapter Three",
    description:
      "A quiet moment, a gentle question, and suddenly the future we'd been imagining became something real — a forever kind of thing.",
    startPhoto: 7,
    endPhoto: 9,
    side: "left",
  },
];

const PHOTOS: StoryImage[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=480&fit=crop", caption: "First time we hung out" },
  { id: 2, image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=480&fit=crop", caption: "That one on campus" },
  { id: 3, image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=480&fit=crop", caption: "A random Tuesday" },
  { id: 4, image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=480&fit=crop", caption: "A favorite city corner" },
  { id: 5, image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=480&fit=crop", caption: "Weekend walks, shared dreams" },
  { id: 6, image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=600&h=480&fit=crop", caption: "Adventures that brought us closer" },
  { id: 7, image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=480&fit=crop", caption: "Everything felt right" },
  { id: 8, image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=480&fit=crop", caption: "Counting days together" },
  { id: 9, image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=480&fit=crop", caption: "Ready for forever" },
];

const TOTAL = PHOTOS.length;

// How much scroll distance (in % of viewport height) we need to complete the animation.
const EXTRA_VH = TOTAL * 45;

// Polaroid dimensions (wider aspect ratio)
const CW = 480;
const CH = 360;

// Stacked downwards vertically (no horizontal stagger) to lay them out straight
const STACK: Array<{ x: number; y: number; rotate: number }> = [
  { x: 0, y: -100, rotate: -1.5 },
  { x: 0, y: -75,  rotate: 1 },
  { x: 0, y: -50,  rotate: -0.8 },
  { x: 0, y: -25,  rotate: 1.2 },
  { x: 0, y: 0,    rotate: -1 },
  { x: 0, y: 25,   rotate: 0.5 },
  { x: 0, y: 50,   rotate: -1.2 },
  { x: 0, y: 75,   rotate: 1 },
  { x: 0, y: 100,  rotate: -0.5 },
];

// Derive chapter from photo index (0-based)
const getChapter = (idx: number): Chapter =>
  CHAPTERS.find((c) => idx + 1 >= c.startPhoto && idx + 1 <= c.endPhoto) ?? CHAPTERS[0];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PhotoCardProps {
  photo: StoryImage;
  index: number;
  activeIdx: number;
  hoveredId: number | null;
  onHover: (id: number) => void;
  onLeave: () => void;
  onClick: () => void;
}

function PhotoCard({ photo, index, activeIdx, hoveredId, onHover, onLeave, onClick }: PhotoCardProps) {
  const isTop = index === activeIdx;
  const isHovered = hoveredId === photo.id;

  return (
    <div
      className="cursor-pointer"
      onMouseEnter={() => onHover(photo.id)}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <motion.div
        className="bg-[#FCF9F5] border border-[#EBE3D7]/60 rounded-sm p-2 pb-12 select-none shadow-md"
        animate={{
          y: isHovered ? -16 : 0,
          scale: isHovered ? 1.05 : 1,
          boxShadow: isTop
            ? isHovered ? "0 20px 50px rgba(40,29,25,0.22)" : "0 8px 26px rgba(40,29,25,0.12)"
            : isHovered ? "0 6px 18px rgba(40,29,25,0.1)" : "0 3px 12px rgba(40,29,25,0.08)",
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image}
          alt={photo.caption}
          className="pointer-events-none rounded-[2px]"
          style={{ width: "var(--card-width)", height: "var(--card-height)", objectFit: "cover" }}
          draggable={false}
        />
        <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] md:text-[13px] text-[#281D19]/50 italic font-['Instrument_Serif'] whitespace-nowrap">
          {photo.caption}
        </p>
      </motion.div>
    </div>
  );
}
 
function ChapterText({ chapter, prevChapter }: { chapter: Chapter; prevChapter: Chapter | null }) {
  const isLeft = chapter.side === "left";
  // First render: fade in from center. Chapter change: slide in from opposite side
  const enterFrom = prevChapter ? (prevChapter.side === "left" ? 40 : -40) : 0;
 
  return (
    <motion.div
      className="absolute inset-0 z-30 pointer-events-none"
      initial={{ opacity: 0, x: enterFrom }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isLeft ? -40 : 40 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className={`px-8 md:px-0 w-full md:w-auto absolute bottom-[14%] md:bottom-auto md:top-[calc(50%-calc(var(--card-height)/2)-12px)] md:translate-y-0 md:flex md:flex-col ${
          isLeft
            ? "md:right-[calc(50vw+calc(var(--card-width)/2)+32px)] md:left-12 text-center md:text-right md:items-end"
            : "md:left-[calc(50vw+calc(var(--card-width)/2)+32px)] md:right-12 text-center md:text-left md:items-start"
        }`}
      >
        <h3 className="font-['Instrument_Serif'] text-lg md:text-2xl italic text-[#281D19] mb-2">{chapter.title}</h3>
        <p className="text-[11px] md:text-sm text-[#281D19]/60 leading-relaxed max-w-[240px] md:max-w-[260px] mx-auto md:mx-0">{chapter.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OurStory() {
  const [lightboxPhoto, setLightboxPhoto] = useState<StoryImage | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<Chapter>(CHAPTERS[0]);
  const [prevChapter, setPrevChapter] = useState<Chapter | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion useScroll tracks container scroll progress cleanly, with zero DOM manipulation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setHasScrolled(latest > 0.005);

      const newIdx = Math.min(TOTAL - 1, Math.floor(latest * TOTAL));
      if (newIdx !== activeIdx) {
        setActiveIdx(newIdx);

        // Update chapter
        const ch = getChapter(newIdx);
        if (ch.id !== currentChapter.id) {
          setPrevChapter(currentChapter);
          setCurrentChapter(ch);
        }
      }
    });
  }, [scrollYProgress, activeIdx, currentChapter]);

  useEffect(() => {
    if (lightboxPhoto) {
      document.documentElement.classList.add("lightbox-open");
    } else {
      document.documentElement.classList.remove("lightbox-open");
    }
    return () => {
      document.documentElement.classList.remove("lightbox-open");
    };
  }, [lightboxPhoto]);

  const handleHover = (id: number) => setHoveredId(id);
  const handleLeave = () => setHoveredId(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${100 + EXTRA_VH}vh` }} // Tall container provides the scroll distance natively
    >
      {/* Sticky viewport content: browser handles pinning natively via CSS sticky */}
      <section
        className="sticky top-0 bg-[#FAF5EE] h-screen w-full overflow-hidden"
      >
        {/* Viewport content */}
        <div className="relative h-screen w-full overflow-hidden">
          {/* Heading */}
          <div className="pt-8 sm:pt-12 px-4 sm:px-6">
            <h2 className="font-['Instrument_Serif'] text-5xl sm:text-7xl md:text-8xl lg:text-9xl italic text-center text-[#281D19] tracking-tight">
              our story
            </h2>
          </div>

          {/* Chapter text — animated on chapter change */}
          <AnimatePresence mode="wait">
            <ChapterText
              key={currentChapter.id}
              chapter={currentChapter}
              prevChapter={prevChapter}
            />
          </AnimatePresence>

          {/* Photo stack — always centered, Framer Motion drives animations based on activeIdx */}
          <div className="absolute inset-0 flex items-center justify-center translate-y-2">
            <div className="relative">
              {PHOTOS.map((photo, i) => {
                const isActive = i === activeIdx;
                const isPast = i < activeIdx;
                const depth = activeIdx - i; // distance in the past for stacked cards

                const { x, y, rotate } = STACK[i] || { x: 0, y: 0, rotate: 0 };

                // Determine target transformation styles based on card position in stack
                let targetX: any = 0;
                let targetY: any = 0;
                let targetRotate: any = 0;
                let targetScaleX: any = 1;
                let targetScaleY: any = 1;
                let targetOpacity = 0;
                let zIndex = 10;

                if (isActive) {
                  targetX = 0;
                  targetY = 0;
                  targetRotate = rotate;
                  targetScaleX = 1;
                  targetScaleY = 1;
                  targetOpacity = 1;
                  zIndex = 50;
                } else if (isPast) {
                  // Past cards stack behind the active card
                  zIndex = 40 - depth;
                  targetOpacity = 0.85;
                  targetX = 0;
                  targetY = -depth * 14;
                  targetScaleX = Math.max(0.8, 1 - depth * 0.02);
                  targetScaleY = 1;
                  targetRotate = rotate; // keep original rotation for organic look
                } else {
                  // Future cards: only the immediately next card is visible at the very bottom, ready to slide up
                  const isNext = i === activeIdx + 1;
                  targetX = 0;
                  targetY = isNext ? 650 : 800; // start at the very bottom
                  targetRotate = rotate;
                  targetScaleX = 1;
                  targetScaleY = 1;
                  targetOpacity = isNext ? 0.6 : 0; // slight fade at the bottom
                  zIndex = isNext ? 45 : 10;
                }

                return (
                  <motion.div
                    key={photo.id}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      translate: "-50% -50%",
                      width: "calc(var(--card-width) + 16px)",
                      height: "calc(var(--card-height) + 48px)",
                      zIndex: zIndex
                    }}
                    animate={{
                      opacity: targetOpacity,
                      x: targetX,
                      y: targetY,
                      rotate: targetRotate,
                      scaleX: targetScaleX,
                      scaleY: targetScaleY,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    <PhotoCard
                      photo={photo}
                      index={i}
                      activeIdx={activeIdx}
                      hoveredId={hoveredId}
                      onHover={handleHover}
                      onLeave={handleLeave}
                      onClick={() => setLightboxPhoto(photo)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1E1715]/95 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              className="absolute top-6 right-6 text-[#FAF5EE]/80 hover:text-[#FAF5EE] z-10 cursor-pointer"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              className="relative max-w-3xl w-full"
              initial={{ scale: 0.82, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#FCF9F5] rounded-sm p-4 pb-12 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxPhoto.image.replace(/w=\d+/, "w=1200")}
                  alt={lightboxPhoto.caption}
                  className="w-full h-auto max-h-[72vh] object-contain rounded-xs"
                />
                <p className="text-center text-[#281D19]/60 text-sm italic mt-4 font-['Instrument_Serif']">
                  {lightboxPhoto.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
