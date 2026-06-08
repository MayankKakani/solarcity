import { useNavigate } from "@tanstack/react-router";
import { Building2, Calendar, ChevronRight, MapPin, Zap } from "lucide-react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCreateSite from "@/hooks/mutations/site/use-create-site";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

type Step = "details" | "location";

const SITE_TYPES = [
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "residential", label: "Residential" },
  { value: "agricultural", label: "Agricultural" },
] as const;

const GRID_TYPES = [
  { value: "on_grid", label: "On-grid" },
  { value: "off_grid", label: "Off-grid" },
  { value: "hybrid", label: "Hybrid" },
] as const;

type CreateSiteModalProps = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
};

function FieldRow({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CreateSiteModal({ open, onClose, workspaceId }: CreateSiteModalProps) {
  const { data: workspace } = useActiveWorkspace();
  const { mutateAsync, isPending } = useCreateSite();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("details");

  // Step 1 — Site details
  const [name, setName] = useState("");
  const [siteType, setSiteType] =
    useState<(typeof SITE_TYPES)[number]["value"]>("commercial");
  const [inverterModel, setInverterModel] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [status, setStatus] = useState<
    "active" | "inactive" | "under_maintenance"
  >("active");

  // Step 2 — Location & capacity
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [systemCapacityKwp, setSystemCapacityKwp] = useState("");
  const [panelCount, setPanelCount] = useState("");
  const [gridConnectionType, setGridConnectionType] =
    useState<(typeof GRID_TYPES)[number]["value"]>("on_grid");

  const autoCode = (n: string) =>
    n
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.slice(0, 3))
      .join("-")
      .slice(0, 12) || "SITE";

  const siteCode = autoCode(name);
  const step1Valid = name.trim().length > 0;

  const handleClose = () => {
    setStep("details");
    setName("");
    setSiteType("commercial");
    setInverterModel("");
    setInstallationDate("");
    setStatus("active");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setSystemCapacityKwp("");
    setPanelCount("");
    setGridConnectionType("on_grid");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1Valid) return;

    try {
      const site = await mutateAsync({
        workspaceId,
        name: name.trim(),
        siteCode: siteCode.trim(),
        siteType,
        address: address.trim() || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        systemCapacityKwp: systemCapacityKwp || undefined,
        panelCount: panelCount ? Number(panelCount) : undefined,
        inverterModel: inverterModel.trim() || undefined,
        gridConnectionType,
        installationDate: installationDate || undefined,
        status,
      });

      toast.success(`Site "${name}" created`);
      handleClose();
      navigate({
        to: "/dashboard/workspace/$workspaceId/sites/$siteId",
        params: { workspaceId, siteId: site.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create site",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" showCloseButton={false}>
        <DialogHeader className="px-3 pt-4 pb-1 gap-1.5">
          <DialogTitle className="sr-only">Add site</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new solar installation site
          </DialogDescription>
          <Breadcrumb>
            <BreadcrumbList className="gap-1 text-xs">
              <BreadcrumbItem className="text-muted-foreground font-medium tracking-wide">
                {workspace?.name?.toUpperCase() ?? "SITES"}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3.5" />
              <BreadcrumbItem className="text-foreground font-medium">
                New site
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-3 py-1">
          <button
            type="button"
            onClick={() => setStep("details")}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              step === "details"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                step === "details"
                  ? "bg-primary text-primary-foreground"
                  : step1Valid
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step1Valid && step !== "details" ? "✓" : "1"}
            </div>
            Site details
          </button>
          <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <button
            type="button"
            onClick={() => step1Valid && setStep("location")}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              step === "location"
                ? "text-foreground font-medium"
                : "text-muted-foreground",
              step1Valid &&
                step !== "location" &&
                "hover:text-foreground cursor-pointer",
              !step1Valid && "opacity-40 cursor-not-allowed",
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                step === "location"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              2
            </div>
            Location & capacity
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-3 py-2 space-y-4 min-h-[280px]">
            {step === "details" && (
              <>
                {/* Site name — large prominent input */}
                <div className="space-y-1">
                  <Input
                    unstyled
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    placeholder="Site / Plant name…"
                    className="w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:py-2 [&_[data-slot=input]]:text-2xl [&_[data-slot=input]]:leading-tight [&_[data-slot=input]]:font-semibold [&_[data-slot=input]]:tracking-tight [&_[data-slot=input]]:text-foreground [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:outline-none"
                    required
                  />
                  {name.trim() && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Site ID:
                      <span className="font-mono text-foreground/70">
                        {siteCode}
                      </span>
                      <span className="opacity-50">· auto-generated</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <FieldRow label="Site type" required>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <select
                        value={siteType}
                        onChange={(e) =>
                          setSiteType(e.target.value as typeof siteType)
                        }
                        className="w-full h-8 pl-7 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        {SITE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FieldRow>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Inverter model">
                    <Input
                      value={inverterModel}
                      onChange={(e) => setInverterModel(e.target.value)}
                      placeholder="e.g. SMA Sunny Boy"
                      className="h-8 text-sm"
                    />
                  </FieldRow>

                  <FieldRow label="Installation date">
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <input
                        type="date"
                        value={installationDate}
                        onChange={(e) => setInstallationDate(e.target.value)}
                        className="w-full h-8 pl-7 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </FieldRow>
                </div>

                <FieldRow label="Status">
                  <SegmentedControl
                    options={[
                      { value: "active" as const, label: "Active" },
                      { value: "inactive" as const, label: "Inactive" },
                      {
                        value: "under_maintenance" as const,
                        label: "Maintenance",
                      },
                    ]}
                    value={status}
                    onChange={setStatus}
                  />
                </FieldRow>
              </>
            )}

            {step === "location" && (
              <>
                <FieldRow label="Address">
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Jodhpur district, Rajasthan 342001"
                      className="h-8 pl-8 text-sm"
                    />
                  </div>
                </FieldRow>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Latitude">
                    <Input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="26.2389"
                      className="h-8 text-sm font-mono"
                    />
                  </FieldRow>
                  <FieldRow label="Longitude">
                    <Input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="73.0243"
                      className="h-8 text-sm font-mono"
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="System capacity (kWp)">
                    <div className="relative">
                      <Zap className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={systemCapacityKwp}
                        onChange={(e) => setSystemCapacityKwp(e.target.value)}
                        placeholder="4800"
                        className="h-8 pl-8 text-sm"
                      />
                    </div>
                  </FieldRow>

                  <FieldRow label="Panel count">
                    <Input
                      type="number"
                      min="0"
                      value={panelCount}
                      onChange={(e) => setPanelCount(e.target.value)}
                      placeholder="e.g. 240"
                      className="h-8 text-sm"
                    />
                  </FieldRow>
                </div>

                <FieldRow label="Grid connection">
                  <SegmentedControl
                    options={GRID_TYPES}
                    value={gridConnectionType}
                    onChange={setGridConnectionType}
                  />
                </FieldRow>
              </>
            )}
          </div>

          <DialogFooter className="px-3 pt-2 pb-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              Cancel
            </Button>

            {step === "details" ? (
              <Button
                type="button"
                size="sm"
                disabled={!step1Valid}
                onClick={() => setStep("location")}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("details")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!step1Valid || isPending}
                  className="disabled:opacity-50"
                >
                  {isPending ? "Creating…" : "Create site"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSiteModal;
