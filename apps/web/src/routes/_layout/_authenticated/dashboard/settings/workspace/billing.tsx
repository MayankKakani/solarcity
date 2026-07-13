import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useCreateAmcSeatOrder from "@/hooks/mutations/billing/use-create-amc-seat-order";
import useCreateSubscriptionCheckout from "@/hooks/mutations/billing/use-create-subscription-checkout";
import useGetWorkspaceEntitlements from "@/hooks/queries/workspace/use-get-workspace-entitlements";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/workspace/billing",
)({
  component: RouteComponent,
});

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function RouteComponent() {
  const { workspace, isAdmin } = useWorkspacePermission();
  const workspaceId = workspace?.id ?? "";
  const { data, isLoading, isError, error, refetch } =
    useGetWorkspaceEntitlements(workspaceId);
  const { mutateAsync: createSubscriptionCheckout, isPending: isUpgrading } =
    useCreateSubscriptionCheckout(workspaceId);
  const { mutateAsync: createAmcSeatOrder, isPending: isBuyingSeats } =
    useCreateAmcSeatOrder(workspaceId);
  const { openCheckout } = useRazorpayCheckout();
  const [seatsToBuy, setSeatsToBuy] = useState("");

  const handleUpgrade = async () => {
    try {
      const checkout = await createSubscriptionCheckout("pro");
      await openCheckout({
        key: checkout.keyId,
        name: "Solarplan",
        description: "Upgrade to Pro",
        subscription_id: checkout.subscriptionId,
        handler: () => {
          toast.success("Payment received — your plan will update shortly.");
          refetch();
        },
        modal: {
          ondismiss: () => refetch(),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start checkout.",
      );
    }
  };

  const handleBuySeats = async () => {
    const seats = Number(seatsToBuy);
    if (!Number.isInteger(seats) || seats < 1) {
      toast.error("Enter a whole number of seats to buy.");
      return;
    }
    try {
      const checkout = await createAmcSeatOrder(seats);
      await openCheckout({
        key: checkout.keyId,
        name: "Solarplan",
        description: `${seats} AMC seat${seats === 1 ? "" : "s"}`,
        order_id: checkout.orderId,
        amount: checkout.amount,
        currency: "INR",
        handler: () => {
          toast.success("Payment received — your seats will update shortly.");
          setSeatsToBuy("");
          refetch();
        },
        modal: {
          ondismiss: () => refetch(),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start checkout.",
      );
    }
  };

  if (!isAdmin) {
    return (
      <>
        <PageTitle title="Billing" />
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Billing</h1>
            <p className="text-muted-foreground">
              You need admin or owner permissions to manage billing.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Billing" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-muted-foreground">
            Manage your plan and AMC seats.
          </p>
        </div>

        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load billing details."}
          </p>
        ) : isLoading || !data ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-6 border-b border-border pb-6">
              <StatCard
                label="Zones"
                value={`${data.zones.used} / ${data.zones.limit ?? "unlimited"}`}
              />
              <StatCard
                label="AMC seats"
                value={`${data.amcSeats.used} / ${data.amcSeats.balance}`}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Plan</span>
                <Badge
                  variant={data.plan.id === "pro" ? "secondary" : "outline"}
                >
                  {data.plan.name}
                </Badge>
              </div>

              {data.plan.id === "free" && (
                <Button
                  size="sm"
                  className="ml-auto"
                  disabled={isUpgrading}
                  onClick={handleUpgrade}
                >
                  {isUpgrading ? "Starting checkout…" : "Upgrade to Pro"}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium">Buy AMC seats</h2>
              <p className="text-sm text-muted-foreground">
                One seat allows one site to carry an active AMC contract for its
                term.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Seats"
                  value={seatsToBuy}
                  onChange={(e) => setSeatsToBuy(e.target.value)}
                  className="h-9 w-24"
                />
                <Button
                  variant="outline"
                  disabled={isBuyingSeats || !seatsToBuy}
                  onClick={handleBuySeats}
                >
                  {isBuyingSeats ? "Starting checkout…" : "Buy seats"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
