"use client";

import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  HeartHandshake,
  Palette,
  CreditCard,
  Users,
  ShieldCheck,
  Settings,
  CalendarHeart,
  MessageSquareHeart,
  Images,
  Gift,
  Sparkles,
  LogOut,
  ChevronDown,
  ExternalLink,
  Crown,
  Heart,
  SlidersHorizontal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  ADMIN_DASHBOARD_MENU,
  ADMIN_SETTINGS_MENU,
  COUPLE_DASHBOARD_MENU,
  type MenuItem,
} from "~/lib/constants";
import { useAuth } from "~/contexts/auth-context";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  HeartHandshake,
  Palette,
  CreditCard,
  Users,
  ShieldCheck,
  Settings,
  CalendarHeart,
  MessageSquareHeart,
  Images,
  Gift,
  Sparkles,
};

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentCouple, couples, setActiveCoupleBySlug, logout } = useAuth();

  const pathname = location.pathname;

  // Determine if this is admin or couple dashboard context
  const isAdminDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  // Extract slug from URL if in couple dashboard: e.g. /testing-aja/dashboard
  const pathParts = pathname.split("/").filter(Boolean);
  const isCoupleRoute = !isAdminDashboard && pathParts.length >= 2 && pathParts[1] === "dashboard";
  const urlSlug = isCoupleRoute ? pathParts[0] : null;

  const coupleSlug = urlSlug || currentCouple?.slug || "template";
  const displayedCouple = couples.find((c) => c.slug === coupleSlug) || currentCouple || couples[0];

  const getHref = (rawHref: string) => {
    return rawHref.replace("/:slug", `/${coupleSlug}`);
  };

  const isActive = (targetHref: string) => {
    const resolvedHref = getHref(targetHref);
    if (resolvedHref === "/dashboard" || resolvedHref === `/${coupleSlug}/dashboard`) {
      return pathname === resolvedHref;
    }
    return pathname === resolvedHref || pathname.startsWith(resolvedHref + "/");
  };

  const menuItems = isAdminDashboard ? ADMIN_DASHBOARD_MENU : COUPLE_DASHBOARD_MENU;

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar select-none">
      {/* Brand Header */}
      <SidebarHeader className="h-16 px-4 flex flex-row items-center border-b border-sidebar-border">
        <Link
          to={isAdminDashboard ? "/dashboard" : `/${coupleSlug}/dashboard`}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs shrink-0">
            <Heart className="h-4.5 w-4.5 fill-current" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-sidebar-foreground leading-none">
                Amora
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary font-mono leading-none">
                {isAdminDashboard ? "Admin" : "Couple"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground tracking-wide mt-1 leading-none">
              Wedding SaaS Platform
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Couple Context Card in Couple Dashboard */}
        {!isAdminDashboard && displayedCouple && (
          <div className="mx-2 p-3 rounded-xl bg-sidebar-accent/70 border border-sidebar-border/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Undangan Aktif
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  displayedCouple.status === "published"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {displayedCouple.status === "published" ? "Live Terbit" : "Draft"}
              </span>
            </div>

            {/* Switcher Dropdown (Admin only) or Static Info (Couple user) */}
            {currentUser?.role === "admin" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-sidebar-foreground truncate group-hover:text-primary transition-colors">
                        {(displayedCouple.groomName || "Groom").split(" ")[0]} & {(displayedCouple.brideName || "Bride").split(" ")[0]}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {displayedCouple.weddingDate || "Tanggal Belum Diatur"}
                      </p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Pilih Undangan Pasangan (Admin Mode)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {couples.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => {
                        setActiveCoupleBySlug(c.slug);
                        navigate(`/${c.slug}/dashboard`);
                      }}
                      className={`cursor-pointer text-xs flex items-center justify-between py-2 ${
                        c.slug === displayedCouple.slug ? "bg-accent font-medium text-accent-foreground" : ""
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{(c.groomName || "Groom").split(" ")[0]} & {(c.brideName || "Bride").split(" ")[0]}</p>
                        <p className="text-[10px] text-muted-foreground">/{c.slug}</p>
                      </div>
                      <span className="text-[9px] uppercase px-1 py-0.5 rounded-sm bg-muted text-muted-foreground">
                        {c.status}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="w-full text-left">
                <p className="text-xs font-bold text-sidebar-foreground truncate">
                  {(displayedCouple.groomName || "Groom").split(" ")[0]} & {(displayedCouple.brideName || "Bride").split(" ")[0]}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {displayedCouple.weddingDate || "Tanggal Belum Diatur"}
                </p>
              </div>
            )}

            <div className="mt-2.5 pt-2 border-t border-sidebar-border/60 flex items-center justify-between text-[11px]">
              <Link
                to={`/${displayedCouple.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Lihat Website Live</span>
              </Link>
            </div>
          </div>
        )}

        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3">
            {isAdminDashboard ? "Menu Utama Platform" : "Kelola Undangan"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const IconComponent = iconMap[item.icon] || LayoutDashboard;
                const active = isActive(item.href);

                return item.items ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={item.items.some((sub) => isActive(sub.href))}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="h-9 px-3 cursor-pointer text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground group-hover/collapsible:text-foreground" />
                          <span className="truncate">{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-5 border-l border-sidebar-border/70 pl-2 space-y-0.5">
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.href)}
                                className="h-8 text-xs font-normal"
                              >
                                <Link to={getHref(subItem.href)}>
                                  {subItem.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-10 px-3 cursor-pointer"
                    >
                      <Link to={getHref(item.href)}>
                        <IconComponent className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/15 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Settings & System Group (Only shown in Admin mode) */}
        {isAdminDashboard && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3">
              Administrasi & Konfigurasi
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {ADMIN_SETTINGS_MENU.map((item) => {
                  const IconComponent = iconMap[item.icon] || SlidersHorizontal;
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="h-10 px-3 cursor-pointer"
                      >
                        <Link to={item.href}>
                          <IconComponent className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Quick Return Button (Only shown when Admin is viewing a couple's dashboard) */}
        {currentUser?.role === "admin" && !isAdminDashboard && (
          <div className="px-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-md border border-dashed border-sidebar-border bg-sidebar-accent/50 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">Kembali ke Platform Admin</span>
              </div>
              <ChevronDown className="h-3 w-3 -rotate-90 shrink-0" />
            </button>
          </div>
        )}

        {/* Logout button */}
        <div className="px-2 pt-1">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border/80 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {currentUser?.name || "User"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {currentUser?.role === "admin"
                ? "Super Administrator"
                : `Pasangan (${currentUser?.coupleSlug || "template"})`}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
