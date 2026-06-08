import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  Plus,
  Square,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AmcService } from "@/fetchers/amc/types";
import useGetAmcBySite from "@/hooks/queries/amc/use-get-amc-by-site";
import useGetSite from "@/hooks/queries/site/use-get-site";
import { cn } from "@/lib/cn";
import { formatDateMedium } from "@/lib/format";
import { AmcStatusBadge } from "./amc-status-badge";
import { CreateAmcModal } from "./create-amc-modal";
import { EditAmcModal } from "./edit-amc-modal";

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  yearly: "Yearly",
};

const PRICE_UNIT_LABELS: Record<string, string> = {
  per_visit: "/visit",
  per_unit: "/unit",
  lump_sum: "lump sum",
};

function visitsPerYear(service: AmcService): number {
  const freq = service.frequency;
  if (freq === "monthly") return 12;
  if (freq === "quarterly") return 4;
  if (freq === "half_yearly") return 2;
  if (freq === "yearly") return 1;
  return service.annualLimit;
}

type Props = {
  siteId: string;
  workspaceId: string;
};

export function AmcDetailPage({ siteId, workspaceId }: Props) {
  const { data: amc, isLoading } = useGetAmcBySite(siteId);
  const { data: site } = useGetSite(siteId);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [comment, setComment] = useState("");

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!amc) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
        <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
        <p className="text-base font-medium text-muted-foreground">
          No AMC contract for this site
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Create an AMC to track maintenance services and visit schedules.
        </p>
        <Button className="mt-5" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create AMC
        </Button>
        {showCreate && (
          <CreateAmcModal
            siteId={siteId}
            workspaceId={workspaceId}
            onClose={() => setShowCreate(false)}
          />
        )}
      </div>
    );
  }

  const totalVisitsLimit = amc.services.reduce(
    (sum, s) => sum + (s.annualLimit || visitsPerYear(s)),
    0,
  );
  const totalVisitsDone = amc.services.reduce((sum, s) => sum + s.used, 0);
  const visitPct =
    totalVisitsLimit > 0
      ? Math.min(100, Math.round((totalVisitsDone / totalVisitsLimit) * 100))
      : 0;

  const start = new Date(amc.startDate);
  const end = new Date(amc.endDate);
  const now = new Date();
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedPct =
    totalMs > 0
      ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)))
      : 0;

  const daysToExpiry =
    end > now
      ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <AmcStatusBadge status={amc.status} />
            {amc.bundle && (
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                {amc.bundle.name}
              </span>
            )}
            {amc.contractReference && (
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground font-mono">
                {amc.contractReference}
              </span>
            )}
            <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDateMedium(start)}
            </span>
            {daysToExpiry !== null && (
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {formatDateMedium(end)}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <p className="text-xs text-muted-foreground font-mono mb-1">
              {amc.contractReference}
            </p>
            <h1 className="text-2xl font-semibold leading-tight">
              {site?.name ?? "Site"} — Annual maintenance
            </h1>
            {amc.notes && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {amc.notes}
              </p>
            )}
          </div>
        </div>

        <div className="border-t" />

        {/* Contract details */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contract details
          </h2>
          <div className="space-y-0 divide-y rounded-lg border overflow-hidden">
            <DetailRow label="Contract value">
              <span className="font-medium">
                {amc.services.length > 0
                  ? `₹${amc.services
                      .reduce(
                        (sum, s) => sum + Number.parseFloat(s.price || "0"),
                        0,
                      )
                      .toLocaleString("en-IN")}`
                  : "—"}
              </span>
            </DetailRow>
            <DetailRow label="Duration">
              <span>
                {amc.durationYears} {amc.durationYears === 1 ? "year" : "years"}
              </span>
            </DetailRow>
            {amc.bundle && (
              <DetailRow label="Bundle">
                <span>{amc.bundle.name}</span>
              </DetailRow>
            )}
            {site?.systemCapacityKwp && (
              <DetailRow label="Site capacity">
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  {site.systemCapacityKwp} kWp
                </span>
              </DetailRow>
            )}
            {site?.address && (
              <DetailRow label="Location">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {site.address}
                </span>
              </DetailRow>
            )}
          </div>
        </div>

        {/* Visit progress */}
        {totalVisitsLimit > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {totalVisitsDone} of {totalVisitsLimit} visits done
              </span>
              <span className="text-xs text-muted-foreground">
                {elapsedPct}% elapsed
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${visitPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatDateMedium(start)} → {formatDateMedium(end)}
              </span>
              {daysToExpiry !== null ? (
                <span>Renews in {daysToExpiry} days</span>
              ) : (
                <span className="text-destructive">Expired</span>
              )}
            </div>
          </div>
        )}

        {/* Scope of work */}
        {amc.services.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scope of work
            </h2>
            <div className="space-y-0 divide-y rounded-lg border overflow-hidden">
              {amc.services.map((service) => {
                const unlimited = service.annualLimit === 0;
                const limitLabel = unlimited
                  ? "Unlimited"
                  : `${service.annualLimit} visits/year`;
                const freqLabel =
                  FREQUENCY_LABELS[service.frequency] ?? service.frequency;
                const overLimit =
                  !unlimited && service.used >= service.annualLimit;
                return (
                  <div
                    key={service.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      overLimit && "bg-amber-50 dark:bg-amber-900/10",
                    )}
                  >
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {service.serviceMaster.name}
                          {overLimit && (
                            <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              Over limit
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {service.serviceMaster.currency ?? "₹"}
                          {service.price}{" "}
                          {PRICE_UNIT_LABELS[service.priceUnit] ??
                            service.priceUnit}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {freqLabel} · {limitLabel}
                        {!unlimited && ` · ${service.used} used`}
                      </p>
                      {!unlimited && service.annualLimit > 0 && (
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden w-full max-w-48">
                          <div
                            className={cn(
                              "h-1.5 rounded-full",
                              overLimit ? "bg-amber-500" : "bg-green-500",
                            )}
                            style={{
                              width: `${Math.min(100, Math.round((service.used / service.annualLimit) * 100))}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Visit schedule (per-service summary) */}
        {amc.services.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visit schedule
              </h2>
            </div>
            <div className="space-y-0 divide-y rounded-lg border overflow-hidden">
              {amc.services.map((service) => {
                const unlimited = service.annualLimit === 0;
                const done = service.used;
                const total = unlimited ? null : service.annualLimit;
                const remaining = service.remaining;
                return (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        done > 0 ? "bg-green-500" : "bg-blue-400",
                      )}
                    />
                    <p className="flex-1 text-sm">
                      {service.serviceMaster.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ·{" "}
                        {FREQUENCY_LABELS[service.frequency] ??
                          service.frequency}
                      </span>
                    </p>
                    {done > 0 ? (
                      <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5">
                        {done} done
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full px-2 py-0.5">
                        Upcoming
                      </span>
                    )}
                    {total !== null && (
                      <span className="text-xs text-muted-foreground">
                        {remaining ?? total - done} left
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity / comment box */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activity
          </h2>
          <div className="rounded-lg border overflow-hidden">
            <Textarea
              placeholder="Leave a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none rounded-none border-0 border-b focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            <div className="flex justify-between items-center px-3 py-2 bg-muted/20">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated {formatDateMedium(new Date(amc.updatedAt))}</span>
              </div>
              <Button size="sm" disabled={!comment.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 pt-2 border-t">
          {amc.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <FileText className="h-3.5 w-3.5" />
            Contract PDF
          </Button>
          {!amc && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create AMC
            </Button>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateAmcModal
          siteId={siteId}
          workspaceId={workspaceId}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showEdit && amc && (
        <EditAmcModal
          amc={amc}
          workspaceId={workspaceId}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
