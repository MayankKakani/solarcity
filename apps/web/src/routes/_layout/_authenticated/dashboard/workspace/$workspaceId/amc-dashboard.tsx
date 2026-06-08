import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus, Search, Share } from "lucide-react";
import { useMemo, useState } from "react";
import { AmcDashboardTable } from "@/components/amc/amc-dashboard-table";
import { CreateAmcModal } from "@/components/amc/create-amc-modal";
import Layout from "@/components/common/layout";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import useGetAmcDashboard from "@/hooks/queries/amc/use-get-amc-dashboard";
import useGetFullWorkspace from "@/hooks/queries/workspace/use-get-full-workspace";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/amc-dashboard",
)({
  component: RouteComponent,
});

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-2xl font-semibold tabular-nums ${valueClass ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  const { data = [], isLoading } = useGetAmcDashboard(workspaceId);
  // const { data: fullWorkspce } = useGetFullWorkspace(workspaceId)
  const work = useGetFullWorkspace({ workspaceId });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((r) => r.status === "active").length;
    const expiring30 = data.filter(
      (r) =>
        r.status === "active" &&
        r.daysToExpiry !== null &&
        r.daysToExpiry <= 30,
    ).length;
    const totalValue = data.reduce((sum, r) => sum + r.totalValue, 0);
    return { total, active, expiring30, totalValue };
  }, [data]);

  const filtered = useMemo(() => {
    let rows =
      statusFilter === "all"
        ? data
        : data.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.siteName.toLowerCase().includes(q) ||
          r.siteCode.toLowerCase().includes(q) ||
          (r.contractReference ?? "").toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, statusFilter, search]);

  const formattedTotalValue =
    stats.totalValue === 0
      ? "—"
      : `₹${(stats.totalValue).toLocaleString("en-IN", {
          maximumFractionDigits: 1,
          notation: "compact",
          compactDisplay: "short",
        })}`;

  return (
    <Layout>
      <PageTitle title="AMC Dashboard" />
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold flex-1">AMC</h1>
        <Link to={`/public-amc/${work.data?.slug}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share className="size-3.5" />
            Share
          </Button>
        </Link>

        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-3.5" />
          Export
        </Button>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="size-3.5" />
          New AMC
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary stats */}
        {isLoading ? (
          <div className="flex gap-10">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-10 border-b pb-5">
            <StatCard label="Total contracts" value={stats.total} />
            <StatCard
              label="Active"
              value={stats.active}
              valueClass="text-green-500"
            />
            <StatCard
              label="Expiring in 30d"
              value={stats.expiring30}
              valueClass={stats.expiring30 > 0 ? "text-amber-500" : ""}
            />
            <StatCard label="Total value" value={formattedTotalValue} />
          </div>
        )}

        {/* Filters row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search contracts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {filtered.length}
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <AmcDashboardTable rows={filtered} workspaceId={workspaceId} />
        )}
      </div>
      {showCreate && (
        <CreateAmcModal
          workspaceId={workspaceId}
          onClose={() => setShowCreate(false)}
        />
      )}
    </Layout>
  );
}
