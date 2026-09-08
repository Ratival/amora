export interface MenuItem {
  title: string;
  href: string;
  icon: string;
  permissionKey?: string;
  badge?: string;
  items?: Array<{
    title: string;
    href: string;
    permissionKey?: string;
  }>;
}

// Menu for Platform Admin Dashboard (/dashboard/*)
export const ADMIN_DASHBOARD_MENU: MenuItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: "LayoutDashboard",
    permissionKey: "overview",
  },
  {
    title: "Pasangan & Undangan",
    href: "/dashboard/couples",
    icon: "HeartHandshake",
    permissionKey: "couples",
  },
  {
    title: "Tema & Template",
    href: "/dashboard/templates",
    icon: "Palette",
    permissionKey: "templates",
  },
];

export const ADMIN_SETTINGS_MENU: MenuItem[] = [
  {
    title: "Pengguna",
    href: "/dashboard/users",
    icon: "Users",
    permissionKey: "users",
  },
  {
    title: "Hak Akses & Role",
    href: "/dashboard/roles",
    icon: "ShieldCheck",
    permissionKey: "roles",
  },
  {
    title: "Pengaturan Platform",
    href: "/dashboard/settings",
    icon: "Settings",
    permissionKey: "settings",
  },
];

// Menu for Couple Dashboard (/:slug/dashboard/* e.g. /arya-siti/dashboard/*)
export const COUPLE_DASHBOARD_MENU: MenuItem[] = [
  {
    title: "Ringkasan",
    href: "/:slug/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Mempelai & Acara",
    href: "/:slug/dashboard/event",
    icon: "CalendarHeart",
  },
  {
    title: "Tema & Desain",
    href: "/:slug/dashboard/theme",
    icon: "Palette",
  },
  {
    title: "Daftar Tamu & RSVP",
    href: "/:slug/dashboard/guests",
    icon: "Users",
  },
  {
    title: "Ucapan & Doa",
    href: "/:slug/dashboard/wishes",
    icon: "MessageSquareHeart",
  },
  {
    title: "Galeri & Musik",
    href: "/:slug/dashboard/gallery",
    icon: "Images",
  },
  {
    title: "Pengaturan Undangan",
    href: "/:slug/dashboard/settings",
    icon: "Settings",
  },
];

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const envUrl = typeof process !== "undefined" && process.env?.VITE_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return "http://localhost:5173";
}

export function getAppDomain(): string {
  if (typeof window !== "undefined" && window.location?.host) {
    return window.location.host;
  }
  return getAppBaseUrl().replace(/^https?:\/\//, "");
}

