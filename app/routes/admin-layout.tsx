import * as React from "react";
import { Outlet, useNavigate } from "react-router";
import { DashboardShell } from "~/components/dashboard";
import { useAuth } from "~/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function AdminDashboardLayout() {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        // Not logged in -> Redirect to login
        navigate("/login", { replace: true });
      } else if (currentUser.role !== "admin") {
        // Couple logged in trying to access admin dashboard -> Redirect to their own couple dashboard
        navigate(`/${currentUser.coupleSlug || "template"}/dashboard`, { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Memverifikasi otentikasi...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
