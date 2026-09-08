import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OurStory } from "./components/our-story";
import { EventDetails } from "./components/event-details";
import { GallerySection } from "./components/gallery-section";
import { WishesSection } from "./components/wishes-section";
import { FooterSection } from "./components/footer-section";
import { useAuth } from "~/contexts/auth-context";
import { getFileUrl } from "~/lib/api";
import type { TemplateProps } from "~/templates/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INVITATION_TEXT = "you're cordially invited to celebrate the story of...";

const DEFAULT_HERO_IMG =
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1200&fit=crop";

const DEFAULT_GALLERY_IMGS = [
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&h=1200&fit=crop",
];

export function ClassicMonochromeTemplate({ couple: propCouple, guestName, isTemplatePreview }: TemplateProps) {
  const { currentCouple: contextCouple } = useAuth();
  const couple = propCouple || contextCouple;

  const pageRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tlPhotoRef = useRef<HTMLDivElement>(null);
  const blPhotoRef = useRef<HTMLDivElement>(null);
  const trPhotoRef = useRef<HTMLDivElement>(null);
  const brPhotoRef = useRef<HTMLDivElement>(null);
  const mobileImgsRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const textSectionRef = useRef<HTMLDivElement>(null);

  // Resolve 5 photos for First Page (Hero + 4 Corners)
  const allPhotos = couple?.galleryPhotos || [];
  const heroIds = couple?.heroPhotoIds || [];

  const getPhotoByIdOrIndex = (idx: number, fallback: string) => {
    if (heroIds[idx]) {
      const found = allPhotos.find((p) => p.id === heroIds[idx]);
      if (found) return getFileUrl(found.url);
    }
    return getFileUrl(allPhotos[idx]?.url) || fallback;
  };

  const heroImg = getPhotoByIdOrIndex(0, DEFAULT_HERO_IMG);
  const tlImg = getPhotoByIdOrIndex(1, DEFAULT_GALLERY_IMGS[0]);
  const blImg = getPhotoByIdOrIndex(2, DEFAULT_GALLERY_IMGS[1]);
  const trImg = getPhotoByIdOrIndex(3, DEFAULT_GALLERY_IMGS[2]);
  const brImg = getPhotoByIdOrIndex(4, DEFAULT_GALLERY_IMGS[3]);

  const galleryImgs = [tlImg, blImg, trImg, brImg];
  const groomFirst = couple?.groomName ? couple.groomName.split(" ")[0] : "Jim";
  const brideFirst = couple?.brideName ? couple.brideName.split(" ")[0] : "Pam";
  const coupleName = `${groomFirst} & ${brideFirst}`;

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      if (isMobile) {
        // Hide all gallery images initially
        mobileImgsRef.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "+=250%",
            scrub: 0.6,
            pin: true,
          },
        });

        const count = mobileImgsRef.current.length;
        const segmentDuration = 1 / count;

        mobileImgsRef.current.forEach((el, i) => {
          if (!el) return;
          const start = i * segmentDuration;
          tl.to(
            el,
            { opacity: 1, duration: segmentDuration * 0.3, ease: "none" },
            start,
          );
          if (i === 0) {
            tl.to(
              heroImgRef.current,
              { opacity: 0, duration: segmentDuration * 0.1, ease: "none" },
              start,
            );
          }
          if (i < count - 1) {
            tl.to(
              el,
              { opacity: 0, duration: segmentDuration * 0.3, ease: "none" },
              start + segmentDuration * 0.7,
            );
          }
        });
      } else {
        // Desktop: shrink hero + reveal side photos
        gsap.set(tlPhotoRef.current, {
          xPercent: -150,
          yPercent: 100,
          opacity: 0,
        });
        gsap.set(blPhotoRef.current, {
          xPercent: -150,
          yPercent: 100,
          opacity: 0,
        });
        gsap.set(trPhotoRef.current, {
          xPercent: 150,
          yPercent: 100,
          opacity: 0,
        });
        gsap.set(brPhotoRef.current, {
          xPercent: 150,
          yPercent: 100,
          opacity: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "+=100%",
            scrub: 0.6,
            pin: true,
          },
        });

        tl.to(
          heroRef.current,
          {
            width: "34vw",
            height: "82vh",
            borderRadius: "20px",
            ease: "none",
          },
          0,
        );

        tl.to(
          tlPhotoRef.current,
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.9,
          },
          0,
        );
        tl.to(
          blPhotoRef.current,
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.9,
          },
          0.05,
        );
        tl.to(
          trPhotoRef.current,
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.9,
          },
          0.02,
        );
        tl.to(
          brPhotoRef.current,
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.9,
          },
          0.08,
        );
      }

      // Scroll-highlighted text animation
      const words =
        textSectionRef.current?.querySelectorAll(".invitation-word");
      if (words) {
        gsap.to(words, {
          color: "#281D19",
          stagger: 0.1,
          scrollTrigger: {
            trigger: textSectionRef.current,
            start: "top 25%",
            end: "center 45%",
            scrub: true,
          },
        });
      }

      ScrollTrigger.refresh();
    }, pageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={pageRef} className="bg-[#FAFAF9]">
      <div
        ref={wrapperRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAFAF9]"
      >
        {/* Desktop side photos */}
        <div
          ref={tlPhotoRef}
          className="hidden md:block absolute top-[3%] z-30 w-[24vw] h-[32vh] overflow-hidden rounded-2xl shadow-lg"
          style={{ right: "calc(50% + 14vw)" }}
        >
          <img
            src={tlImg}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div
          ref={blPhotoRef}
          className="hidden md:block absolute top-[38%] z-30 w-[20vw] h-[28vh] overflow-hidden rounded-2xl shadow-lg"
          style={{ right: "calc(50% + 9vw)" }}
        >
          <img
            src={blImg}
            alt=""
            className="h-full w-full object-cover grayscale"
          />
        </div>
        <div
          ref={trPhotoRef}
          className="hidden md:block absolute top-[22%] z-30 w-[19vw] h-[34vh] overflow-hidden rounded-2xl shadow-lg"
          style={{ left: "calc(50% + 15vw)" }}
        >
          <img
            src={trImg}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div
          ref={brPhotoRef}
          className="hidden md:block absolute top-[60%] z-30 w-[17vw] h-[26vh] overflow-hidden rounded-2xl shadow-lg"
          style={{ left: "calc(50% + 11vw)" }}
        >
          <img
            src={brImg}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Hero container */}
        <div
          ref={heroRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full h-screen md:w-[calc(100vw-80px)] md:h-[calc(100vh-80px)] md:rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Hero image */}
          <div ref={heroImgRef} className="absolute inset-0">
            <img
              src={heroImg}
              alt="Hero"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Mobile gallery images stacked */}
          {galleryImgs.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                mobileImgsRef.current[i] = el;
              }}
              className="md:hidden absolute inset-0"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}

          {/* Text overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 sm:pb-16 bg-linear-to-t from-[#1E1715]/80 via-[#1E1715]/25 to-transparent px-4">
            {guestName && (
              <div className="text-center mb-3 max-w-lg">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/80 font-light block mb-1">
                  Kepada Yth. Bapak/Ibu/Saudara/i
                </span>
                <span className="text-sm sm:text-base font-medium text-white tracking-wide drop-shadow-md px-4 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 inline-block">
                  {guestName}
                </span>
              </div>
            )}
            <h1 className="font-['Instrument_Serif'] text-4xl sm:text-6xl md:text-7xl text-white italic drop-shadow-lg text-center px-4">
              {coupleName}
            </h1>
          </div>
        </div>
      </div>

      {/* Scroll-highlighted text section */}
      <div
        ref={textSectionRef}
        className="flex items-center justify-center min-h-screen bg-[#FAFAF9] px-6"
      >
        <p className="invitation-text font-['Instrument_Serif'] text-3xl md:text-5xl italic text-center leading-relaxed max-w-5xl">
          {INVITATION_TEXT.split(" ").map((word, i) => (
            <span
              key={i}
              className="invitation-word inline-block mr-[0.3em] text-[#281D19]/20"
            >
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* Our Story section */}
      <OurStory couple={couple} />

      {/* Wedding Date, Countdown & Event Details section */}
      <EventDetails couple={couple} />

      {/* Full-width Masonry Moments Gallery section */}
      <GallerySection couple={couple} />

      {/* Doa & Ucapan section */}
      <WishesSection couple={couple} guestName={guestName} isTemplatePreview={isTemplatePreview} />

      {/* Cinematic Quote Footer Section */}
      <FooterSection couple={couple} />
    </div>
  );
}

