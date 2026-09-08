import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  // Platform Admin Dashboard Routes
  layout("routes/admin-layout.tsx", [
    route("dashboard", "routes/admin/overview.tsx"),
    route("dashboard/couples", "routes/admin/couples.tsx"),
    route("dashboard/templates", "routes/admin/templates.tsx"),
    route("dashboard/users", "routes/admin/users.tsx"),
    route("dashboard/roles", "routes/admin/roles.tsx"),
    route("dashboard/settings", "routes/admin/settings.tsx"),
  ]),

  // Couple Specific Dashboard Routes (e.g. /:slug/dashboard/*)
  layout("routes/couple-layout.tsx", [
    route(":slug/dashboard", "routes/couple/overview.tsx"),
    route(":slug/dashboard/event", "routes/couple/event.tsx"),
    route(":slug/dashboard/theme", "routes/couple/theme.tsx"),
    route(":slug/dashboard/guests", "routes/couple/guests.tsx"),
    route(":slug/dashboard/wishes", "routes/couple/wishes.tsx"),
    route(":slug/dashboard/gallery", "routes/couple/gallery.tsx"),
    route(":slug/dashboard/settings", "routes/couple/settings.tsx"),
  ]),

  // Public Invitation Dynamic Slug URL (e.g. /template, /:slug, /:slug/:guestName, or /:slug/to/:guestName)
  route(":slug", "routes/couple-public.tsx"),
  route(":slug/to/:guestName", "routes/couple-to-guest.tsx"),
  route(":slug/:guestName", "routes/couple-guest.tsx"),
] satisfies RouteConfig;
