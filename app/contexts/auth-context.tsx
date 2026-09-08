"use client";

import * as React from "react";
import { useNavigate } from "react-router";
import type {
  User,
  CoupleProject,
  Guest,
  Wish,
  ThemeTemplate,
  PlanTier,
  PlatformStats,
} from "~/types/dashboard";
import {
  INITIAL_COUPLES,
  INITIAL_USERS,
  THEME_TEMPLATES,
  SUBSCRIPTION_PLANS,
  PLATFORM_STATS,
} from "~/lib/mock-data";
import { api, getAuthToken, clearAuthToken } from "~/lib/api";

export const DEFAULT_TEMPLATE_COUPLE: CoupleProject = INITIAL_COUPLES[0];

interface AuthContextType {
  currentUser: User | null;
  currentCouple: CoupleProject | null;
  couples: CoupleProject[];
  guests: Guest[];
  wishes: Wish[];
  templates: ThemeTemplate[];
  plans: PlanTier[];
  stats: PlatformStats;
  users: User[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; redirectUrl: string; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  setActiveCoupleBySlug: (slug: string) => void;
  updateCouple: (slug: string, updates: Partial<CoupleProject>) => Promise<void>;
  createCouple: (newCouple: Partial<CoupleProject> & { password?: string }) => Promise<CoupleProject & { credentials?: { email: string; password: string; slug: string } }>;
  deleteCouple: (id: string) => Promise<void>;
  addGuest: (guest: Omit<Guest, "id" | "createdAt">) => Promise<void>;
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  togglePinWish: (id: string) => Promise<void>;
  toggleApproveWish: (id: string) => void;
  replyWish: (id: string, replyText: string) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  createUser: (userData: { name: string; email: string; password: string; role: string; coupleSlug?: string }) => Promise<User>;
  updateUser: (id: string, userData: Partial<User> & { password?: string }) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  hasPermission: (permissionKey: string, action?: "view" | "create" | "update" | "delete" | "audit") => boolean;
  refreshData: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const DEFAULT_STORY_CHAPTERS = [
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
];

function parseCoupleFromBackend(c: any): CoupleProject {
  let heroPhotoIds: string[] = [];
  let storyPhotoIds: string[] = [];
  let storyChapters: any[] = [];
  let bankAccounts: any[] = [];

  try {
    if (c.heroPhotoIds) heroPhotoIds = typeof c.heroPhotoIds === "string" ? JSON.parse(c.heroPhotoIds) : c.heroPhotoIds;
  } catch {}
  try {
    if (c.storyPhotoIds) storyPhotoIds = typeof c.storyPhotoIds === "string" ? JSON.parse(c.storyPhotoIds) : c.storyPhotoIds;
  } catch {}
  try {
    if (c.storyChapters) storyChapters = typeof c.storyChapters === "string" ? JSON.parse(c.storyChapters) : c.storyChapters;
  } catch {}
  try {
    if (c.bankAccounts) bankAccounts = typeof c.bankAccounts === "string" ? JSON.parse(c.bankAccounts) : c.bankAccounts;
  } catch {}

  const isTemplate = c.slug === "template";

  return {
    id: c.id,
    slug: c.slug,
    title: c.title || `The Wedding of ${c.groomName} & ${c.brideName}`,
    ownerEmail: c.ownerEmail ? c.ownerEmail.replace("@amora.io", "@ratival.com") : `${c.slug}@ratival.com`,
    groomName: c.groomName || "",
    groomParents: c.groomParents || "",
    groomBio: c.groomBio || "",
    groomInstagram: c.groomInstagram || "",
    groomPhoto: c.groomPhoto || (isTemplate ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80" : ""),
    brideName: c.brideName || "",
    brideParents: c.brideParents || "",
    brideBio: c.brideBio || "",
    brideInstagram: c.brideInstagram || "",
    bridePhoto: c.bridePhoto || (isTemplate ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80" : ""),
    weddingDate: c.weddingDate || "",
    akadDate: c.akadDate || "",
    akadTime: c.akadTime || "",
    akadVenue: c.akadVenue || "",
    akadAddress: c.akadAddress || "",
    akadMapsUrl: c.akadMapsUrl || "",
    resepsiDate: c.resepsiDate || "",
    resepsiTime: c.resepsiTime || "",
    resepsiVenue: c.resepsiVenue || "",
    resepsiAddress: c.resepsiAddress || "",
    resepsiMapsUrl: c.resepsiMapsUrl || "",
    liveStreamUrl: c.liveStreamUrl || "",
    themeId: c.themeId || "modern-minimalist",
    status: c.status || "published",
    rsvpDeadline: c.rsvpDeadline || "",
    guestCount: c.guestCount || 0,
    rsvpCount: c.rsvpCount || { attending: 0, tentative: 0, regret: 0, pending: 0 },
    wishesCount: c.wishesCount || 0,
    totalAngpao: c.totalAngpao || 0,
    bankAccounts: bankAccounts.length ? bankAccounts : (isTemplate ? DEFAULT_TEMPLATE_COUPLE.bankAccounts : []),
    musicTitle: c.musicTitle || (isTemplate ? "Shape of My Heart" : ""),
    musicArtist: c.musicArtist || (isTemplate ? "Sting" : ""),
    musicUrl: c.musicUrl || (isTemplate ? "/shape_of_my_heart.mp3" : ""),
    storyQuote: c.storyQuote || (isTemplate ? "Two hearts, one journey, and a lifetime to cherish." : ""),
    loveStories: c.loveStories || [],
    galleryPhotos: Array.isArray(c.gallery)
      ? c.gallery.map((g: any) => ({ id: g.id, url: g.url, caption: g.caption }))
      : Array.isArray(c.galleryPhotos)
      ? c.galleryPhotos
      : [],
    heroPhotoIds,
    storyPhotoIds,
    storyChapters: storyChapters.length > 0 ? storyChapters : (isTemplate ? DEFAULT_TEMPLATE_COUPLE.storyChapters : DEFAULT_STORY_CHAPTERS),
    isPasswordProtected: c.isPasswordProtected || false,
    qrCheckInEnabled: c.qrCheckInEnabled !== undefined ? c.qrCheckInEnabled : true,
  };
}

const ZERO_STATS: PlatformStats = {
  totalCouples: 0,
  publishedInvitations: 0,
  totalGuests: 0,
  totalRSVPs: 0,
  totalWishes: 0,
  activeRevenue: "Rp 0",
  monthlyGrowthRate: "0 Aktif",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [couples, setCouples] = React.useState<CoupleProject[]>(INITIAL_COUPLES);
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [wishes, setWishes] = React.useState<Wish[]>([]);
  const [templates] = React.useState<ThemeTemplate[]>(THEME_TEMPLATES);
  const [plans] = React.useState<PlanTier[]>(SUBSCRIPTION_PLANS);
  const [stats, setStats] = React.useState<PlatformStats>(PLATFORM_STATS);
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS);
  const [activeSlug, setActiveSlug] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length > 0 && !["login", "admin", "dashboard"].includes(parts[0])) {
        return parts[0];
      }
    }
    return "template";
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Load Initial Data from Backend
  const refreshData = React.useCallback(async () => {
    try {
      const token = getAuthToken();

      let userRole: string | undefined;
      let userCoupleSlug: string | undefined;

      // 1. Fetch current user if token exists
      if (token) {
        const meRes = await api.auth.me();
        if (meRes.success && meRes.data) {
          const u: User = {
            id: meRes.data.id,
            name: meRes.data.name,
            email: meRes.data.email,
            role: meRes.data.role,
            coupleSlug: meRes.data.coupleSlug,
            coupleNames: meRes.data.name,
            isActive: meRes.data.isActive,
            createdAt: meRes.data.createdAt,
          };
          setCurrentUser(u);
          userRole = u.role;
          userCoupleSlug = u.coupleSlug;
        } else {
          clearAuthToken();
          setCurrentUser(null);
        }
      }

      // 2. Fetch live data for Admin, Couple, or Public
      if (token) {
        if (userRole === "admin") {
          const couplesRes = await api.admin.getCouples();
          if (couplesRes.success && Array.isArray(couplesRes.data)) {
            const parsed = couplesRes.data.map(parseCoupleFromBackend);
            setCouples(parsed);
          }

          const usersRes = await api.admin.getUsers();
          if (usersRes.success && Array.isArray(usersRes.data)) {
            setUsers(
              usersRes.data.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                coupleSlug: u.coupleSlug,
                coupleNames: u.name,
                isActive: u.isActive,
                createdAt: u.createdAt,
              }))
            );
          }

          const overviewRes = await api.admin.getOverview();
          if (overviewRes.success && overviewRes.data) {
            const s = overviewRes.data.stats || overviewRes.data;
            const count = Number(s.totalCouples) || 0;
            setStats({
              totalCouples: count,
              publishedInvitations: Number(s.publishedCouples) || 0,
              totalGuests: Number(s.totalGuests) || 0,
              totalRSVPs: Number(s.totalRSVPs) || 0,
              totalWishes: Number(s.totalWishes) || 0,
              activeRevenue: `Rp ${(count * 149000).toLocaleString("id-ID")}`,
              monthlyGrowthRate: `${count} Undangan`,
            });
          }
        } else if (userRole === "couple" && userCoupleSlug) {
          // Couple role: directly load own wedding details and gallery photos
          const [detailsRes, galleryRes] = await Promise.all([
            api.couple.getDetails(userCoupleSlug),
            api.couple.getGallery(userCoupleSlug),
          ]);

          if (detailsRes.success && detailsRes.data?.couple) {
            const parsed = parseCoupleFromBackend(detailsRes.data.couple);
            const galleryList = (galleryRes.success && Array.isArray(galleryRes.data) && galleryRes.data.length > 0)
              ? galleryRes.data
              : (Array.isArray(detailsRes.data.gallery) ? detailsRes.data.gallery : []);

            if (galleryList.length > 0) {
              parsed.galleryPhotos = galleryList.map((g: any) => ({
                id: g.id,
                url: g.url,
                caption: g.caption,
              }));
            }
            if (detailsRes.data.stats) {
              parsed.rsvpCount = {
                attending: detailsRes.data.stats.attendingCount || 0,
                tentative: detailsRes.data.stats.tentativeCount || 0,
                regret: detailsRes.data.stats.regretCount || 0,
                pending: detailsRes.data.stats.pendingCount || 0,
              };
              parsed.guestCount = detailsRes.data.stats.totalGuests || 0;
              parsed.wishesCount = detailsRes.data.stats.totalWishes || 0;
            }
            setCouples([parsed]);
          }
        }
      } else {
        // Public fallback for unauthenticated showcase
        const pubRes = await api.public.getInvitation("default");
        if (pubRes.success && pubRes.data?.couple) {
          const parsed = parseCoupleFromBackend(pubRes.data.couple);
          if (pubRes.data.gallery) {
            parsed.galleryPhotos = pubRes.data.gallery.map((g: any) => ({
              id: g.id,
              url: g.url,
              caption: g.caption,
            }));
          }
          setCouples([parsed]);
        } else {
          setCouples(INITIAL_COUPLES);
        }
      }
    } catch (err) {
      console.error("Failed to load backend data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load active couple's guests & wishes when activeSlug changes
  React.useEffect(() => {
    if (!activeSlug || activeSlug === "template") return;

    const loadCoupleData = async () => {
      try {
        const token = getAuthToken();

        if (token) {
          // Authenticated couple or admin
          const [detailsRes, guestsRes, wishesRes, galleryRes] = await Promise.all([
            api.couple.getDetails(activeSlug),
            api.couple.getGuests(activeSlug),
            api.couple.getWishes(activeSlug),
            api.couple.getGallery(activeSlug),
          ]);

          if (detailsRes.success && detailsRes.data?.couple) {
            const parsed = parseCoupleFromBackend(detailsRes.data.couple);
            const galleryList = (galleryRes.success && Array.isArray(galleryRes.data) && galleryRes.data.length > 0)
              ? galleryRes.data
              : (Array.isArray(detailsRes.data.gallery) ? detailsRes.data.gallery : []);

            if (galleryList.length > 0) {
              parsed.galleryPhotos = galleryList.map((g: any) => ({
                id: g.id,
                url: g.url,
                caption: g.caption,
              }));
            }
            if (detailsRes.data.stats) {
              parsed.rsvpCount = {
                attending: detailsRes.data.stats.attendingCount || 0,
                tentative: detailsRes.data.stats.tentativeCount || 0,
                regret: detailsRes.data.stats.regretCount || 0,
                pending: detailsRes.data.stats.pendingCount || 0,
              };
              parsed.guestCount = detailsRes.data.stats.totalGuests || 0;
              parsed.wishesCount = detailsRes.data.stats.totalWishes || 0;
            }
            setCouples((prev) => {
              const exists = prev.some((c) => c.slug === activeSlug);
              if (exists) {
                return prev.map((c) => (c.slug === activeSlug ? parsed : c));
              }
              return [parsed, ...prev];
            });
          }

          if (guestsRes.success && Array.isArray(guestsRes.data)) {
            setGuests(
              guestsRes.data.map((g: any) => ({
                id: g.id,
                coupleSlug: g.coupleSlug,
                name: g.name,
                phone: g.phone || "",
                category: g.category || "Sahabat",
                pax: g.pax || 1,
                rsvpStatus: g.rsvpStatus || "Pending",
                attended: g.attended || false,
                tableNumber: g.tableNumber || "",
                createdAt: g.createdAt || new Date().toISOString(),
              }))
            );
          }

          if (wishesRes.success && Array.isArray(wishesRes.data)) {
            setWishes(
              wishesRes.data.map((w: any) => ({
                id: w.id,
                coupleSlug: w.coupleSlug,
                name: w.guestName,
                relationship: w.relationship || "Tamu Undangan",
                message: w.message,
                attendance: w.attendingStatus?.toLowerCase().includes("tidak")
                  ? "not_attending"
                  : w.attendingStatus?.toLowerCase().includes("ragu")
                  ? "tentative"
                  : "attending",
                isPinned: w.isPinned || false,
                isApproved: true,
                reply: w.replies?.[0]?.message || w.reply,
                createdAt: w.createdAt || new Date().toISOString(),
              }))
            );
          }
        } else {
          // Public visitor loading invitation from database
          const pubRes = await api.public.getInvitation(activeSlug);
          if (pubRes.success && pubRes.data?.couple) {
            const parsed = parseCoupleFromBackend(pubRes.data.couple);
            if (pubRes.data.gallery && Array.isArray(pubRes.data.gallery)) {
              parsed.galleryPhotos = pubRes.data.gallery.map((g: any) => ({
                id: g.id,
                url: g.url,
                caption: g.caption,
              }));
            }
            setCouples((prev) => {
              const exists = prev.some((c) => c.slug === activeSlug);
              if (exists) {
                return prev.map((c) => (c.slug === activeSlug ? parsed : c));
              }
              return [parsed, ...prev];
            });

            if (pubRes.data.wishes && Array.isArray(pubRes.data.wishes)) {
              setWishes(
                pubRes.data.wishes.map((w: any) => ({
                  id: w.id,
                  coupleSlug: w.coupleSlug,
                  name: w.guestName,
                  relationship: w.relationship || "Tamu Undangan",
                  message: w.message,
                  attendance: w.attendingStatus?.toLowerCase().includes("tidak")
                    ? "not_attending"
                    : w.attendingStatus?.toLowerCase().includes("ragu")
                    ? "tentative"
                    : "attending",
                  isPinned: w.isPinned || false,
                  isApproved: true,
                  reply: w.replies?.[0]?.message || w.reply,
                  createdAt: w.createdAt || new Date().toISOString(),
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load couple scoped data:", err);
      }
    };

    loadCoupleData();
  }, [activeSlug]);

  const currentCouple = React.useMemo(() => {
    if (activeSlug && activeSlug !== "template") {
      const found = couples.find((c) => c.slug.toLowerCase() === activeSlug.toLowerCase());
      if (found) return found;
    }
    if (currentUser?.role === "couple" && currentUser.coupleSlug) {
      return couples.find((c) => c.slug.toLowerCase() === currentUser.coupleSlug?.toLowerCase()) || DEFAULT_TEMPLATE_COUPLE;
    }
    return couples.find((c) => c.slug === "template") || DEFAULT_TEMPLATE_COUPLE;
  }, [currentUser, couples, activeSlug]);

  const setActiveCoupleBySlug = React.useCallback((slug: string) => {
    setActiveSlug(slug);
  }, []);

  const login = React.useCallback(
    async (email: string, password?: string) => {
      const res = await api.auth.login(email, password || "");
      if (res.success && res.data) {
        const u: User = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          coupleSlug: res.data.user.coupleSlug,
          coupleNames: res.data.user.name,
          isActive: res.data.user.isActive,
          createdAt: res.data.user.createdAt,
        };

        setCurrentUser(u);

        let redirectUrl = "/dashboard";
        if (u.role === "couple" && u.coupleSlug) {
          redirectUrl = `/${u.coupleSlug}/dashboard`;
          setActiveSlug(u.coupleSlug);
        }

        await refreshData();
        navigate(redirectUrl);
        return { success: true, redirectUrl };
      }

      return {
        success: false,
        redirectUrl: "",
        message: res.message || "Email atau kata sandi salah",
      };
    },
    [navigate, refreshData]
  );

  const logout = React.useCallback(() => {
    api.auth.logout();
    setCurrentUser(null);
    navigate("/login");
  }, [navigate]);

  const switchUser = React.useCallback(
    async (userId: string) => {
      const found = users.find((u) => u.id === userId);
      if (found) {
        await login(found.email, "password123");
      }
    },
    [users, login]
  );

  const updateCouple = React.useCallback(
    async (slug: string, updates: Partial<CoupleProject>) => {
      const targetSlug = updates.slug || slug;

      // Optimistic update
      setCouples((prev) =>
        prev.map((c) => {
          if (c.slug === slug) {
            return {
              ...c,
              ...updates,
              galleryPhotos: updates.galleryPhotos !== undefined ? updates.galleryPhotos : c.galleryPhotos,
              heroPhotoIds: updates.heroPhotoIds !== undefined ? updates.heroPhotoIds : c.heroPhotoIds,
              storyPhotoIds: updates.storyPhotoIds !== undefined ? updates.storyPhotoIds : c.storyPhotoIds,
              storyChapters: updates.storyChapters !== undefined ? updates.storyChapters : c.storyChapters,
              bankAccounts: updates.bankAccounts !== undefined ? updates.bankAccounts : c.bankAccounts,
              slug: targetSlug,
            };
          }
          return c;
        })
      );

      const payload: any = { ...updates };
      if (updates.heroPhotoIds) payload.heroPhotoIds = JSON.stringify(updates.heroPhotoIds);
      if (updates.storyPhotoIds) payload.storyPhotoIds = JSON.stringify(updates.storyPhotoIds);
      if (updates.storyChapters) payload.storyChapters = JSON.stringify(updates.storyChapters);
      if (updates.bankAccounts) payload.bankAccounts = JSON.stringify(updates.bankAccounts);

      try {
        const res = await api.couple.updateDetails(slug, payload);
        if (res.success && res.data) {
          const rawCouple = res.data.couple || res.data;
          const parsed = parseCoupleFromBackend(rawCouple);
          if (res.data.gallery && Array.isArray(res.data.gallery)) {
            parsed.galleryPhotos = res.data.gallery.map((g: any) => ({
              id: g.id,
              url: g.url,
              caption: g.caption,
            }));
          }

          setCouples((prev) =>
            prev.map((c) => {
              if (c.slug === targetSlug || c.slug === slug) {
                return {
                  ...c,
                  ...parsed,
                  galleryPhotos:
                    updates.galleryPhotos ||
                    (parsed.galleryPhotos && parsed.galleryPhotos.length > 0 ? parsed.galleryPhotos : c.galleryPhotos),
                  heroPhotoIds:
                    updates.heroPhotoIds ||
                    (parsed.heroPhotoIds && parsed.heroPhotoIds.length > 0 ? parsed.heroPhotoIds : c.heroPhotoIds),
                  storyPhotoIds:
                    updates.storyPhotoIds ||
                    (parsed.storyPhotoIds && parsed.storyPhotoIds.length > 0 ? parsed.storyPhotoIds : c.storyPhotoIds),
                  storyChapters:
                    updates.storyChapters ||
                    (parsed.storyChapters && parsed.storyChapters.length > 0 ? parsed.storyChapters : c.storyChapters),
                  bankAccounts:
                    updates.bankAccounts ||
                    (parsed.bankAccounts && parsed.bankAccounts.length > 0 ? parsed.bankAccounts : c.bankAccounts),
                  ...updates,
                };
              }
              return c;
            })
          );
        }
      } catch (err) {
        console.error("Failed to update couple in backend:", err);
      }
    },
    []
  );


  const createCouple = React.useCallback(
    async (newCoupleData: Partial<CoupleProject>): Promise<CoupleProject> => {
      const slug = (newCoupleData.slug || newCoupleData.title || `couple-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const payload = {
        slug,
        title: newCoupleData.title || `The Wedding of ${newCoupleData.groomName} & ${newCoupleData.brideName}`,
        ownerEmail: newCoupleData.ownerEmail
          ? newCoupleData.ownerEmail.replace("@amora.io", "@ratival.com")
          : `${slug}@ratival.com`,
        groomName: newCoupleData.groomName || "Groom",
        brideName: newCoupleData.brideName || "Bride",
        weddingDate: newCoupleData.weddingDate || "2026-10-24",
        status: newCoupleData.status || "published",
        password: newCoupleData.password || "password123",
      };

      const res = await api.admin.createCouple(payload);
      if (res.success && res.data) {
        const coupleObj = res.data.couple || res.data;
        const created: any = parseCoupleFromBackend(coupleObj);
        if (res.data.credentials) {
          created.credentials = res.data.credentials;
        }
        await refreshData();
        return created;
      }

      throw new Error(res.message || "Gagal membuat undangan pasangan di database");
    },
    [refreshData]
  );

  const deleteCouple = React.useCallback(
    async (id: string) => {
      await api.admin.deleteCouple(id);
      setCouples((prev) => prev.filter((c) => c.id !== id));
      await refreshData();
    },
    [refreshData]
  );

  const addGuest = React.useCallback(
    async (guestData: Omit<Guest, "id" | "createdAt">) => {
      const res = await api.couple.createGuest(guestData.coupleSlug, {
        name: guestData.name,
        phone: guestData.phone,
        category: guestData.category,
        pax: guestData.pax,
        rsvpStatus: guestData.rsvpStatus,
        tableNumber: guestData.tableNumber,
      });

      if (res.success && res.data) {
        const newGuest: Guest = {
          id: res.data.id,
          coupleSlug: res.data.coupleSlug,
          name: res.data.name,
          phone: res.data.phone || "",
          category: res.data.category || "Sahabat",
          pax: res.data.pax || 1,
          rsvpStatus: res.data.rsvpStatus || "Pending",
          attended: res.data.attended || false,
          tableNumber: res.data.tableNumber || "",
          createdAt: res.data.createdAt,
        };
        setGuests((prev) => [newGuest, ...prev]);
      }
    },
    []
  );

  const updateGuest = React.useCallback(
    async (id: string, updates: Partial<Guest>) => {
      setGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      if (activeSlug) {
        await api.couple.updateGuest(activeSlug, id, updates);
      }
    },
    [activeSlug]
  );

  const deleteGuest = React.useCallback(
    async (id: string) => {
      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (activeSlug) {
        await api.couple.deleteGuest(activeSlug, id);
      }
    },
    [activeSlug]
  );

  const togglePinWish = React.useCallback(
    async (id: string) => {
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isPinned: !w.isPinned } : w))
      );
      if (activeSlug) {
        await api.couple.togglePinWish(activeSlug, id);
      }
    },
    [activeSlug]
  );

  const toggleApproveWish = React.useCallback((id: string) => {
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isApproved: !w.isApproved } : w))
    );
  }, []);

  const replyWish = React.useCallback(
    async (id: string, replyText: string) => {
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, reply: replyText } : w))
      );
      if (activeSlug) {
        await api.couple.replyWish(activeSlug, id, replyText);
      }
    },
    [activeSlug]
  );

  const deleteWish = React.useCallback(
    async (id: string) => {
      setWishes((prev) => prev.filter((w) => w.id !== id));
      if (activeSlug) {
        await api.couple.deleteWish(activeSlug, id);
      }
    },
    [activeSlug]
  );

  const createUser = React.useCallback(
    async (userData: { name: string; email: string; password: string; role: string; coupleSlug?: string }): Promise<User> => {
      const res = await api.admin.createUser(userData);
      if (res.success && res.data) {
        const u: User = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          coupleSlug: res.data.coupleSlug,
          coupleNames: res.data.name,
          isActive: res.data.isActive,
          createdAt: res.data.createdAt,
        };
        setUsers((prev) => [u, ...prev]);
        await refreshData();
        return u;
      }
      throw new Error(res.message || "Gagal menambahkan pengguna");
    },
    [refreshData]
  );

  const updateUser = React.useCallback(
    async (id: string, userData: Partial<User> & { password?: string }): Promise<User> => {
      const res = await api.admin.updateUser(id, userData);
      if (res.success && res.data) {
        const u: User = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          coupleSlug: res.data.coupleSlug,
          coupleNames: res.data.name,
          isActive: res.data.isActive,
          createdAt: res.data.createdAt,
        };
        setUsers((prev) => prev.map((user) => (user.id === id ? u : user)));
        await refreshData();
        return u;
      }
      throw new Error(res.message || "Gagal memperbarui pengguna");
    },
    [refreshData]
  );

  const deleteUser = React.useCallback(
    async (id: string) => {
      const res = await api.admin.deleteUser(id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        await refreshData();
      } else {
        throw new Error(res.message || "Gagal menghapus pengguna");
      }
    },
    [refreshData]
  );

  const hasPermission = React.useCallback(
    (permissionKey: string, action: "view" | "create" | "update" | "delete" | "audit" = "view") => {
      if (!currentUser) return false;
      if (currentUser.role === "admin" || currentUser.role === "superadmin") {
        if (!currentUser.permissions) return true;
        const p = currentUser.permissions[permissionKey];
        if (!p) return true;
        return p[action] === true;
      }
      return false;
    },
    [currentUser]
  );

  const value = React.useMemo(
    () => ({
      currentUser,
      currentCouple,
      couples,
      guests,
      wishes,
      templates,
      plans,
      stats,
      users,
      isLoading,
      login,
      logout,
      switchUser,
      setActiveCoupleBySlug,
      updateCouple,
      createCouple,
      deleteCouple,
      addGuest,
      updateGuest,
      deleteGuest,
      togglePinWish,
      toggleApproveWish,
      replyWish,
      deleteWish,
      createUser,
      updateUser,
      deleteUser,
      hasPermission,
      refreshData,
    }),
    [
      currentUser,
      currentCouple,
      couples,
      guests,
      wishes,
      templates,
      plans,
      stats,
      users,
      isLoading,
      login,
      logout,
      switchUser,
      setActiveCoupleBySlug,
      updateCouple,
      createCouple,
      deleteCouple,
      addGuest,
      updateGuest,
      deleteGuest,
      togglePinWish,
      toggleApproveWish,
      replyWish,
      deleteWish,
      createUser,
      updateUser,
      deleteUser,
      hasPermission,
      refreshData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
