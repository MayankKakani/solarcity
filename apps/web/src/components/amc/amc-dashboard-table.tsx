import { useNavigate } from "@tanstack/react-router";
import type { AmcDashboardRow } from "@/fetchers/amc/types";
import { cn } from "@/lib/cn";
import { formatDateShort } from "@/lib/format";
import { AmcStatusBadge } from "./amc-status-badge";

type Props = {
  rows: AmcDashboardRow[];
  workspaceId: string;
};

function VisitsCell({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  if (total === 0)
    return <span className="text-muted-foreground text-xs">—</span>;
  const pct = Math.min(100, Math.round((completed / total) * 100));
  const color =
    pct >= 100
      ? "bg-green-500"
      : pct >= 60
        ? "bg-amber-500"
        : "bg-muted-foreground/40";

  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <span className="text-xs text-muted-foreground">
        {completed} / {total} done
      </span>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ValueCell({ value }: { value: number }) {
  if (value === 0)
    return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className="font-medium text-sm">
      ₹{(value / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </span>
  );
}

function PeriodCell({ start, end }: { start: string; end: string }) {
  return (
    <span className="text-sm text-muted-foreground whitespace-nowrap">
      {formatDateShort(start)} – {formatDateShort(end)}
    </span>
  );
}

export function AmcDashboardTable({ rows, workspaceId }: Props) {
  const navigate = useNavigate();

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No AMC contracts found.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Site / contract
            </th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Period
            </th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Value
            </th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Visits
            </th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer transition-colors hover:bg-muted/20"
              onClick={() =>
                navigate({
                  to: "/dashboard/workspace/$workspaceId/sites/$siteId/amc",
                  params: { workspaceId, siteId: row.siteId },
                })
              }
            >
              <td className="px-4 py-3">
                <div className="font-medium leading-tight">{row.siteName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {row.siteCode}
                  {row.contractReference ? ` · ${row.contractReference}` : ""}
                </div>
              </td>
              <td className="px-4 py-3">
                <PeriodCell start={row.startDate} end={row.endDate} />
              </td>
              <td className="px-4 py-3">
                <ValueCell value={row.totalValue} />
              </td>
              <td className="px-4 py-3">
                <VisitsCell
                  completed={row.visitsCompleted}
                  total={row.visitsTotalLimit}
                />
              </td>
              <td className="px-4 py-3">
                <AmcStatusBadge
                  status={row.status}
                  expiryUrgency={row.expiryUrgency}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
