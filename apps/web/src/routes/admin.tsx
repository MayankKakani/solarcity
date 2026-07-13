import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: ({ context }) => {
    if (context.user?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function AdminLayout() {
  return (
    <div className="min-h-svh w-full bg-background">
      <header className="flex h-12 items-center gap-6 border-b border-border px-4">
        <Link
          to="/admin"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <ShieldAlert className="size-4 text-muted-foreground" />
          Instance Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Overview
          </Link>
          <Link
            to="/admin/organisations"
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Organisations
          </Link>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
