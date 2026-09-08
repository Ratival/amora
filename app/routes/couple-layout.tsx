import * as React from "react";
import { Outlet, useParams, useNavigate } from "react-router";
import { DashboardShell } from "~/components/dashboard";
import { useAuth } from "~/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function CoupleDashboardLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { currentUser, isLoading, setActiveCoupleBySlug } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        // Not logged in -> Redirect to login
        navigate("/login", { replace: true });
        return;
      }

      // If user is a couple, ensure they only access their own dashboard
      if (currentUser.role === "couple" && currentUser.coupleSlug) {
        if (slug && slug !== currentUser.coupleSlug) {
          // Redirect to their own couple dashboard
          navigate(`/${currentUser.coupleSlug}/dashboard`, { replace: true });
          return;
        }
      }
    }
  }, [currentUser, isLoading, slug, navigate]);

  React.useEffect(() => {
    if (slug) {
      setActiveCoupleBySlug(slug);
    }
  }, [slug, setActiveCoupleBySlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Memverifikasi otentikasi...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Prevent couple from seeing unauthorized couple slug while redirecting
  if (currentUser?.role === "couple" && currentUser.coupleSlug && slug && slug !== currentUser.coupleSlug) {
    return null;
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
