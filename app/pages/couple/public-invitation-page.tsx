import * as React from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router";
import { Welcome } from "~/pages/welcome/welcome";
import { useAuth } from "~/contexts/auth-context";
import { Crown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/api";
import { DEFAULT_TEMPLATE_COUPLE } from "~/lib/mock-data";
import { formatGuestName } from "~/lib/utils";
import type { CoupleProject } from "~/types/dashboard";

export function CouplePublicInvitationPage() {
  const { slug, guestName: routeGuestName } = useParams<{ slug: string; guestName?: string }>();
  const [searchParams] = useSearchParams();
  const rawGuestName = searchParams.get("to") || routeGuestName;
  const guestName = React.useMemo(() => formatGuestName(rawGuestName), [rawGuestName]);
  const { couples, currentCouple, setActiveCoupleBySlug, currentUser } = useAuth();
  const [liveData, setLiveData] = React.useState<CoupleProject | null>(null);
  const navigate = useNavigate();

  const isTemplate = slug === "template";

  // If someone accessed /dashboard/:slug, redirect them directly to the Couple Dashboard
  React.useEffect(() => {
    if (slug === "dashboard" && routeGuestName) {
      navigate(`/${routeGuestName}/dashboard`, { replace: true });
    }
  }, [slug, routeGuestName, navigate]);

  React.useEffect(() => {
    if (!slug || slug === "dashboard" || slug === "template") return;

    setActiveCoupleBySlug(slug);

    // Always fetch fresh published data from database to ensure zero-lag updates
    let isMounted = true;
    api.public.getInvitation(slug).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data?.couple) {
        const c = res.data.couple;
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

        const parsed: CoupleProject = {
          id: c.id,
          slug: c.slug,
          title: c.title,
          ownerEmail: c.ownerEmail,
          groomName: c.groomName || "",
          groomParents: c.groomParents || "",
          groomBio: c.groomBio || "",
          groomInstagram: c.groomInstagram || "",
          groomPhoto: c.groomPhoto || "",
          brideName: c.brideName || "",
          brideParents: c.brideParents || "",
          brideBio: c.brideBio || "",
          brideInstagram: c.brideInstagram || "",
          bridePhoto: c.bridePhoto || "",
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
          rsvpCount: { attending: 0, tentative: 0, regret: 0, pending: 0 },
          wishesCount: 0,
          totalAngpao: 0,
          bankAccounts,
          musicTitle: c.musicTitle || "",
          musicArtist: c.musicArtist || "",
          musicUrl: c.musicUrl || "",
          storyQuote: c.storyQuote || "",
          loveStories: [],
          galleryPhotos: res.data.gallery && Array.isArray(res.data.gallery)
            ? res.data.gallery.map((g: any) => ({ id: g.id, url: g.url, caption: g.caption }))
            : [],
          heroPhotoIds,
          storyPhotoIds,
          storyChapters,
          isPasswordProtected: c.isPasswordProtected || false,
          qrCheckInEnabled: c.qrCheckInEnabled !== undefined ? c.qrCheckInEnabled : true,
        };

        setLiveData(parsed);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug, setActiveCoupleBySlug]);

  const stateCouple = couples.find((c) => c.slug === slug);
  const currentActive = currentCouple?.slug === slug ? currentCouple : null;

  const couple = React.useMemo(() => {
    if (isTemplate) {
      return DEFAULT_TEMPLATE_COUPLE;
    }
    const base = currentActive || stateCouple || liveData;
    if (!liveData) return base;
    return {
      ...base,
      ...liveData,
      galleryPhotos: liveData.galleryPhotos?.length ? liveData.galleryPhotos : base?.galleryPhotos || [],
      heroPhotoIds: liveData.heroPhotoIds?.length ? liveData.heroPhotoIds : base?.heroPhotoIds || [],
      storyPhotoIds: liveData.storyPhotoIds?.length ? liveData.storyPhotoIds : base?.storyPhotoIds || [],
      storyChapters: liveData.storyChapters?.length ? liveData.storyChapters : base?.storyChapters || [],
    };
  }, [isTemplate, currentActive, stateCouple, liveData]);

  const canAccessDashboard =
    !isTemplate &&
    currentUser &&
    couple &&
    (currentUser.role === "admin" || (currentUser.role === "couple" && currentUser.coupleSlug === couple.slug));

  if (slug === "dashboard") {
    return null;
  }

  const groomFirst = couple?.groomName ? couple.groomName.split(" ")[0] : "Groom";
  const brideFirst = couple?.brideName ? couple.brideName.split(" ")[0] : "Bride";

  return (
    <div className="relative min-h-screen">
      {/* Floating Header Banner only for logged-in couple owner or admin */}
      {canAccessDashboard && couple && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
          <Button
            size="sm"
            asChild
            className="h-8 px-3 text-xs font-semibold rounded-full bg-background/90 text-foreground border border-border backdrop-blur-md shadow-md hover:bg-background cursor-pointer"
          >
            <Link to={`/${couple.slug}/dashboard`}>
              <Crown className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Dashboard {groomFirst} & {brideFirst}</span>
            </Link>
          </Button>
        </div>
      )}

      <Welcome
        couple={couple}
        guestName={guestName || undefined}
        isTemplatePreview={slug === "template"}
      />
    </div>
  );
}

