import {
  Building2,
  Calendar,
  Check,
  MapPin,
  Plus,
  Search,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Site, SiteLabel } from "@/fetchers/site/get-sites";
import useCreateLabel from "@/hooks/mutations/label/use-create-label";
import useDeleteLabel from "@/hooks/mutations/label/use-delete-label";
import useUpdateSite from "@/hooks/mutations/site/use-update-site";
import useGetLabelsByWorkspace from "@/hooks/queries/label/use-get-labels-by-workspace";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

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

const STATUS_OPTIONS = [
  { value: "active" as const, label: "Active" },
  { value: "inactive" as const, label: "Inactive" },
  { value: "under_maintenance" as const, label: "Maintenance" },
];

const LABEL_COLORS = [
  { value: "gray", hex: "var(--color-stone-500)" },
  { value: "dark-gray", hex: "var(--color-slate-500)" },
  { value: "purple", hex: "var(--color-violet-500)" },
  { value: "teal", hex: "var(--color-emerald-600)" },
  { value: "green", hex: "var(--color-green-600)" },
  { value: "yellow", hex: "var(--color-amber-600)" },
  { value: "orange", hex: "var(--color-orange-600)" },
  { value: "pink", hex: "var(--color-rose-600)" },
  { value: "red", hex: "var(--color-red-600)" },
] as const;

