import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const INVITATION_TEXT = "you're cordially invited to celebrate the story of...";

const HERO_IMG =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=1200&fit=crop";

const GALLERY_IMGS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=1200&fit=crop",
];

export const Welcome = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const tlPhotoRef = useRef<HTMLDivElement>(null);
  const blPhotoRef = useRef<HTMLDivElement>(null);
  const trPhotoRef = useRef<HTMLDivElement>(null);
  const brPhotoRef = useRef<HTMLDivElement>(null);
  const mobileImgsRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const textSectionRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    const menu = mobileMenuRef.current;
    if (!menu) return;
    gsap.set(menu, { visibility: "visible" });
    gsap.fromTo(
      menu,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" },
    );
    gsap.fromTo(
      menu.querySelectorAll(".menu-item"),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.15,
      },
    );
  };

  const closeMenu = () => {
    const menu = mobileMenuRef.current;
    if (!menu) return;
    gsap.to(menu.querySelectorAll(".menu-item"), {
      y: -20,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      stagger: 0.04,
    });
    gsap.to(menu, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      delay: 0.15,
      onComplete: () => gsap.set(menu, { visibility: "hidden" }),
    });
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      if (isMobile) {
        // Hide all gallery images initially
        mobileImgsRef.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0 });
        });
        gsap.set(mobileMenuBtnRef.current, { opacity: 0 });

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

        // Show hamburger at the end
        tl.to(
          mobileMenuBtnRef.current,
          { opacity: 1, duration: 0.1, ease: "none" },
          0.9,
        );
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
        gsap.set(navRef.current, { yPercent: -100, opacity: 0 });

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

        tl.to(navRef.current, { yPercent: 0, opacity: 1, ease: "none" }, 0.4);
      }
    }, wrapperRef);

    // Scroll-highlighted text animation (outside pinned context)
    const words = textSectionRef.current?.querySelectorAll(".invitation-word");
    if (words) {
      gsap.to(words, {
        color: "#1A1816",
        stagger: 0.1,
        scrollTrigger: {
          trigger: textSectionRef.current,
          start: "top 25%",
          end: "center 45%",
          scrub: true,
        },
      });
    }

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="bg-[#F8F5EF]">
      <div
        ref={wrapperRef}
        className="relative h-screen w-full overflow-hidden bg-[#F8F5EF]"
      >
        {/* Navbar - desktop only */}
        <nav
          ref={navRef}
          className="hidden md:flex absolute top-0 inset-x-0 z-40 items-center justify-between px-8 py-5"
        >
          <span className="text-base font-semibold text-[#1A1816]">J&P</span>
          <div className="flex items-center gap-6 text-sm text-[#1A1816]/70">
            <span className="cursor-pointer">Travel Logistics</span>
            <span className="cursor-pointer">Registry</span>
            <span className="cursor-pointer">FAQ</span>
            <button className="rounded-full bg-[#C8A96B] px-5 py-2 text-sm font-medium text-[#1A1816]">
              Submit RSVP
            </button>
          </div>
        </nav>

        {/* Mobile hamburger button */}
        <button
          ref={mobileMenuBtnRef}
          onClick={() => openMenu()}
          className="md:hidden absolute top-5 right-4 z-50 p-2"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Mobile menu overlay */}
        <div
          ref={mobileMenuRef}
          className="md:hidden fixed inset-0 z-[100] bg-black/90 flex flex-col invisible"
        >
          <button
            onClick={() => closeMenu()}
            className="absolute top-5 right-4 p-2"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex flex-col items-center justify-center h-full gap-8 text-white">
            <span className="menu-item text-2xl font-light cursor-pointer">
              Travel Logistics
            </span>
            <span className="menu-item text-2xl font-light cursor-pointer">
              Registry
            </span>
            <span className="menu-item text-2xl font-light cursor-pointer">
              FAQ
            </span>
            <button className="menu-item mt-4 rounded-full bg-[#C8A96B] px-8 py-3 text-base font-medium text-[#1A1816]">
              Submit RSVP
            </button>
          </div>
        </div>

        {/* Desktop side photos */}
        <div
          ref={tlPhotoRef}
          className="hidden md:block absolute top-[3%] z-30 w-[24vw] h-[32vh] overflow-hidden rounded-2xl shadow-lg"
          style={{ right: "calc(50% + 14vw)" }}
        >
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop"
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
            src="https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=500&h=400&fit=crop"
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
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=500&fit=crop"
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
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Hero container */}
        <div
          ref={heroRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full h-screen md:w-[calc(100vw-80px)] md:h-[calc(100vh-80px)] md:rounded-3xl overflow-hidden"
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
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-14 bg-linear-to-t from-black/40 to-transparent">
            <h1 className="font-['Instrument_Serif'] text-5xl text-white italic drop-shadow-lg">
              Jim & Pam
            </h1>
            <p className="mt-3 text-[11px] text-white/70 tracking-[0.3em] uppercase">
              Scroll to explore
            </p>
          </div>
        </div>
      </div>

      {/* Scroll-highlighted text section */}
      <div
        ref={textSectionRef}
        className="flex items-center justify-center min-h-screen bg-[#F8F5EF] px-6"
      >
        <p className="invitation-text font-['Instrument_Serif'] text-3xl md:text-5xl italic text-center leading-relaxed max-w-5xl">
          {INVITATION_TEXT.split(" ").map((word, i) => (
            <span
              key={i}
              className="invitation-word inline-block mr-[0.3em] text-[#1A1816]/20"
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};
