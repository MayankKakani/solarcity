import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useGetAmcBySite from "@/hooks/queries/amc/use-get-amc-by-site";
import { formatDateMedium } from "@/lib/format";
import { AmcServiceUsageRow } from "./amc-service-usage-row";
import { AmcStatusBadge } from "./amc-status-badge";
import { CreateAmcModal } from "./create-amc-modal";
import { EditAmcModal } from "./edit-amc-modal";

type Props = {
  siteId: string;
  workspaceId: string;
};

export function AmcSection({ siteId, workspaceId }: Props) {
  const { data: amc, isLoading } = useGetAmcBySite(siteId);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Annual Maintenance Contract</h2>
        {!amc && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create AMC
          </Button>
        )}
        {amc && amc.status === "active" && (
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            Edit AMC
          </Button>
        )}
      </div>

      {!amc && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No AMC contract for this site
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Create an AMC to track maintenance services and limits.
          </p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create AMC
          </Button>
        </div>
      )}

      {amc && (
        <div className="space-y-4">
          {/* Contract summary card */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">
                  {amc.contractReference ?? "No reference"}
                </p>
                {amc.bundle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bundle: {amc.bundle.name}
                  </p>
                )}
              </div>
              <AmcStatusBadge status={amc.status} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {formatDateMedium(new Date(amc.startDate))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {formatDateMedium(new Date(amc.endDate))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {amc.durationYears}{" "}
                  {amc.durationYears === 1 ? "year" : "years"}
                </p>
              </div>
            </div>
            {amc.notes && (
              <p className="text-sm text-muted-foreground border-t pt-3">
                {amc.notes}
              </p>
            )}
          </div>

          {/* Service usage table */}
          {amc.services.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Service
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Frequency
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Annual Limit
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Used
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Remaining
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Progress
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y px-4">
                  {amc.services.map((service) => (
                    <tr key={service.id} className="px-4">
                      <AmcServiceUsageRow key={service.id} service={service} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