type EditSiteModalProps = {
  open: boolean;
  onClose: () => void;
  site: Site;
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

function LabelPicker({
  siteId,
  workspaceId,
  activeLabels,
}: {
  siteId: string;
  workspaceId: string;
  activeLabels: SiteLabel[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [colorStep, setColorStep] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: workspaceLabels = [] } = useGetLabelsByWorkspace(workspaceId);
  const { mutateAsync: createLabel } = useCreateLabel();
  const { mutateAsync: deleteLabel } = useDeleteLabel();

  // workspace-level labels (no taskId, no siteId) for the suggestion pool
  const suggestions = workspaceLabels.filter(
    (l) =>
      !l.taskId &&
      !l.siteId &&
      l.name.toLowerCase().includes(search.toLowerCase()),
  );

  const isNewName =
    search.trim() &&
    !workspaceLabels.some(
      (l) => l.name.toLowerCase() === search.trim().toLowerCase(),
    );

  const activeNames = new Set(activeLabels.map((l) => l.name));

  const handleToggle = async (labelName: string, color: string) => {
    const existing = activeLabels.find((l) => l.name === labelName);
    try {
      if (existing) {
        await deleteLabel({ labelId: existing.id, workspaceId });
      } else {
        await createLabel({ name: labelName, color, workspaceId, siteId });
      }
    } catch {
      toast.error("Failed to update label");
    }
  };

  const handleColorPick = async (color: string) => {
    try {
      await createLabel({
        name: newLabelName.trim(),
        color,
        workspaceId,
        siteId,
      });
      setColorStep(false);
      setNewLabelName("");
      setSearch("");
      setOpen(false);
    } catch {
      toast.error("Failed to create label");
    }
  };

  useEffect(() => {
    if (open && !colorStep) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [open, colorStep]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {activeLabels.map((label) => {
          const colorMeta = LABEL_COLORS.find((c) => c.value === label.color);
          return (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 text-xs border border-border rounded-full px-2 py-0.5"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: colorMeta?.hex ?? "var(--color-neutral-400)",
                }}
              />
              <span className="max-w-24 truncate">{label.name}</span>
              <button
                type="button"
                onClick={() => handleToggle(label.name, label.color)}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          );
        })}
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setSearch("");
              setColorStep(false);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs border border-dashed border-border rounded-full px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
            >
              <Tag className="w-3 h-3" />
              Add label
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            {!colorStep ? (
              <>
                <div className="flex items-center gap-2 p-2 border-b border-border">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search or create…"
                    className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="py-1 max-h-44 overflow-y-auto">
                  {suggestions.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                      onClick={() => handleToggle(l.name, l.color)}
                    >
                      <div className="w-3.5 flex items-center justify-center">
                        {activeNames.has(l.name) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            LABEL_COLORS.find((c) => c.value === l.color)
                              ?.hex ?? "var(--color-neutral-400)",
                        }}
                      />
                      <span className="truncate">{l.name}</span>
                    </button>
                  ))}
                  {isNewName && (
                    <>
                      {suggestions.length > 0 && (
                        <div className="border-t border-border my-1" />
                      )}
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                        onClick={() => {
                          setNewLabelName(search.trim());
                          setColorStep(true);
                        }}
                      >
                        <Plus className="w-3 h-3 flex-shrink-0" />
                        Create &ldquo;{search.trim()}&rdquo;
                      </button>
                    </>
                  )}
                  {suggestions.length === 0 && !isNewName && (
                    <p className="text-xs text-muted-foreground px-3 py-2">
                      No labels found
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-2 border-b border-border">
                  <span className="text-xs font-medium">Pick a color</span>
                  <button type="button" onClick={() => setColorStep(false)}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                <div className="py-1">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                      onClick={() => handleColorPick(c.value)}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="capitalize">
                        {c.value.replace("-", " ")}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function EditSiteModal({ open, onClose, site }: EditSiteModalProps) {
  const { mutateAsync, isPending } = useUpdateSite(site.id);

  const [name, setName] = useState(site.name);
  const [siteType, setSiteType] = useState<
    (typeof SITE_TYPES)[number]["value"]
  >((site.siteType as (typeof SITE_TYPES)[number]["value"]) ?? "commercial");
  const [address, setAddress] = useState(site.address ?? "");
  const [latitude, setLatitude] = useState(
    site.latitude != null ? String(site.latitude) : "",
  );
  const [longitude, setLongitude] = useState(
    site.longitude != null ? String(site.longitude) : "",
  );
  const [systemCapacityKwp, setSystemCapacityKwp] = useState(
    site.systemCapacityKwp ?? "",
  );
  const [panelCount, setPanelCount] = useState(
    site.panelCount != null ? String(site.panelCount) : "",
  );
  const [inverterModel, setInverterModel] = useState(site.inverterModel ?? "");
  const [gridConnectionType, setGridConnectionType] = useState<
    (typeof GRID_TYPES)[number]["value"]
  >(
    (site.gridConnectionType as (typeof GRID_TYPES)[number]["value"]) ??
      "on_grid",
  );
  const [installationDate, setInstallationDate] = useState(
    site.installationDate ?? "",
  );
  const [status, setStatus] = useState<
    (typeof STATUS_OPTIONS)[number]["value"]
  >((site.status as (typeof STATUS_OPTIONS)[number]["value"]) ?? "active");

  // Re-sync when site prop changes
  useEffect(() => {
    setName(site.name);
    setSiteType(
      (site.siteType as (typeof SITE_TYPES)[number]["value"]) ?? "commercial",
    );
    setAddress(site.address ?? "");
    setLatitude(site.latitude != null ? String(site.latitude) : "");
    setLongitude(site.longitude != null ? String(site.longitude) : "");
    setSystemCapacityKwp(site.systemCapacityKwp ?? "");
    setPanelCount(site.panelCount != null ? String(site.panelCount) : "");
    setInverterModel(site.inverterModel ?? "");
    setGridConnectionType(
      (site.gridConnectionType as (typeof GRID_TYPES)[number]["value"]) ??
        "on_grid",
    );
    setInstallationDate(site.installationDate ?? "");
    setStatus(
      (site.status as (typeof STATUS_OPTIONS)[number]["value"]) ?? "active",
    );
  }, [site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync({
        siteId: site.id,
        name: name.trim(),
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
      toast.success("Site updated");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update site",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="px-3 pt-4 pb-1 gap-1.5 flex-shrink-0">
          <DialogTitle className="sr-only">Edit site</DialogTitle>
          <DialogDescription className="sr-only">
            Update site details
          </DialogDescription>
          <Breadcrumb>
            <BreadcrumbList className="gap-1 text-xs">
              <BreadcrumbItem className="text-muted-foreground font-medium tracking-wide truncate max-w-32">
                {site.name.toUpperCase()}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3.5" />
              <BreadcrumbItem className="text-foreground font-medium">
                Edit site
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {/* Name */}
            <Input
              unstyled
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Site / Plant name…"
              className="w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:py-2 [&_[data-slot=input]]:text-2xl [&_[data-slot=input]]:leading-tight [&_[data-slot=input]]:font-semibold [&_[data-slot=input]]:tracking-tight [&_[data-slot=input]]:text-foreground [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:outline-none"
              required
            />

            {/* Site ID — read-only */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Site ID:</span>
              <span className="font-mono text-foreground/70">
                {site.siteCode}
              </span>
              <span className="opacity-40">· auto-generated, not editable</span>
            </div>

            {/* Labels */}
            <FieldRow label="Labels">
              <LabelPicker
                siteId={site.id}
                workspaceId={site.workspaceId}
                activeLabels={site.labels}
              />
            </FieldRow>

            <div className="grid grid-cols-2 gap-3">
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
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
              />
            </FieldRow>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Location</span>
              <div className="flex-1 h-px bg-border" />
            </div>

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

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Capacity</span>
              <div className="flex-1 h-px bg-border" />
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

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Inverter model">
                <Input
                  value={inverterModel}
                  onChange={(e) => setInverterModel(e.target.value)}
                  placeholder="e.g. SMA Sunny Boy"
                  className="h-8 text-sm"
                />
              </FieldRow>
              <FieldRow label="Grid connection">
                <select
                  value={gridConnectionType}
                  onChange={(e) =>
                    setGridConnectionType(
                      e.target.value as typeof gridConnectionType,
                    )
                  }
                  className="w-full h-8 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  {GRID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 px-3 pt-2 pb-1 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || isPending}
              className="disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditSiteModal;
