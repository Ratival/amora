import { motion } from "motion/react";
import Masonry, { type MasonryItem } from "./Masonry";

const GALLERY_ITEMS: MasonryItem[] = [
  {
    id: "1",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=700&h=950&fit=crop",
    height: 750,
  },
  {
    id: "2",
    img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=700&h=600&fit=crop",
    height: 480,
  },
  {
    id: "3",
    img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=700&h=850&fit=crop",
    height: 680,
  },
  {
    id: "4",
    img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=700&h=550&fit=crop",
    height: 420,
  },
  {
    id: "5",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=700&h=900&fit=crop",
    height: 720,
  },
  {
    id: "6",
    img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=700&h=650&fit=crop",
    height: 520,
  },
  {
    id: "7",
    img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=700&h=800&fit=crop",
    height: 640,
  },
  {
    id: "8",
    img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=700&h=600&fit=crop",
    height: 460,
  },
  {
    id: "9",
    img: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=700&h=850&fit=crop",
    height: 700,
  },
  {
    id: "10",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=700&h=600&fit=crop",
    height: 500,
  },
];

export function GallerySection() {
  return (
    <section className="relative w-full bg-[#FAF5EE] pt-16 pb-28 sm:pb-36 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-12 sm:mb-16">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.35em] text-[#C86D51] font-medium mb-3"
        >
          Moments & Memories
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-['Instrument_Serif'] text-5xl sm:text-7xl md:text-8xl italic text-[#281D19] tracking-tight"
        >
          our gallery
        </motion.h2>
      </div>

      {/* Full width Masonry layout */}
      <div className="w-full px-2 sm:px-4 md:px-6">
        <Masonry
          items={GALLERY_ITEMS}
          ease="power3.out"
          duration={0.7}
          stagger={0.06}
          animateFrom="bottom"
          scaleOnHover={true}
          hoverScale={0.97}
          blurToFocus={true}
          colorShiftOnHover={false}
        />
      </div>
    </section>
  );
}
