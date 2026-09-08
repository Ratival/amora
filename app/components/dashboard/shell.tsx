"use client";

import * as React from "react";
import {
  SidebarProvider,
  SidebarInset,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  useSidebar,
} from "~/components/ui/sidebar";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

const SidebarSkeleton = () => {
  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
        <Skeleton className="h-9 w-32 rounded-lg" />
      </SidebarHeader>
      <SidebarContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="space-y-2 pt-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const ContentSkeleton = () => {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarToggleButton = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();

  if (isMobile) return null;

  const isExpanded = state === "expanded";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`fixed top-[64px] -translate-y-1/2 z-50 flex items-center justify-center w-6 h-6 bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 shadow-sm cursor-pointer ${
        isExpanded ? "rounded-full -translate-x-1/2" : "rounded-r-md translate-x-0 border-l-0"
      }`}
      style={{
        left: isExpanded ? "var(--sidebar-width, 16rem)" : "0px",
      }}
      title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
      aria-label="Toggle Sidebar"
    >
      {isExpanded ? (
        <ChevronLeft className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    document.body.setAttribute("data-dashboard", "true");
    return () => {
      document.body.removeAttribute("data-dashboard");
    };
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      {mounted ? <DashboardSidebar /> : <SidebarSkeleton />}
      {mounted && <SidebarToggleButton />}
      <SidebarInset className="bg-background min-h-screen">
        {mounted ? children : <ContentSkeleton />}
      </SidebarInset>
    </SidebarProvider>
  );
}
