import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Layers, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AmcBundle } from "@/fetchers/amc/types";
import useCreateAmc from "@/hooks/mutations/amc/use-create-amc";
import useGetBundles from "@/hooks/queries/amc/use-get-bundles";
import useGetServices from "@/hooks/queries/service-master/use-get-services";
import useGetSites from "@/hooks/queries/site/use-get-sites";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

type ServiceRow = {
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half-Yearly" },
  { value: "yearly", label: "Yearly" },
];

const PRICE_UNITS = [
  { value: "per_visit", label: "Per Visit" },
  { value: "per_unit", label: "Per Unit" },
  { value: "lump_sum", label: "Lump Sum" },
];

type Props = {
  workspaceId: string;
  /** Pre-fill a site when opened from a site page (skips the site picker). */
  siteId?: string;
  onClose: () => void;
};

function rowsFromBundle(bundle: AmcBundle): ServiceRow[] {
  return bundle.services.map((s) => ({
    serviceMasterId: s.serviceMasterId,
    frequency: s.frequency,
    annualLimit: s.annualLimit,
    price: s.price,
    priceUnit: s.priceUnit,
  }));
}

export function CreateAmcModal({
  workspaceId,
  siteId: propSiteId,
  onClose,
}: Props) {
  const { data: bundles = [], isLoading: bundlesLoading } =
    useGetBundles(workspaceId);
  const { data: services = [] } = useGetServices(workspaceId);
  const { data: sites = [] } = useGetSites(workspaceId);
  const createAmc = useCreateAmc();

  const [selectedSiteId, setSelectedSiteId] = useState(propSiteId ?? "");
  const [startDate, setStartDate] = useState("");
  const [durationYears, setDurationYears] = useState(1);
  const [contractReference, setContractReference] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);

  function applyBundle(bundleId: string, mode: "replace" | "append") {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;
    setSelectedBundleId(bundleId);
    const newRows = rowsFromBundle(bundle);
    setServiceRows((prev) =>
      mode === "replace" ? newRows : [...prev, ...newRows],
    );
    toast.success(
      mode === "replace"
        ? `Applied bundle "${bundle.name}"`
        : `Appended ${newRows.length} services from "${bundle.name}"`,
    );
  }

  function addServiceRow() {
    setServiceRows((rows) => [
      ...rows,
      {
        serviceMasterId: "",
        frequency: "monthly",
        annualLimit: 1,
        price: "0",
        priceUnit: "per_visit",
      },
    ]);
  }

  function removeServiceRow(index: number) {
    setServiceRows((rows) => rows.filter((_, i) => i !== index));
  }

  function updateRow(
    index: number,
    field: keyof ServiceRow,
    value: string | number,
  ) {
    setServiceRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSiteId) {
      toast.error("Select a site");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (serviceRows.length === 0) {
      toast.error("Add at least one service");
      return;
    }
    const badRow = serviceRows.findIndex((r) => !r.serviceMasterId);
    if (badRow !== -1) {
      toast.error(`Pick a service for row ${badRow + 1}`);
      return;
    }

    try {
      await createAmc.mutateAsync({
        workspaceId,
        siteId: selectedSiteId,
        bundleId: selectedBundleId || undefined,
        startDate,
        durationYears,
        contractReference: contractReference || undefined,
        notes: notes || undefined,
        services: serviceRows,
      });
      toast.success("AMC contract created");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create AMC");
    }
  }

  const totalValue = serviceRows.reduce(
    (sum, r) => sum + (Number.parseFloat(r.price) || 0),
    0,
  );

  return (
    <Dialog open onOpenChange={onClose}>
      {/* max-h + flex-col lets the body scroll while header/footer stay fixed */}
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle>New AMC Contract</DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <form
          id="create-amc-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* ── Site ──────────────────────────────────────────── */}
          {!propSiteId && (
            <div className="space-y-1.5">
              <Label>Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site…" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectPrimitive.Item
                      key={s.id}
                      value={s.id}
                      className="grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64"
                    >
                      <SelectPrimitive.ItemIndicator className="col-start-1">
                        {/** biome-ignore lint/a11y/noSvgWithoutTitle: <ignore> */}
                        <svg
                          aria-hidden
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
                        </svg>
                      </SelectPrimitive.ItemIndicator>
                      <span className="col-start-2 flex items-center gap-2 min-w-0">
                        <SelectPrimitive.ItemText>
                          {s.name}
                        </SelectPrimitive.ItemText>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {s.siteCode}
                        </span>
                      </span>
                    </SelectPrimitive.Item>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Contract details ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (years)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Contract Reference</Label>
            <Input
              placeholder="e.g. AMC-2025-001"
              value={contractReference}
              onChange={(e) => setContractReference(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              rows={2}
              placeholder="Any special terms or observations…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Separator />

          {/* ── Bundle picker ─────────────────────────────────── */}
          <div className="rounded-lg border bg-muted/30 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium leading-tight">
                  Apply bundle
                </p>
                <p className="text-xs text-muted-foreground">
                  Pre-fill services from a saved bundle template.
                </p>
              </div>
            </div>

            {bundlesLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : bundles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                No bundles found. Create bundles in{" "}
                <span className="font-medium">Settings → AMC Bundles</span>.
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedBundleId}
                  onValueChange={setSelectedBundleId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a bundle…" />
                  </SelectTrigger>
                  <SelectContent>
                    {bundles.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <span>{b.name}</span>
                        {b.services.length > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {b.services.length} service
                            {b.services.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!selectedBundleId}
                  onClick={() => applyBundle(selectedBundleId, "replace")}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!selectedBundleId}
                  onClick={() => applyBundle(selectedBundleId, "append")}
                >
                  Append
                </Button>
              </div>
            )}
          </div>

          {/* ── Services ─────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Services</p>
                {serviceRows.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {serviceRows.length} service
                    {serviceRows.length !== 1 ? "s" : ""} · Total ₹
                    {totalValue.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addServiceRow}
              >
                <Plus className="size-3.5 mr-1" />
                Add service
              </Button>
            </div>

            {serviceRows.length === 0 && (
              <div className="rounded-lg border border-dashed py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No services added yet.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Apply a bundle above or add services manually.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {serviceRows.map((row, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
                  key={i}
                  className={cn(
                    "rounded-lg border bg-muted/20 p-3 space-y-3",
                    !row.serviceMasterId && "border-destructive/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Service {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => removeServiceRow(i)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Service type</Label>
                    <Select
                      value={row.serviceMasterId}
                      onValueChange={(v) => updateRow(i, "serviceMasterId", v)}
                    >
                      <SelectTrigger
                        className={cn(
                          !row.serviceMasterId && "border-destructive/50",
                        )}
                      >
                        <SelectValue placeholder="Choose a service…" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <Select
                        value={row.frequency}
                        onValueChange={(v) => updateRow(i, "frequency", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Annual limit</Label>
                      <Input
                        type="number"
                        min={0}
                        value={row.annualLimit}
                        onChange={(e) =>
                          updateRow(i, "annualLimit", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.price}
                        onChange={(e) => updateRow(i, "price", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price unit</Label>
                      <Select
                        value={row.priceUnit}
                        onValueChange={(v) => updateRow(i, "priceUnit", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_UNITS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-amc-form"
            disabled={createAmc.isPending}
          >
            {createAmc.isPending ? "Creating…" : "Create AMC"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
