import * as React from "react";
import { useParams } from "react-router";
import {
  Images,
  Music,
  Plus,
  Trash2,
  Play,
  Pause,
  Save,
  Check,
  Sparkles,
  BookOpen,
  LayoutGrid,
  Upload,
  FileAudio,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  X,
  Volume2,
  VolumeX,
  Disc,
  RotateCcw,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { api, getFileUrl } from "~/lib/api";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useAuth } from "~/contexts/auth-context";
import { toast } from "sonner";
import type { StoryChapter } from "~/types/dashboard";

const MAX_PHOTOS = 15;

const HERO_SLOTS = [
  { index: 0, label: "Hero Utama (Tengah)", desc: "Foto potret utama yang muncul di tengah layar saat pertama kali dibuka." },
  { index: 1, label: "Sudut Kiri Atas", desc: "Foto floating di pojok kiri atas saat scroll animasi." },
  { index: 2, label: "Sudut Kiri Bawah", desc: "Foto floating bernuansa artistik di pojok kiri bawah." },
  { index: 3, label: "Sudut Kanan Atas", desc: "Foto floating di pojok kanan atas." },
  { index: 4, label: "Sudut Kanan Bawah", desc: "Foto floating di pojok kanan bawah." },
];

const STORY_CHAPTERS = [
  {
    chapter: 1,
    roman: "I",
    phaseBadge: "Chapter I",
    phaseSub: "The First Encounter",
    defaultTitle: "Chapter One: The First Encounter",
    defaultDesc:
      "In the most unplanned, the-universe-has-a-sense-of-humor way — paths crossed, moments collided, and somehow it felt like the universe had been waiting for this moment all along.",
    slots: [
      { index: 0, slotNum: 1, defaultCaption: "First time we hung out", label: "Foto 1" },
      { index: 1, slotNum: 2, defaultCaption: "That one on campus", label: "Foto 2" },
      { index: 2, slotNum: 3, defaultCaption: "A random Tuesday", label: "Foto 3" },
    ],
  },
  {
    chapter: 2,
    roman: "II",
    phaseBadge: "Chapter II",
    phaseSub: "Growing Together",
    defaultTitle: "Chapter Two: Growing Together",
    defaultDesc:
      "Two cities, late-night video calls, spontaneous visits, shared playlists, and a trail of little moments that made the hard days feel lighter.",
    slots: [
      { index: 3, slotNum: 4, defaultCaption: "A favorite city corner", label: "Foto 4" },
      { index: 4, slotNum: 5, defaultCaption: "Weekend walks, shared dreams", label: "Foto 5" },
      { index: 5, slotNum: 6, defaultCaption: "Adventures that brought us closer", label: "Foto 6" },
    ],
  },
  {
    chapter: 3,
    roman: "III",
    phaseBadge: "Chapter III",
    phaseSub: "Ready for Forever",
    defaultTitle: "Chapter Three: Ready for Forever",
    defaultDesc:
      "A quiet moment, a gentle question, and suddenly the future we'd been imagining became something real — a forever kind of thing.",
    slots: [
      { index: 6, slotNum: 7, defaultCaption: "Everything felt right", label: "Foto 7" },
      { index: 7, slotNum: 8, defaultCaption: "Counting days together", label: "Foto 8" },
      { index: 8, slotNum: 9, defaultCaption: "Ready for forever", label: "Foto 9" },
    ],
  },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function CoupleGalleryPage() {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { couples, currentCouple, updateCouple, setActiveCoupleBySlug } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"hero" | "story" | "gallery" | "music">("hero");

  const activeSlug = routeSlug || currentCouple?.slug || "template";
  const couple = couples.find((c) => c.slug === activeSlug) || currentCouple;

  // Audio State
  const [musicTitle, setMusicTitle] = React.useState(couple?.musicTitle || "");
  const [musicArtist, setMusicArtist] = React.useState(couple?.musicArtist || "");
  const [musicUrl, setMusicUrl] = React.useState(couple?.musicUrl || "");
  const [audioMeta, setAudioMeta] = React.useState<{ name?: string; size?: number; type?: string } | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = React.useState(false);
  const [isAudioDragging, setIsAudioDragging] = React.useState(false);

  // Photo state
  const [addPhotoOpen, setAddPhotoOpen] = React.useState(false);
  const [photoUploadTab, setPhotoUploadTab] = React.useState<"file" | "url">("file");
  const [deletingPhoto, setDeletingPhoto] = React.useState<{ id: string; caption?: string } | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = React.useState("");
  const [newPhotoCaption, setNewPhotoCaption] = React.useState("");
  const [selectedPhotoFile, setSelectedPhotoFile] = React.useState<{ name: string; size: number; type: string } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [isPhotoDragging, setIsPhotoDragging] = React.useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = React.useState(false);
  const [isBatchUploading, setIsBatchUploading] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState<{ current: number; total: number } | null>(null);
  const photoFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Photo slot picker state
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerTarget, setPickerTarget] = React.useState<{ type: "hero" | "story"; slotIndex: number } | null>(null);

  const photos = couple?.galleryPhotos || [];
  const heroPhotoIds = couple?.heroPhotoIds || [];
  const storyPhotoIds = couple?.storyPhotoIds || [];

  // 3 Story Chapters State
  const [chaptersData, setChaptersData] = React.useState<StoryChapter[]>(() => {
    if (currentCouple?.storyChapters && currentCouple.storyChapters.length === 3) {
      return currentCouple.storyChapters;
    }
    return STORY_CHAPTERS.map((c) => ({
      id: c.chapter,
      title: c.defaultTitle,
      description: c.defaultDesc,
    }));
  });

  // Audio event listeners for duration / progress
  React.useEffect(() => {
    if (!musicUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setIsPlaying(false);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      return;
    }

    const fullAudioUrl = getFileUrl(musicUrl);
    const audio = new Audio(fullAudioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || 0);
    };
    const handleTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioCurrentTime(0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: any) => {
      console.warn("Audio loading error for URL:", fullAudioUrl, e);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [musicUrl]);

  // Fetch fresh gallery photos on mount or when activeSlug changes
  React.useEffect(() => {
    if (!activeSlug) return;
    setActiveCoupleBySlug(activeSlug);

    let isMounted = true;
    Promise.all([
      api.couple.getGallery(activeSlug),
      api.couple.getDetails(activeSlug),
    ]).then(([galleryRes, detailsRes]) => {
      if (!isMounted) return;
      const galleryList = (galleryRes.success && Array.isArray(galleryRes.data) && galleryRes.data.length > 0)
        ? galleryRes.data
        : (detailsRes.success && Array.isArray(detailsRes.data?.gallery) ? detailsRes.data.gallery : []);

      if (galleryList.length > 0) {
        const fetchedPhotos = galleryList.map((g: any) => ({
          id: g.id,
          url: g.url,
          caption: g.caption,
        }));
        updateCouple(activeSlug, {
          galleryPhotos: fetchedPhotos,
        });
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeSlug, setActiveCoupleBySlug]);

  // Sync chaptersData when couple changes
  React.useEffect(() => {
    if (couple?.storyChapters && couple.storyChapters.length === 3) {
      setChaptersData(couple.storyChapters);
    }
  }, [couple?.storyChapters]);

  const handleUpdateChapter = (chapterId: number, field: "title" | "description", value: string) => {
    const updated = chaptersData.map((c) => (c.id === chapterId ? { ...c, [field]: value } : c));
    setChaptersData(updated);
  };

  const handleSaveChapter = (chapterId: number, field: "title" | "description", value: string) => {
    if (!couple) return;
    const updated = chaptersData.map((c) => (c.id === chapterId ? { ...c, [field]: value } : c));
    setChaptersData(updated);
    updateCouple(couple.slug, { storyChapters: updated, galleryPhotos: photos });
  };

  const handleSaveAllChapters = () => {
    if (!couple) return;
    const currentStoryIds = Array.from({ length: 9 }).map((_, i) => {
      const assignedId = storyPhotoIds[i];
      if (assignedId === "UNASSIGNED") return "UNASSIGNED";
      const found = assignedId ? photos.find((p) => p.id === assignedId) : null;
      return found?.id || photos[i]?.id || "";
    });

    updateCouple(couple.slug, {
      storyChapters: chaptersData,
      storyPhotoIds: currentStoryIds,
      galleryPhotos: photos,
    });
    toast.success("Semua bab Our Story & keterangan foto berhasil disimpan!");
  };

  // Audio Upload Processor (Works with file picker and drag & drop)
  const processAudioFile = async (file: File) => {
    if (!file) return;

    // Validate strictly MP3
    const isMp3 =
      file.name.toLowerCase().endsWith(".mp3") ||
      file.type === "audio/mpeg" ||
      file.type === "audio/mp3" ||
      file.type === "audio/x-mp3";

    if (!isMp3) {
      toast.error("Format file tidak didukung", {
        description: "Hanya file audio berformat .mp3 yang diperbolehkan.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas", {
        description: "Maksimal ukuran file audio adalah 50MB.",
      });
      return;
    }

    setIsUploadingAudio(true);
    const cleanName = file.name.replace(/\.mp3$/i, "").replace(/[-_+]/g, " ").trim();
    setAudioMeta({
      name: file.name,
      size: file.size,
      type: "Audio MP3",
    });

    const toastId = toast.loading("Mengunggah & memproses audio MP3...");

    try {
      const res = await api.files.upload(file, couple?.slug);

      if (res.success && res.data?.url) {
        const uploadedUrl = res.data.url;
        setMusicUrl(uploadedUrl);
        if (!musicTitle) setMusicTitle(cleanName);

        toast.success("File Audio MP3 Berhasil Diunggah!", {
          id: toastId,
          description: file.name,
        });
      } else {
        const objectUrl = URL.createObjectURL(file);
        setMusicUrl(objectUrl);
        if (!musicTitle) setMusicTitle(cleanName);

        toast.success("File Audio MP3 Siap Digunakan!", {
          id: toastId,
          description: file.name,
        });
      }
    } catch {
      const objectUrl = URL.createObjectURL(file);
      setMusicUrl(objectUrl);
      if (!musicTitle) setMusicTitle(cleanName);
      toast.success("File Audio MP3 Siap Digunakan!", { id: toastId });
    } finally {
      setIsUploadingAudio(false);
      setIsAudioDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudioFile(file);
  };

  // Photo Upload Processor for modal (Single file with rich preview)
  const processPhotoFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file tidak didukung", {
        description: "Hanya file gambar (JPG, PNG, WebP, GIF) yang diperbolehkan.",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ukuran gambar melebihi batas", {
        description: "Maksimal ukuran file foto adalah 20MB.",
      });
      return;
    }

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_+]/g, " ").trim();
    const ext = file.name.split(".").pop()?.toUpperCase() || "IMG";
    setSelectedPhotoFile({
      name: file.name,
      size: file.size,
      type: ext,
    });

    // Instant local preview
    const localBlobUrl = URL.createObjectURL(file);
    setNewPhotoUrl(localBlobUrl);
    if (!newPhotoCaption) {
      setNewPhotoCaption(nameWithoutExt);
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("Mengunggah foto...");

    try {
      const res = await api.files.upload(file, couple?.slug);

      if (res.success && res.data?.url) {
        setNewPhotoUrl(res.data.url);
        toast.success("Foto berhasil diunggah!", { id: toastId });
      } else {
        toast.success("Foto siap ditambahkan!", { id: toastId });
      }
    } catch {
      toast.success("Foto siap ditambahkan!", { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
      setIsPhotoDragging(false);
      if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    }
  };

  // Batch Image Upload for Gallery dropzone (Multiple files)
  const handleBatchImageUpload = async (files: FileList | File[]) => {
    if (!couple || !files.length) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`Maksimal ${MAX_PHOTOS} foto telah tercapai. Hapus foto lama terlebih dahulu.`);
      return;
    }

    const fileList = Array.from(files).slice(0, remainingSlots);
    const validImageFiles = fileList.filter((f) => f.type.startsWith("image/"));

    if (validImageFiles.length === 0) {
      toast.error("Format file tidak didukung", {
        description: "Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.",
      });
      return;
    }

    setIsBatchUploading(true);
    setBatchProgress({ current: 0, total: validImageFiles.length });
    const toastId = toast.loading(`Mengunggah ${validImageFiles.length} foto ke galeri...`);
    const newPhotosToAdd: { id: string; url: string; caption: string }[] = [];

    for (let i = 0; i < validImageFiles.length; i++) {
      const file = validImageFiles[i];
      setBatchProgress({ current: i + 1, total: validImageFiles.length });
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_+]/g, " ").trim();
      try {
        const uploadRes = await api.files.upload(file, couple.slug);
        if (uploadRes.success && uploadRes.data?.url) {
          const photoUrl = uploadRes.data.url;
          // Store directly into PostgreSQL gallery_photos table
          const dbRes = await api.couple.addGalleryPhoto(couple.slug, {
            url: photoUrl,
            caption: nameWithoutExt,
            order: photos.length + newPhotosToAdd.length,
          });

          if (dbRes.success && dbRes.data) {
            newPhotosToAdd.push({
              id: dbRes.data.id || `g-${Date.now()}-${i}`,
              url: dbRes.data.url || photoUrl,
              caption: dbRes.data.caption || nameWithoutExt,
            });
            continue;
          }

          newPhotosToAdd.push({
            id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            url: photoUrl,
            caption: nameWithoutExt,
          });
          continue;
        }
      } catch (err) {
        console.error("Failed to upload photo:", err);
      }

      // Local fallback
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newPhotosToAdd.push({
        id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        url: dataUrl,
        caption: nameWithoutExt,
      });
    }

    if (newPhotosToAdd.length > 0) {
      updateCouple(couple.slug, {
        galleryPhotos: [...photos, ...newPhotosToAdd],
      });
      toast.success(`${newPhotosToAdd.length} Foto Berhasil Disimpan ke Galeri!`, { id: toastId });
    } else {
      toast.error("Gagal mengunggah foto", { id: toastId });
    }

    setIsBatchUploading(false);
    setBatchProgress(null);
  };

  const handleSaveMusic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couple) return;
    updateCouple(couple.slug, { musicTitle, musicArtist, musicUrl });
    toast.success("Pengaturan Musik Berhasil Disimpan!");
  };

  const handleTogglePlay = () => {
    if (!musicUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => toast.error("Tidak dapat memutar file audio"));
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = Number(e.target.value);
    audioRef.current.currentTime = seekTime;
    setAudioCurrentTime(seekTime);
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl || !couple) return;

    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maksimal ${MAX_PHOTOS} foto telah tercapai. Hapus foto lama terlebih dahulu.`);
      return;
    }

    let photoId = `g-${Date.now()}`;
    const caption = newPhotoCaption || "Prewedding Photo";

    try {
      // Save directly to database table
      const res = await api.couple.addGalleryPhoto(couple.slug, {
        url: newPhotoUrl,
        caption,
        order: photos.length,
      });
      if (res.success && res.data?.id) {
        photoId = res.data.id;
      }
    } catch (err) {
      console.error("Failed to add gallery photo to DB:", err);
    }

    const newPhoto = {
      id: photoId,
      url: newPhotoUrl,
      caption,
    };

    updateCouple(couple.slug, {
      galleryPhotos: [...photos, newPhoto],
    });

    toast.success("Foto Prewedding Berhasil Disimpan ke Galeri!");
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setSelectedPhotoFile(null);
    setAddPhotoOpen(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!couple) return;

    try {
      await api.couple.deleteGalleryPhoto(couple.slug, photoId);
    } catch (err) {
      console.error("Failed to delete photo from DB:", err);
    }

    const updatedPhotos = photos.filter((p) => p.id !== photoId);
    const updatedHero = heroPhotoIds.map((id) => (id === photoId ? "" : id));
    const updatedStory = storyPhotoIds.map((id) => (id === photoId ? "" : id));

    updateCouple(couple.slug, {
      galleryPhotos: updatedPhotos,
      heroPhotoIds: updatedHero,
      storyPhotoIds: updatedStory,
    });
    toast.success("Foto berhasil dihapus dari album");
  };


  const openPicker = (type: "hero" | "story", slotIndex: number) => {
    setPickerTarget({ type, slotIndex });
    setPickerOpen(true);
  };

  const handleSelectPhotoForSlot = (photoId: string) => {
    if (!couple || !pickerTarget) return;

    if (pickerTarget.type === "hero") {
      const newHero = [...heroPhotoIds];
      while (newHero.length <= pickerTarget.slotIndex) newHero.push("");
      newHero[pickerTarget.slotIndex] = photoId;
      updateCouple(couple.slug, { heroPhotoIds: newHero, galleryPhotos: photos });
      toast.success(`Foto berhasil dipasang di Hero Slot #${pickerTarget.slotIndex + 1}!`);
    } else {
      const newStory = [...storyPhotoIds];
      while (newStory.length <= pickerTarget.slotIndex) newStory.push("");
      newStory[pickerTarget.slotIndex] = photoId;
      updateCouple(couple.slug, { storyPhotoIds: newStory, galleryPhotos: photos });
      toast.success(`Foto berhasil dipasang di Our Story Slot #${pickerTarget.slotIndex + 1}!`);
    }

    setPickerOpen(false);
    setPickerTarget(null);
  };

  const handleUnassignSlot = (type: "hero" | "story", slotIndex: number) => {
    if (!couple) return;
    if (type === "hero") {
      const newHero = [...heroPhotoIds];
      while (newHero.length <= slotIndex) newHero.push("");
      newHero[slotIndex] = "UNASSIGNED";
      updateCouple(couple.slug, { heroPhotoIds: newHero, galleryPhotos: photos });
      toast.success(`Foto di Hero Slot #${slotIndex + 1} dilepas`);
    } else {
      const newStory = [...storyPhotoIds];
      while (newStory.length <= slotIndex) newStory.push("");
      newStory[slotIndex] = "UNASSIGNED";
      updateCouple(couple.slug, { storyPhotoIds: newStory, galleryPhotos: photos });
      toast.success(`Foto di Our Story Slot #${slotIndex + 1} dilepas`);
    }
  };

  const handleAutofillStorySlots = () => {
    if (!couple) return;
    if (photos.length === 0) {
      toast.error("Belum ada foto di album galeri. Unggah foto ke galeri terlebih dahulu!");
      return;
    }
    const newStory = Array.from({ length: 9 }).map((_, i) => photos[i]?.id || "");
    updateCouple(couple.slug, { storyPhotoIds: newStory, galleryPhotos: photos });
    toast.success("Foto Our Story berhasil diisi otomatis dari galeri!");
  };

  const handleUpdateCaption = async (photoId: string, newCaption: string) => {
    if (!couple || !photoId) return;
    const updated = photos.map((p) => (p.id === photoId ? { ...p, caption: newCaption } : p));
    updateCouple(couple.slug, { galleryPhotos: updated });

    try {
      await api.couple.updateGalleryPhoto(couple.slug, photoId, { caption: newCaption });
      toast.success("Keterangan foto berhasil disimpan");
    } catch (err) {
      console.error("Failed to update photo caption in DB:", err);
    }
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Galeri Foto & Musik Latar"
        description="Pilih 5 foto untuk halaman utama, 9 foto untuk Our Story, dan kelola semua album galeri (maksimal 15 foto)."
      />

      <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-5 w-full">
        {/* Top Status and Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={activeTab === "hero" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("hero")}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-md shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>5 Foto Halaman Utama</span>
            </Button>
            <Button
              variant={activeTab === "story" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("story")}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-md shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>9 Foto Our Story</span>
            </Button>
            <Button
              variant={activeTab === "gallery" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("gallery")}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-md shrink-0"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Semua Galeri ({photos.length}/{MAX_PHOTOS})</span>
            </Button>
            <Button
              variant={activeTab === "music" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("music")}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-md shrink-0"
            >
              <Music className="h-3.5 w-3.5" />
              <span>Musik</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/80">
              {photos.length} / {MAX_PHOTOS} Foto
            </span>
            <Button
              size="sm"
              onClick={() => {
                setSelectedPhotoFile(null);
                setNewPhotoUrl("");
                setNewPhotoCaption("");
                setAddPhotoOpen(true);
              }}
              disabled={photos.length >= MAX_PHOTOS}
              className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Foto</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: 5 FOTO HALAMAN UTAMA */}
        {activeTab === "hero" && (
          <div className="space-y-4">
            <Card className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="p-5 pb-4 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pilih 5 Foto Halaman Utama (Opening & Side Floating)
                </CardTitle>
                <CardDescription className="text-xs">
                  Foto-foto ini akan membentuk komposisi sinematik halaman pertama saat undangan dibuka oleh para tamu.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {HERO_SLOTS.map((slot) => {
                    const assignedId = heroPhotoIds[slot.index];
                    const photoById = assignedId && assignedId !== "UNASSIGNED" ? photos.find((p) => p.id === assignedId) : null;
                    const assignedPhoto = photoById || (assignedId !== "UNASSIGNED" ? photos[slot.index] : null);

                    return (
                      <div
                        key={slot.index}
                        className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                          slot.index === 0
                            ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 lg:col-span-1"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-foreground">
                              Slot #{slot.index + 1}
                            </span>
                            {slot.index === 0 && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                Hero Utama
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-foreground">{slot.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug">{slot.desc}</p>
                        </div>

                        <div className="my-3 aspect-4/5 rounded-md overflow-hidden bg-muted border border-border relative group shadow-2xs">
                          {assignedPhoto ? (
                            <img
                              src={getFileUrl(assignedPhoto.url)}
                              alt={slot.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-muted-foreground text-xs">
                              <Images className="h-6 w-6 mb-1 opacity-40" />
                              <span>Belum Ada Foto</span>
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openPicker("hero", slot.index)}
                          className="w-full h-8 text-xs font-semibold rounded-md cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {assignedPhoto ? "Ganti Foto" : "Pilih Foto"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: 9 FOTO OUR STORY */}
        {activeTab === "story" && (
          <div className="space-y-6">
            {/* Story Summary & Autofill Bar */}
            <div className="p-4 sm:p-5 rounded-lg border border-border bg-card shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Our Story (3 Babak • 9 Foto)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Atur foto dan narasi kisah cinta untuk masing-masing babak yang tampil berurutan pada animasi scroll.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {photos.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutofillStorySlots}
                      className="h-8 text-xs font-semibold gap-1.5 rounded-md cursor-pointer hover:bg-muted shrink-0"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Isi Otomatis dari Galeri</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveAllChapters}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-md cursor-pointer shrink-0"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Cerita</span>
                  </Button>
                </div>
              </div>

              {/* Stepper Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-0.5">
                {STORY_CHAPTERS.map((c) => {
                  const filledCount = c.slots.filter(
                    (s) => storyPhotoIds[s.index] || photos[s.index]?.id
                  ).length;

                  return (
                    <div
                      key={c.chapter}
                      className="p-3 rounded-md border border-border bg-muted/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-serif font-bold text-xs px-2 py-0.5 rounded bg-background border border-border text-foreground">
                          {c.roman}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">
                            {c.phaseBadge}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{c.phaseSub}</p>
                        </div>
                      </div>

                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                        {filledCount}/3 Foto
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 Clean Chapter Sections */}
            {STORY_CHAPTERS.map((chap) => {
              const chapData = chaptersData.find((c) => c.id === chap.chapter) || {
                id: chap.chapter,
                title: chap.defaultTitle,
                description: chap.defaultDesc,
              };

              const filledInThisChapter = chap.slots.filter(
                (s) => storyPhotoIds[s.index] || photos[s.index]?.id
              ).length;

              return (
                <Card key={chap.chapter} className="border border-border shadow-2xs rounded-lg">
                  <CardHeader className="p-4 sm:p-5 pb-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-serif font-bold text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                          {chap.roman}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-semibold text-foreground">
                            {chapData.title || `Chapter ${chap.roman}`}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {chap.phaseBadge} — {chap.phaseSub}
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 self-start sm:self-auto font-normal">
                        {filledInThisChapter}/3 Foto Terpasang
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-5">
                    {/* Chapter Title & Description Form */}
                    <div className="p-4 rounded-md bg-muted/30 border border-border/70 space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Judul Bab ({`Chapter ${chap.roman}`})</span>
                          <span className="text-[10px] text-muted-foreground font-normal">Tampil di atas narasi cerita</span>
                        </label>
                        <Input
                          value={chapData.title}
                          onChange={(e) => handleUpdateChapter(chap.chapter, "title", e.target.value)}
                          onBlur={(e) => handleSaveChapter(chap.chapter, "title", e.target.value)}
                          placeholder="Contoh: Chapter One: The First Encounter"
                          className="h-8 text-xs bg-background"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Kisah & Narasi ({chap.phaseBadge})</span>
                          <span className="text-[10px] text-muted-foreground font-normal">Teks narasi cerita</span>
                        </label>
                        <Textarea
                          value={chapData.description}
                          onChange={(e) => handleUpdateChapter(chap.chapter, "description", e.target.value)}
                          onBlur={(e) => handleSaveChapter(chap.chapter, "description", e.target.value)}
                          placeholder="Tuliskan kisah perjalanan cinta Anda pada bab ini..."
                          rows={2}
                          className="text-xs min-h-[60px] bg-background resize-y"
                        />
                      </div>
                    </div>

                    {/* 3 Photos Grid */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        Foto ({chapData.title})
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {chap.slots.map((slot) => {
                          const assignedId = storyPhotoIds[slot.index];
                          const photoById = assignedId && assignedId !== "UNASSIGNED" ? photos.find((p) => p.id === assignedId) : null;
                          const assignedPhoto = photoById || (assignedId !== "UNASSIGNED" ? photos[slot.index] : null);

                          return (
                            <div
                              key={slot.index}
                              className="p-3.5 rounded-lg border border-border bg-card space-y-3 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-foreground">
                                    {slot.label} (Slot #{slot.slotNum})
                                  </span>
                                  {assignedPhoto ? (
                                    <span className="text-[10px] text-primary font-medium">Terpasang</span>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">Kosong</span>
                                  )}
                                </div>

                                {/* Photo Box */}
                                <div className="aspect-4/3 rounded-md overflow-hidden bg-muted border border-border mb-2.5 relative group">
                                  {assignedPhoto ? (
                                    <>
                                      <img
                                        src={getFileUrl(assignedPhoto.url)}
                                        alt={`Story #${slot.slotNum}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUnassignSlot("story", slot.index)}
                                        title="Lepas foto dari slot ini"
                                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-foreground flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-border"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <div
                                      onClick={() => openPicker("story", slot.index)}
                                      className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-muted-foreground text-xs cursor-pointer hover:bg-muted/80 transition-colors"
                                    >
                                      <Images className="h-5 w-5 mb-1 opacity-40" />
                                      <span>Pilih Foto</span>
                                    </div>
                                  )}
                                </div>

                                {/* Caption */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-medium text-muted-foreground block">
                                    Keterangan / Caption
                                  </label>
                                  <Input
                                    key={`story-caption-${assignedPhoto?.id || slot.index}-${assignedPhoto?.caption || ""}`}
                                    defaultValue={assignedPhoto?.caption || slot.defaultCaption}
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (assignedPhoto && val !== (assignedPhoto.caption || "")) {
                                        handleUpdateCaption(assignedPhoto.id, val);
                                      }
                                    }}
                                    placeholder={slot.defaultCaption}
                                    className="h-7 text-xs bg-background"
                                  />
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openPicker("story", slot.index)}
                                className="w-full h-8 text-xs font-semibold rounded-md cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors mt-2"
                              >
                                {assignedPhoto ? "Ganti Foto" : "Pilih Foto"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 3: SEMUA GALERI (MAX 15 FOTO) */}
        {activeTab === "gallery" && (
          <div className="space-y-4">
            {/* Hidden Input for direct gallery drag & drop / browse */}
            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleBatchImageUpload(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {/* Drag & Drop Quick Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsGalleryDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsGalleryDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsGalleryDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsGalleryDragging(false);
                if (e.dataTransfer.files?.length) {
                  handleBatchImageUpload(e.dataTransfer.files);
                }
              }}
              onClick={() => {
                if (photos.length < MAX_PHOTOS && !isBatchUploading) {
                  galleryFileInputRef.current?.click();
                } else if (photos.length >= MAX_PHOTOS) {
                  toast.error(`Maksimal ${MAX_PHOTOS} foto telah tercapai.`);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isBatchUploading
                  ? "border-primary/50 bg-primary/5 cursor-not-allowed"
                  : isGalleryDragging
                  ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.008] shadow-md"
                  : "border-border hover:border-primary/60 hover:bg-muted/30 bg-muted/10"
              }`}
            >
              {isBatchUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs font-semibold text-foreground">
                    Sedang Mengunggah Foto ({batchProgress?.current}/{batchProgress?.total})...
                  </p>
                  <p className="text-[11px] text-muted-foreground">Foto sedang diproses dan ditambahkan ke album</p>
                </div>
              ) : (
                <>
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center mb-2.5 transition-transform ${
                    isGalleryDragging ? "bg-primary text-primary-foreground scale-110" : "bg-primary/10 text-primary"
                  }`}>
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {isGalleryDragging ? "Lepaskan Foto di Sini Sekarang!" : "Tarik & Lepas Banyak Foto ke Sini"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    atau <span className="text-primary font-medium underline">Klik untuk Memilih File</span> (JPG, PNG, WebP maks 20MB per foto)
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                      Batch Upload Siap
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Sisa Kuota: {MAX_PHOTOS - photos.length} Foto
                    </span>
                  </div>
                </>
              )}
            </div>

            <Card className="border-border/80 shadow-xs rounded-md">
              <CardHeader className="p-5 pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    Album Foto Terunggah ({photos.length}/{MAX_PHOTOS} Foto)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Semua foto ini akan otomatis tampil dalam layout Masonry Galeri Publik di website undangan Anda.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPhotoFile(null);
                    setNewPhotoUrl("");
                    setNewPhotoCaption("");
                    setAddPhotoOpen(true);
                  }}
                  disabled={photos.length >= MAX_PHOTOS}
                  className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Foto</span>
                </Button>
              </CardHeader>

              <CardContent className="p-5">
                {photos.length === 0 ? (
                  <div className="p-12 text-center border border-dashed rounded-xl text-xs text-muted-foreground space-y-2">
                    <Images className="h-8 w-8 mx-auto opacity-30 text-muted-foreground" />
                    <p className="font-medium">Belum ada foto yang diunggah.</p>
                    <p className="text-[11px]">Tarik dan lepas file gambar ke area di atas atau klik tombol "Tambah Foto".</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {photos.map((photo, idx) => {
                      const isHero = heroPhotoIds.includes(photo.id);
                      const isStory = storyPhotoIds.includes(photo.id);

                      return (
                        <div
                          key={photo.id}
                          className="group rounded-xl overflow-hidden border border-border bg-card shadow-2xs flex flex-col justify-between"
                        >
                          <div className="relative aspect-4/5 overflow-hidden bg-muted">
                            <img
                              src={getFileUrl(photo.url)}
                              alt={photo.caption || "Gallery Photo"}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                              <span className="text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                                #{idx + 1}
                              </span>
                              {isHero && (
                                <span className="text-[8px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                  Hero
                                </span>
                              )}
                              {isStory && (
                                <span className="text-[8px] font-bold bg-amber-600 text-white px-1.5 py-0.5 rounded">
                                  Story
                                </span>
                              )}
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeletingPhoto(photo)}
                              className="absolute top-2 right-2 h-6 w-6 rounded-md bg-destructive text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus Foto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Inline Caption Input on Card */}
                          <div className="p-2 border-t border-border bg-card">
                            <Input
                              key={`gal-caption-${photo.id}-${photo.caption || ""}`}
                              defaultValue={photo.caption || ""}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (photo.caption || "")) {
                                  handleUpdateCaption(photo.id, val);
                                }
                              }}
                              placeholder="Tulis keterangan foto..."
                              className="h-7 text-[11px] bg-background"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: MUSIK LATAR */}
        {activeTab === "music" && (
          <Card className="border-border/80 shadow-xs rounded-md">
            <CardHeader className="p-5 pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                Background Musik Undangan
              </CardTitle>
              <CardDescription className="text-xs">
                Lagu latar yang diputar saat tamu membuka amplop website undangan pernikahan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSaveMusic} className="space-y-6 text-xs">
                {/* Hidden File Input strictly accepting .mp3 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,audio/mpeg,audio/mp3,audio/x-mp3"
                  className="hidden"
                  onChange={handleAudioFileChange}
                />

                {/* MP3 Upload Dropzone / Action Box */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    Unggah File Audio Lagu (.mp3)
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsAudioDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsAudioDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsAudioDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsAudioDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processAudioFile(file);
                    }}
                    onClick={() => {
                      if (!isUploadingAudio) fileInputRef.current?.click();
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
                      isUploadingAudio
                        ? "border-primary/50 bg-primary/5 opacity-75 cursor-not-allowed"
                        : isAudioDragging
                        ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01] shadow-md"
                        : "border-border hover:border-primary/60 hover:bg-muted/30 bg-muted/10"
                    }`}
                  >
                    {isUploadingAudio ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-xs font-semibold text-foreground">Sedang mengunggah audio MP3...</p>
                        <p className="text-[11px] text-muted-foreground">Mohon tunggu sebentar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-transform ${
                          isAudioDragging ? "bg-primary text-primary-foreground scale-110" : "bg-primary/10 text-primary"
                        }`}>
                          <FileAudio className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                            <Upload className="h-3.5 w-3.5 text-primary" />
                            {isAudioDragging ? "Lepaskan File MP3 di Sini Sekarang" : "Tarik & Lepas File MP3 di Sini, atau Klik untuk Memilih"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Mendukung file audio berformat <strong className="text-foreground">.mp3</strong> (Maksimal 50MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs px-3.5 rounded-md mt-1 cursor-pointer pointer-events-none font-medium"
                        >
                          Pilih File MP3 dari Komputer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rich Audio Preview Player Card */}
                {musicUrl && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-card via-muted/30 to-muted/50 border border-border shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Disc & Track Meta */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Animated Vinyl Disc Icon */}
                        <div className={`relative h-12 w-12 rounded-full bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-primary shrink-0 shadow-sm ${
                          isPlaying ? "animate-spin" : ""
                        }`} style={{ animationDuration: "4s" }}>
                          <Disc className="h-7 w-7 text-neutral-400" />
                          <div className="absolute h-3 w-3 rounded-full bg-primary border-2 border-neutral-900" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {musicTitle || audioMeta?.name || "Background Music"}
                            </span>
                            <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0 h-4 uppercase">
                              MP3
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {musicArtist ? `Artis: ${musicArtist}` : audioMeta?.size ? formatBytes(audioMeta.size) : "Audio Siap Diputar"}
                          </p>
                        </div>
                      </div>

                      {/* Equalizer Visualizer Bars */}
                      <div className="flex items-end gap-1 h-6 px-3 py-1 rounded bg-muted/60 border border-border/50 shrink-0 self-start sm:self-center">
                        <span className="text-[10px] text-muted-foreground mr-1 font-mono">
                          {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
                        </span>
                        {[40, 75, 50, 90, 60, 100, 30, 80, 65].map((height, idx) => (
                          <div
                            key={idx}
                            className={`w-1 rounded-full bg-primary transition-all duration-300 ${
                              isPlaying ? "opacity-100" : "opacity-30"
                            }`}
                            style={{
                              height: isPlaying ? `${Math.max(20, (height * ((idx % 3) + 1)) % 100)}%` : "20%",
                              animation: isPlaying ? `bounce 0.8s ease-in-out infinite alternate ${idx * 0.1}s` : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Progress Slider & Controls */}
                    <div className="space-y-2 pt-1 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={audioDuration || 100}
                          value={audioCurrentTime}
                          onChange={handleSeek}
                          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={isPlaying ? "default" : "outline"}
                            onClick={handleTogglePlay}
                            className="h-8 px-3.5 text-xs font-semibold gap-1.5 rounded-md cursor-pointer shadow-xs"
                          >
                            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-primary" />}
                            <span>{isPlaying ? "Jeda Audio" : "Putar Musik"}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleMute}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                            title={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 text-[11px] gap-1 px-2.5 rounded-md cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Ganti File</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (audioRef.current) audioRef.current.pause();
                              setIsPlaying(false);
                              setMusicUrl("");
                              setAudioMeta(null);
                            }}
                            className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            <span>Hapus</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Song Meta Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground block">Judul Lagu</label>
                    <Input
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      placeholder="Contoh: Can't Help Falling in Love"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground block">Penyanyi / Artis</label>
                    <Input
                      value={musicArtist}
                      onChange={(e) => setMusicArtist(e.target.value)}
                      placeholder="Contoh: Kina Grannis"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Alternative Direct URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground block">
                      URL Link Audio Eksternal (Opsional)
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">.mp3 format</span>
                  </div>
                  <Input
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    className="font-mono h-9 text-xs"
                    placeholder="https://domain.com/audio/song.mp3"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    URL akan terisi otomatis saat Anda mengunggah file .mp3 di atas, atau bisa diisi manual jika menggunakan hosting eksternal.
                  </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-border/60">
                  <Button type="submit" size="default" className="gap-2 text-xs font-semibold rounded-md cursor-pointer px-5">
                    <Save className="h-4 w-4" />
                    <span>Simpan Pengaturan Musik</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Photo Modal with Rich File Drag-and-Drop and Preview */}
      <Dialog open={addPhotoOpen} onOpenChange={setAddPhotoOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAddPhoto}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>Tambah Foto Album ({photos.length}/{MAX_PHOTOS})</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Unggah file gambar dari perangkat Anda atau masukkan tautan URL foto.
              </DialogDescription>
            </DialogHeader>

            {/* Hidden Input for Modal File Picker */}
            <input
              ref={photoFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processPhotoFile(file);
              }}
            />

            {/* Mode Switch Tabs */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-md border border-border/80 mt-2 mb-3">
              <button
                type="button"
                onClick={() => setPhotoUploadTab("file")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  photoUploadTab === "file"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Unggah File / Drag & Drop</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoUploadTab("url")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  photoUploadTab === "url"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Link URL Gambar</span>
              </button>
            </div>

            <div className="py-1 text-xs space-y-3.5">
              {photoUploadTab === "file" ? (
                <div className="space-y-2">
                  {/* When no photo is selected or during upload */}
                  {!newPhotoUrl ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsPhotoDragging(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsPhotoDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsPhotoDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsPhotoDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processPhotoFile(file);
                      }}
                      onClick={() => {
                        if (!isUploadingPhoto) photoFileInputRef.current?.click();
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isUploadingPhoto
                          ? "border-primary/50 bg-primary/5 opacity-75 cursor-not-allowed"
                          : isPhotoDragging
                          ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01] shadow-md"
                          : "border-border hover:border-primary/60 hover:bg-muted/30 bg-muted/10"
                      }`}
                    >
                      {isUploadingPhoto ? (
                        <div className="flex flex-col items-center gap-2 py-3">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          <p className="text-xs font-semibold text-foreground">Sedang memproses foto...</p>
                          <p className="text-[11px] text-muted-foreground">Mohon tunggu sebentar</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2.5 py-2">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-transform ${
                            isPhotoDragging ? "bg-primary text-primary-foreground scale-110" : "bg-primary/10 text-primary"
                          }`}>
                            <ImageIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {isPhotoDragging ? "Lepaskan Foto di Sini Sekarang" : "Tarik & Lepas Foto di Sini"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              atau <span className="text-primary font-medium underline">Klik untuk Memilih File</span>
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground mt-0.5">
                            JPG, PNG, WebP, GIF (Maks. 20MB)
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Rich Image Preview Card */
                    <div className="rounded-xl border border-border/80 bg-muted/20 overflow-hidden shadow-xs space-y-3 p-3.5">
                      <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden border border-border bg-black/5 flex items-center justify-center group shadow-inner">
                        <img
                          src={getFileUrl(newPhotoUrl)}
                          alt="Preview Upload"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Overlay tags */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <Badge variant="default" className="text-[10px] font-semibold gap-1 shadow-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            Foto Terpilih
                          </Badge>
                          {selectedPhotoFile?.type && (
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase shadow-sm">
                              {selectedPhotoFile.type}
                            </Badge>
                          )}
                        </div>

                        {/* Top Right Quick Remove */}
                        <button
                          type="button"
                          onClick={() => {
                            setNewPhotoUrl("");
                            setSelectedPhotoFile(null);
                          }}
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 hover:bg-destructive text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                          title="Hapus / Pilih Foto Lain"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* File Details & Replace Button */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {selectedPhotoFile?.name || "Foto Berhasil Dimuat"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {selectedPhotoFile?.size ? formatBytes(selectedPhotoFile.size) : "Gambar Siap Ditambahkan"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => photoFileInputRef.current?.click()}
                          className="h-7 text-xs px-2.5 rounded-md cursor-pointer shrink-0"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          <span>Ganti Foto</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* URL Tab with Live Preview */
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground block">
                      URL Link Foto Gambar<span className="text-destructive ml-0.5">*</span>
                    </label>
                    <Input
                      required={photoUploadTab === "url"}
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  {newPhotoUrl && (
                    <div className="rounded-lg border border-border/80 p-2 bg-muted/20 flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                        <img
                          src={getFileUrl(newPhotoUrl)}
                          alt="URL Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                          <span>Pratinjau Gambar Live</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                          {newPhotoUrl}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewPhotoUrl("")}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-md cursor-pointer shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Caption Input */}
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-foreground block">Keterangan / Caption (Opsional)</label>
                <Input
                  placeholder="Contoh: Sunset in Bandung"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 mt-4 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddPhotoOpen(false);
                  setNewPhotoUrl("");
                  setNewPhotoCaption("");
                  setSelectedPhotoFile(null);
                }}
                className="text-xs cursor-pointer rounded-md"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newPhotoUrl || isUploadingPhoto}
                className="text-xs cursor-pointer rounded-md font-semibold"
              >
                Tambahkan ke Galeri
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photo Picker Dialog for Slots */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border bg-background shrink-0 pr-14">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Images className="h-4 w-4 text-primary" />
              Pilih Foto untuk {pickerTarget?.type === "hero" ? "Halaman Utama" : "Our Story"} Slot #{pickerTarget ? pickerTarget.slotIndex + 1 : ""}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Klik salah satu foto yang telah Anda unggah di bawah ini untuk mengisi slot ini.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 overflow-y-auto flex-1">
            {photos.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                Belum ada foto yang diunggah. Silakan unggah foto di tab "Semua Galeri" terlebih dahulu.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleSelectPhotoForSlot(photo.id)}
                    className="group relative aspect-4/5 rounded-lg overflow-hidden border border-border hover:border-primary hover:ring-2 hover:ring-primary transition-all text-left cursor-pointer bg-muted"
                  >
                    <img
                      src={getFileUrl(photo.url)}
                      alt={photo.caption || "Photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                        <Check className="h-3 w-3" />
                        Pilih
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border bg-background shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPickerOpen(false)}
              className="text-xs cursor-pointer rounded-md"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Confirmation Modal */}
      <AlertDialog open={!!deletingPhoto} onOpenChange={(open) => !open && setDeletingPhoto(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Foto Galeri</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus foto ini dari album galeri?
              {deletingPhoto?.caption && (
                <span className="block mt-1 font-medium text-foreground">"{deletingPhoto.caption}"</span>
              )}
              <br />
              Foto ini juga akan dilepas jika sedang terpasang di Hero Utama atau Our Story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="text-xs cursor-pointer rounded-md">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deletingPhoto) {
                  handleDeletePhoto(deletingPhoto.id);
                  setDeletingPhoto(null);
                }
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90 font-semibold cursor-pointer shadow-xs rounded-md"
            >
              Hapus Foto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

