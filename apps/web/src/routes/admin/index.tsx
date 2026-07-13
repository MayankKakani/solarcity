import { createFileRoute } from "@tanstack/react-router";
import PageTitle from "@/components/page-title";
import { Skeleton } from "@/components/ui/skeleton";
import useGetInstanceStats from "@/hooks/queries/admin/use-get-instance-stats";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const STAT_SKELETON_KEYS = [
  "organisations",
  "users",
  "zones",
  "tasks",
  "sites",
  "active-amcs",
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function AdminOverview() {
  const { data, isLoading, isError, error } = useGetInstanceStats();

  return (
    <>
      <PageTitle title="Instance Overview" />
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Instance overview</h1>
          <p className="text-sm text-muted-foreground">
            Totals across every organisation on this instance.
          </p>
        </div>

        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load instance stats."}
          </p>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STAT_SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="flex flex-col gap-2 rounded-lg border border-border p-4"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Organisations"
              value={data?.organisationCount ?? 0}
            />
            <StatCard label="Users" value={data?.userCount ?? 0} />
            <StatCard label="Zones" value={data?.zoneCount ?? 0} />
            <StatCard label="Tasks" value={data?.taskCount ?? 0} />
            <StatCard label="Sites" value={data?.siteCount ?? 0} />
            <StatCard label="Active AMCs" value={data?.activeAmcCount ?? 0} />
          </div>
        )}
      </div>
    </>
  );
}
