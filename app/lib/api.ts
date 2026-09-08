// Typed API client for Amora Go/PostgreSQL Backend

export const API_HOST_URL =
  (typeof window !== "undefined" && (window as any).__AMORA_API_URL__) ||
  (import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL : "") ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? window.location.origin
    : "http://localhost:8080");

export const API_BASE_URL = API_HOST_URL.endsWith("/api/v1")
  ? API_HOST_URL
  : `${API_HOST_URL.replace(/\/+$/, "")}/api/v1`;

export function getFileUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return "";
  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://") ||
    pathOrUrl.startsWith("data:") ||
    pathOrUrl.startsWith("blob:")
  ) {
    return pathOrUrl;
  }
  let cleanPath = pathOrUrl.trim();
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  // Static local public assets served directly by frontend Vite
  if (
    cleanPath === "/shape_of_my_heart.mp3" ||
    cleanPath.endsWith(".mp3") ||
    cleanPath.startsWith("/assets/") ||
    cleanPath.startsWith("/images/")
  ) {
    if (!cleanPath.startsWith("/uploads/")) {
      return cleanPath;
    }
  }

  if (
    !cleanPath.startsWith("/uploads") &&
    !cleanPath.startsWith("/api")
  ) {
    cleanPath = `/uploads${cleanPath}`;
  }
  const base = API_HOST_URL.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  return `${base}${cleanPath}`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("amora_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("amora_token", token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("amora_token");
  localStorage.removeItem("amora_user_id");
}


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: json?.message || json?.error || `HTTP Error ${res.status}`,
        error: json?.error,
      };
    }

    // Backend responds with { success: true, data: ..., message: ... }
    return {
      success: true,
      data: json?.data !== undefined ? json.data : (json as T),
      message: json?.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal terhubung ke backend server",
    };
  }
}

export const api = {
  // 1. Auth Endpoints
  auth: {
    login: async (email: string, password?: string) => {
      const res = await request<{
        token: string;
        refreshToken: string;
        user: any;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: password || "password123" }),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },
    register: async (payload: { name: string; email: string; password?: string; coupleSlug?: string }) => {
      const res = await request<{
        token: string;
        refreshToken: string;
        user: any;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          password: payload.password || "password123",
        }),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },
    me: async () => {
      return request<any>("/auth/me");
    },
    logout: () => {
      clearAuthToken();
    },
  },

  // 2. Admin Endpoints
  admin: {
    getOverview: async () => {
      return request<any>("/admin/overview");
    },
    getCouples: async () => {
      return request<any[]>("/admin/couples");
    },
    createCouple: async (payload: any) => {
      return request<any>("/admin/couples", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    deleteCouple: async (id: string) => {
      return request<any>(`/admin/couples/${id}`, {
        method: "DELETE",
      });
    },
    getUsers: async () => {
      return request<any[]>("/admin/users");
    },
    createUser: async (payload: any) => {
      return request<any>("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateUser: async (id: string, payload: any) => {
      return request<any>(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteUser: async (id: string) => {
      return request<any>(`/admin/users/${id}`, {
        method: "DELETE",
      });
    },
    getSettings: async () => {
      return request<any>("/admin/settings");
    },
    updateSettings: async (payload: any) => {
      return request<any>("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
  },

  // 3. Couple Dashboard Endpoints (Scoped to Couple Slug)
  couple: {
    getDetails: async (slug: string) => {
      return request<{ couple: any; stats: any }>(`/couples/${slug}`);
    },
    updateDetails: async (slug: string, payload: any) => {
      return request<any>(`/couples/${slug}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    // Guests
    getGuests: async (slug: string) => {
      return request<any[]>(`/couples/${slug}/guests`);
    },
    createGuest: async (slug: string, payload: any) => {
      return request<any>(`/couples/${slug}/guests`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateGuest: async (slug: string, id: string, payload: any) => {
      return request<any>(`/couples/${slug}/guests/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteGuest: async (slug: string, id: string) => {
      return request<any>(`/couples/${slug}/guests/${id}`, {
        method: "DELETE",
      });
    },
    toggleCheckIn: async (slug: string, id: string) => {
      return request<any>(`/couples/${slug}/guests/${id}/checkin`, {
        method: "POST",
      });
    },
    // Wishes
    getWishes: async (slug: string) => {
      return request<any[]>(`/couples/${slug}/wishes`);
    },
    togglePinWish: async (slug: string, id: string) => {
      return request<any>(`/couples/${slug}/wishes/${id}/pin`, {
        method: "PUT",
      });
    },
    replyWish: async (slug: string, id: string, replyText: string) => {
      return request<any>(`/couples/${slug}/wishes/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: replyText }),
      });
    },
    deleteWish: async (slug: string, id: string) => {
      return request<any>(`/couples/${slug}/wishes/${id}`, {
        method: "DELETE",
      });
    },
    // Gallery
    getGallery: async (slug: string) => {
      return request<any[]>(`/couples/${slug}/gallery`);
    },
    addGalleryPhoto: async (slug: string, payload: { url: string; caption?: string; order?: number }) => {
      return request<any>(`/couples/${slug}/gallery`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateGalleryPhoto: async (slug: string, id: string, payload: { caption?: string; order?: number }) => {
      return request<any>(`/couples/${slug}/gallery/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteGalleryPhoto: async (slug: string, id: string) => {
      return request<any>(`/couples/${slug}/gallery/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 4. File Upload Endpoints
  files: {
    upload: async (file: File, slug?: string) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);
      if (slug) {
        formData.append("slug", slug);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/files/upload`, {
          method: "POST",
          headers,
          body: formData,
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          return {
            success: false,
            message: json?.message || json?.error || `Upload gagal (${res.status})`,
          };
        }

        const data = json?.data || json;
        return {
          success: true,
          data: {
            ...data,
            url: data?.path || data?.url,
          },
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Gagal mengunggah file ke server",
        };
      }
    },
  },

  // 5. Public Invitation Endpoints
  public: {
    getInvitation: async (slug: string) => {
      return request<{ couple: any; gallery: any[]; wishes: any[] }>(`/public/invitation/${slug}`);
    },
    submitRSVP: async (slug: string, payload: { name: string; phone?: string; rsvpStatus: string; pax?: number; message?: string }) => {
      return request<any>(`/public/invitation/${slug}/rsvp`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    submitWish: async (slug: string, payload: { guestName: string; relationship?: string; message: string; attendingStatus?: string }) => {
      return request<any>(`/public/invitation/${slug}/wishes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getWishes: async (slug: string) => {
      return request<any[]>(`/public/invitation/${slug}/wishes`);
    },
  },
};
