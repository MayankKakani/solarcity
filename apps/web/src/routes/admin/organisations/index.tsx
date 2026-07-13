import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useListOrganisations from "@/hooks/queries/admin/use-list-organisations";

export const Route = createFileRoute("/admin/organisations/")({
  component: OrganisationsList,
});

const PAGE_SIZE = 25;

function planBadgeVariant(planId: string) {
  if (planId === "enterprise") return "default" as const;
  if (planId === "pro") return "secondary" as const;
  return "outline" as const;
}

function statusBadgeVariant(status: string) {
  if (status === "past_due") return "warning" as const;
  if (status === "canceled") return "error" as const;
  return "success" as const;
}

function OrganisationsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useListOrganisations(
    page,
    PAGE_SIZE,
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <>
      <PageTitle title="Organisations" />
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Organisations</h1>
          <p className="text-sm text-muted-foreground">
            Every workspace on this instance, with plan and usage at a glance.
          </p>
        </div>

        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load organisations."}
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data && data.organisations.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No organisations yet</EmptyTitle>
              <EmptyDescription>
                Organisations will appear here once someone signs up and creates
                a workspace.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Zones</TableHead>
                  <TableHead className="text-right">Sites</TableHead>
                  <TableHead className="text-right">AMC seats</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.organisations.map((org) => (
                  <TableRow key={org.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        to="/admin/organisations/$workspaceId"
                        params={{ workspaceId: org.id }}
                        className="font-medium hover:underline"
                      >
                        {org.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {org.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={planBadgeVariant(org.planId)}>
                        {org.planName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusBadgeVariant(org.subscriptionStatus)}
                      >
                        {org.subscriptionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {org.memberCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {org.zoneCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {org.siteCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {org.activeAmcCount}/{org.amcSeatBalance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {data?.total ?? 0} organisations
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
