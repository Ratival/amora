import type {
  CoupleProject,
  Guest,
  Wish,
  ThemeTemplate,
  PlanTier,
  PlatformStats,
  User,
} from "~/types/dashboard";

export const INITIAL_USERS: User[] = [];

export const INITIAL_COUPLES: CoupleProject[] = [
  {
    id: "cpl-template",
    slug: "template",
    title: "Amora Wedding Invitation (Demo Template)",
    ownerEmail: "template@ratival.com",
    groomName: "Jim Halpert",
    groomParents: "Putra dari Bpk. Gerald Halpert & Ibu Betsy Halpert",
    groomBio: "A paper salesman with a penchant for pranks and eternal love for Pam.",
    groomInstagram: "@jimhalpert",
    groomPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    brideName: "Pam Beesly",
    brideParents: "Putri dari Bpk. William Beesly & Ibu Helene Beesly",
    brideBio: "An artist, receptionist, and the love of Jim's life since day one.",
    brideInstagram: "@pambeesly",
    bridePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    weddingDate: "2026-10-24",
    akadDate: "Sabtu, 24 Oktober 2026",
    akadTime: "09:00 - 11:00 WIB",
    akadVenue: "Niagara Chapel & Garden",
    akadAddress: "Jl. Lembah Niagara No. 12, Bandung, Jawa Barat",
    akadMapsUrl: "https://maps.google.com/?q=Bandung",
    resepsiDate: "Sabtu, 24 Oktober 2026",
    resepsiTime: "18:30 - 21:30 WIB",
    resepsiVenue: "The Grand Ballroom Dunder",
    resepsiAddress: "Jl. Asia Afrika No. 88, Bandung, Jawa Barat",
    resepsiMapsUrl: "https://maps.google.com/?q=Bandung",
    liveStreamUrl: "",
    themeId: "modern-minimalist",
    status: "published",
    rsvpDeadline: "2026-10-10",
    guestCount: 0,
    rsvpCount: {
      attending: 0,
      tentative: 0,
      regret: 0,
      pending: 0,
    },
    wishesCount: 0,
    totalAngpao: 0,
    musicTitle: "Shape of My Heart",
    musicArtist: "Sting",
    musicUrl: "/shape_of_my_heart.mp3",
    storyQuote: "When you're a kid, you assume your parents are soulmates. My kids are gonna be right about that.",
    bankAccounts: [
      {
        id: "bank-1",
        bankName: "BCA",
        accountNumber: "5220891234",
        accountHolder: "Jim Halpert",
      },
      {
        id: "bank-2",
        bankName: "Mandiri",
        accountNumber: "1310009876543",
        accountHolder: "Pamela Beesly",
      },
      {
        id: "bank-3",
        bankName: "QRIS All Payment",
        accountNumber: "Scan QRIS Digital",
        accountHolder: "Amora Demo Wedding",
        qrisUrl: "https://images.unsplash.com/photo-1595079672139-5470805c56b7?w=400&auto=format&fit=crop&q=80",
      },
    ],
    loveStories: [
      {
        year: "2020",
        title: "First Encounter",
        story: "Pertama kali kami bertatap muka di meja resepsionis. Sebuah candaan sederhana menjadi awal dari perjalanan panjang yang manis.",
      },
      {
        year: "2023",
        title: "The Proposal at the Gas Station",
        story: "Di tengah hujan rintik yang syahdu, Jim berlutut dan menanyakan satu pertanyaan yang mengubah hidup kami selamanya.",
      },
      {
        year: "2026",
        title: "Our Forever Chapter",
        story: "Kami siap mengikat janji suci di hadapan keluarga dan sahabat tercinta.",
      },
    ],
    galleryPhotos: [
      { id: "g-1", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1200&fit=crop", caption: "Our wedding hero portrait" },
      { id: "g-2", url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&h=1200&fit=crop", caption: "First time we hung out" },
      { id: "g-3", url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=1200&fit=crop", caption: "That one on campus" },
      { id: "g-4", url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&h=1200&fit=crop", caption: "A random Tuesday" },
      { id: "g-5", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&h=1200&fit=crop", caption: "A favorite city corner" },
      { id: "g-6", url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&h=1200&fit=crop", caption: "Weekend walks & shared dreams" },
      { id: "g-7", url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&h=1200&fit=crop", caption: "Adventures that brought us closer" },
      { id: "g-8", url: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=900&h=1200&fit=crop", caption: "Everything felt right" },
      { id: "g-9", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&h=1200&fit=crop", caption: "Counting days together" },
      { id: "g-10", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=1200&fit=crop", caption: "Ready for forever" },
      { id: "g-11", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=1200&fit=crop", caption: "Sunset whispers in the garden" },
      { id: "g-12", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop", caption: "Warm smiles on our anniversary" },
      { id: "g-13", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1200&fit=crop", caption: "A quiet moment together" },
      { id: "g-14", url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&h=1200&fit=crop", caption: "Golden hour glow" },
      { id: "g-15", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1200&fit=crop", caption: "Holding hands toward tomorrow" },
    ],
    heroPhotoIds: ["g-1", "g-2", "g-3", "g-4", "g-5"],
    storyPhotoIds: ["g-2", "g-3", "g-4", "g-5", "g-6", "g-7", "g-8", "g-9", "g-10"],
    storyChapters: [
      {
        id: 1,
        title: "Chapter One: The First Encounter",
        description:
          "In the most unplanned, the-universe-has-a-sense-of-humor way — paths crossed, moments collided, and somehow it felt like the universe had been waiting for this moment all along.",
      },
      {
        id: 2,
        title: "Chapter Two: Growing Together",
        description:
          "Two cities, late-night video calls, spontaneous visits, shared playlists, and a trail of little moments that made the hard days feel lighter.",
      },
      {
        id: 3,
        title: "Chapter Three: Ready for Forever",
        description:
          "A quiet moment, a gentle question, and suddenly the future we'd been imagining became something real — a forever kind of thing.",
      },
    ],
    isPasswordProtected: false,
    qrCheckInEnabled: true,
  },
];

export const DEFAULT_TEMPLATE_COUPLE: CoupleProject = INITIAL_COUPLES[0];

export const INITIAL_GUESTS: Guest[] = [];

export const INITIAL_WISHES: Wish[] = [];

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: "modern-minimalist",
    name: "Amora Classic Monochrome",
    category: "Minimalist",
    description: "Desain minimalis editorial dengan sentuhan tipografi elegan, palet netral berkelas, dan animasi transisi halus.",
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
    accentColor: "#171717",
    fontFamily: "Inter & Instrument Serif",
    popular: true,
    activeCouplesCount: 0,
  },
];

export const SUBSCRIPTION_PLANS: PlanTier[] = [];

export const PLATFORM_STATS: PlatformStats = {
  totalCouples: 0,
  publishedInvitations: 0,
  totalGuests: 0,
  totalRSVPs: 0,
  totalWishes: 0,
  activeRevenue: "Rp 0",
  monthlyGrowthRate: "0 Undangan",
};


