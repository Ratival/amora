import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OurStory } from "~/components/our-story";
import { EventDetails } from "~/components/event-details";
import { GallerySection } from "~/components/gallery-section";
import { WishesSection } from "~/components/wishes-section";
import { FooterSection } from "~/components/footer-section";

gsap.registerPlugin(ScrollTrigger);

const INVITATION_TEXT = "you're cordially invited to celebrate the story of...";

const HERO_IMG =
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1200&fit=crop";

const GALLERY_IMGS = [
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&h=1200&fit=crop",
];

export const Welcome = () => {
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

        // Each image fades in fully, then fades out before the next one comes
        const count = mobileImgsRef.current.length;
        const segmentDuration = 1 / count;

        mobileImgsRef.current.forEach((el, i) => {
          if (!el) return;
          const start = i * segmentDuration;
          // Fade in
          tl.to(
            el,
            { opacity: 1, duration: segmentDuration * 0.3, ease: "none" },
            start,
          );
          // Hold, then fade out hero behind (first one fades out hero image)
          if (i === 0) {
            tl.to(
              heroImgRef.current,
              { opacity: 0, duration: segmentDuration * 0.1, ease: "none" },
              start,
            );
          }
          // Fade out (except last image stays)
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

      // Scroll-highlighted text animation inside the same context
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

      // Refresh triggers after setting up everything to prevent jumpy layout shifts
      ScrollTrigger.refresh();
    }, pageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={pageRef} className="bg-[#FAF5EE]">
      <div
        ref={wrapperRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF5EE]"
      >

        {/* Desktop side photos */}
        <div
          ref={tlPhotoRef}
          className="hidden md:block absolute top-[3%] z-30 w-[24vw] h-[32vh] overflow-hidden rounded-2xl shadow-lg"
          style={{ right: "calc(50% + 14vw)" }}
        >
          <img
            src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=400&fit=crop"
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
            src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&h=400&fit=crop"
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
            src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=500&fit=crop"
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
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop"
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
              src={HERO_IMG}
              alt="Hero"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Mobile gallery images stacked */}
          {GALLERY_IMGS.map((src, i) => (
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

          {/* Text overlay - always visible */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-14 bg-linear-to-t from-[#1E1715]/70 via-[#1E1715]/20 to-transparent">
            <h1 className="font-['Instrument_Serif'] text-5xl text-[#FAF5EE] italic drop-shadow-lg">
              Jim & Pam
            </h1>
          </div>
        </div>
      </div>

      {/* Scroll-highlighted text section */}
      <div
        ref={textSectionRef}
        className="flex items-center justify-center min-h-screen bg-[#FAF5EE] px-6"
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
      <OurStory />

      {/* Wedding Date, Countdown & Event Details section */}
      <EventDetails />

      {/* Full-width Masonry Moments Gallery section */}
      <GallerySection />

      {/* Doa & Ucapan section */}
      <WishesSection />

      {/* Cinematic Quote Footer Section */}
      <FooterSection />
    </div>
  );
};
