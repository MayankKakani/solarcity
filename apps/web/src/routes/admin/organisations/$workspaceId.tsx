import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useGrantAmcSeats from "@/hooks/mutations/admin/use-grant-amc-seats";
import useSetOrganisationPlan from "@/hooks/mutations/admin/use-set-organisation-plan";
import useGetOrganisationDetail from "@/hooks/queries/admin/use-get-organisation-detail";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin/organisations/$workspaceId")({
  component: OrganisationDetail,
});

const PLAN_OPTIONS = [
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "enterprise", name: "Enterprise" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function OrganisationDetail() {
  const { workspaceId } = Route.useParams();
  const { data, isLoading, isError, error } =
    useGetOrganisationDetail(workspaceId);
  const { mutateAsync: setPlan, isPending: isSettingPlan } =
    useSetOrganisationPlan(workspaceId);
  const { mutateAsync: grantSeats, isPending: isGrantingSeats } =
    useGrantAmcSeats(workspaceId);
  const [seatsToGrant, setSeatsToGrant] = useState("");

  const handlePlanChange = async (planId: string) => {
    try {
      await setPlan({ workspaceId, planId });
      toast.success("Plan updated.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update plan.",
      );
    }
  };

  const handleGrantSeats = async () => {
    const seats = Number(seatsToGrant);
    if (!Number.isInteger(seats) || seats < 1) {
      toast.error("Enter a whole number of seats to grant.");
      return;
    }
    try {
      await grantSeats({ workspaceId, seats });
      toast.success(`Granted ${seats} AMC seat${seats === 1 ? "" : "s"}.`);
      setSeatsToGrant("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to grant seats.",
      );
    }
  };

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Failed to load organisation."}
      </p>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const zoneLimitLabel =
    data.plan.maxZones === null ? "unlimited" : data.plan.maxZones;

  return (
    <>
      <PageTitle title={data.name} />
      <div className="space-y-8">
        <div>
          <h1 className="text-lg font-semibold">{data.name}</h1>
          <p className="text-sm text-muted-foreground">
            {data.slug} · created{" "}
            {new Date(data.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6 border-b border-border pb-6">
          <StatCard
            label="Zones"
            value={`${data.usage.zoneCount} / ${zoneLimitLabel}`}
          />
          <StatCard
            label="AMC seats in use"
            value={`${data.usage.activeAmcCount} / ${data.usage.amcSeatBalance}`}
          />
          <StatCard label="Members" value={data.members.length} />

          <div className="ml-auto flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Plan</span>
            <Select
              value={data.plan.planId}
              onValueChange={(value) => {
                if (value) handlePlanChange(value);
              }}
              disabled={isSettingPlan}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium">Members</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">AMC seat purchases</h2>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                step={1}
                placeholder="Seats"
                value={seatsToGrant}
                onChange={(e) => setSeatsToGrant(e.target.value)}
                className="h-8 w-24 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isGrantingSeats || !seatsToGrant}
                onClick={handleGrantSeats}
              >
                {isGrantingSeats ? "Granting…" : "Grant seats"}
              </Button>
            </div>
          </div>
          {data.amcSeatPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No AMC seats purchased yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seats</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.amcSeatPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="tabular-nums">
                      {purchase.seats}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {purchase.note ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
