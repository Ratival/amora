import * as React from "react";
import { Link, useLocation } from "react-router";
import { ExternalLink, Sparkles } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuth } from "~/contexts/auth-context";
import { getFileUrl } from "~/lib/api";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  badge,
  actions,
}: DashboardHeaderProps) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isCoupleDashboard = location.pathname.includes("/dashboard") && location.pathname !== "/dashboard" && !location.pathname.startsWith("/dashboard/");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-xs px-4 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="cursor-pointer md:hidden shrink-0" />
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold sm:text-lg tracking-tight truncate text-foreground leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground hidden sm:block truncate mt-0.5 leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Custom Actions if any */}
        {actions}

        {/* User profile dropdown */}
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full hover:opacity-80 transition-opacity focus:outline-hidden cursor-pointer"
              >
                <Avatar className="h-8 w-8 border border-border shadow-xs">
                  <AvatarImage src={getFileUrl(currentUser.avatar)} alt={currentUser.name} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:block text-left min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate text-foreground">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize leading-tight truncate">
                    {currentUser.role === "admin"
                      ? "Platform Admin"
                      : `Pasangan (${currentUser.coupleSlug || "Jim & Pam"})`}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-xs">
                <p className="font-semibold text-foreground">{currentUser.name}</p>
                <p className="text-muted-foreground truncate">{currentUser.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  <span>Amora SaaS Cloud</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link to={currentUser.role === "admin" ? "/dashboard" : `/${currentUser.coupleSlug || "template"}/dashboard`}>
                  Dashboard Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link to={currentUser.role === "admin" ? "/dashboard/settings" : `/${currentUser.coupleSlug || "template"}/dashboard/settings`}>
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-xs text-destructive focus:text-destructive"
              >
                Keluar (Logout)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
