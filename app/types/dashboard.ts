export type UserRole = "admin" | "superadmin" | "couple" | "staff";

export interface Permission {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  audit: boolean;
}

export type Permissions = Record<string, Permission>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  coupleSlug?: string;
  coupleNames?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  permissions?: Permissions;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisUrl?: string;
}

export interface StoryChapter {
  id: number;
  title: string;
  description: string;
}

export interface CoupleProject {
  id: string;
  slug: string;
  title: string;
  ownerEmail: string;
  groomName: string;
  groomParents: string;
  groomBio?: string;
  groomInstagram?: string;
  groomPhoto: string;
  brideName: string;
  brideParents: string;
  brideBio?: string;
  brideInstagram?: string;
  bridePhoto: string;
  weddingDate: string;
  akadDate: string;
  akadTime: string;
  akadVenue: string;
  akadAddress: string;
  akadMapsUrl: string;
  resepsiDate: string;
  resepsiTime: string;
  resepsiVenue: string;
  resepsiAddress: string;
  resepsiMapsUrl: string;
  liveStreamUrl?: string;
  themeId: string;
  status: "published" | "draft" | "archived";
  rsvpDeadline: string;
  guestCount: number;
  rsvpCount: {
    attending: number;
    tentative: number;
    regret: number;
    pending: number;
  };
  wishesCount: number;
  totalAngpao: number;
  bankAccounts: BankAccount[];
  musicTitle: string;
  musicArtist: string;
  musicUrl: string;
  storyQuote?: string;
  loveStories: Array<{
    year: string;
    title: string;
    story: string;
    image?: string;
  }>;
  galleryPhotos: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  heroPhotoIds?: string[]; // Max 5 photos for First Page (1 hero + 4 floating)
  storyPhotoIds?: string[]; // Max 9 photos for Our Story (3 per chapter)
  storyChapters?: StoryChapter[]; // 3 Chapters for Our Story
  isPasswordProtected: boolean;
  password?: string;
  qrCheckInEnabled: boolean;
  customDomain?: string;
}

export interface Guest {
  id: string;
  coupleSlug: string;
  name: string;
  phone: string;
  category: "VIP" | "Keluarga" | "Sahabat" | "Rekan Kerja" | "Umum";
  pax: number;
  rsvpStatus: "Attending" | "Tentative" | "Regret" | "Pending";
  attended: boolean;
  checkInTime?: string;
  tableNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  coupleSlug: string;
  name: string;
  relationship: string;
  message: string;
  attendance: "attending" | "not_attending" | "tentative";
  isPinned: boolean;
  isApproved: boolean;
  reply?: string;
  createdAt: string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  category: "Modern" | "Rustic" | "Luxury" | "Traditional" | "Minimalist";
  description: string;
  previewImage: string;
  accentColor: string;
  fontFamily: string;
  popular: boolean;
  activeCouplesCount: number;
}

export interface PlanTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  features: string[];
  activeSubscribers: number;
  isPopular?: boolean;
}

export interface PlatformStats {
  totalCouples: number;
  publishedInvitations: number;
  totalGuests: number;
  totalRSVPs: number;
  totalWishes: number;
  activeRevenue: string;
  monthlyGrowthRate: string;
}
