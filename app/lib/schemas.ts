import { z } from "zod";

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  coupleSlug: z.string().optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// 2. Couple Event & Profile Schema
export const coupleEventSchema = z.object({
  groomName: z.string().min(1, "Nama mempelai pria wajib diisi"),
  groomParents: z.string().optional(),
  groomInstagram: z.string().optional(),
  brideName: z.string().min(1, "Nama mempelai wanita wajib diisi"),
  brideParents: z.string().optional(),
  brideInstagram: z.string().optional(),
  weddingDate: z.string().min(1, "Tanggal pernikahan utama wajib diisi"),
  akadDate: z.string().min(1, "Tanggal akad wajib diisi"),
  akadTime: z.string().min(1, "Waktu akad wajib diisi"),
  akadVenue: z.string().min(1, "Tempat akad wajib diisi"),
  akadAddress: z.string().min(1, "Alamat akad wajib diisi"),
  akadMapsUrl: z.string().optional(),
  resepsiDate: z.string().min(1, "Tanggal resepsi wajib diisi"),
  resepsiTime: z.string().min(1, "Waktu resepsi wajib diisi"),
  resepsiVenue: z.string().min(1, "Tempat resepsi wajib diisi"),
  resepsiAddress: z.string().min(1, "Alamat resepsi wajib diisi"),
  resepsiMapsUrl: z.string().optional(),
  liveStreamUrl: z.string().optional(),
  storyQuote: z.string().min(5, "Kutipan pernikahan minimal 5 karakter"),
});

export type CoupleEventFormData = z.infer<typeof coupleEventSchema>;

// 3. Guest Schema
export const guestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  phone: z.string().optional(),
  category: z.enum(["VIP", "Keluarga", "Sahabat", "Rekan Kerja", "Umum"]),
  pax: z.number().min(1, "Jumlah pax minimal 1").max(10, "Maksimal 10 pax"),
  rsvpStatus: z.enum(["Attending", "Tentative", "Regret", "Pending"]),
  tableNumber: z.string().optional(),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// 4. Public Wish Schema
export const publicWishSchema = z.object({
  guestName: z.string().min(2, "Nama pengirim minimal 2 karakter"),
  message: z.string().min(3, "Pesan doa minimal 3 karakter"),
  attendingStatus: z.enum(["hadir", "tidak_hadir", "ragu"]),
});

export type PublicWishFormData = z.infer<typeof publicWishSchema>;
