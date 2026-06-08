import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  ChevronDown,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import CreateSiteModal from "@/components/shared/modals/create-site-modal";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useGetSites from "@/hooks/queries/site/use-get-sites";
import { cn } from "@/lib/cn";

const LABEL_COLOR_HEX: Record<string, string> = {
  gray: "var(--color-stone-500)",
  "dark-gray": "var(--color-slate-500)",
  purple: "var(--color-violet-500)",
  teal: "var(--color-emerald-600)",
  green: "var(--color-green-600)",
  yellow: "var(--color-amber-600)",
  orange: "var(--color-orange-600)",
  pink: "var(--color-rose-600)",
  red: "var(--color-red-600)",
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/sites/",
)({
  component: RouteComponent,
});

const SITE_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  agricultural: "Agricultural",
};

const STATUS_COLORS: Record<string, { dot: string; label: string }> = {
  active: { dot: "bg-emerald-500", label: "Active" },
  inactive: { dot: "bg-zinc-400", label: "Inactive" },
  under_maintenance: { dot: "bg-amber-500", label: "Under maintenance" },
};

// function FilterChip({
//   label,
//   active,
//   onClear,
// }: {
//   label: string;
//   active: boolean;
//   onClear: () => void;
// }) {
//   if (!active) return null;
//   return (
//     <span className="inline-flex items-center gap-1 text-xs bg-accent border border-border rounded-full px-2 py-0.5 text-foreground">
//       {label}
//       <button
//         type="button"
//         onClick={onClear}
//         className="hover:text-destructive transition-colors"
//       >
//         <X className="w-2.5 h-2.5" />
//       </button>
//     </span>
//   );
// }

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  // const { data: workspace } = useActiveWorkspace();
  const navigate = useNavigate();
  const { data: sites = [], isLoading } = useGetSites(workspaceId);
  const [createOpen, setCreateOpen] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);

  // All site-scoped labels across loaded sites (deduplicated by name)
  const siteLabels = useMemo(() => {
    const seen = new Map<string, { name: string; color: string }>();
    for (const site of sites) {
      for (const l of site.labels) {
        if (!seen.has(l.name))
          seen.set(l.name, { name: l.name, color: l.color });
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [sites]);

  const activeFilterCount = [filterType, filterStatus, filterLabel].filter(
    Boolean,
  ).length;

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sites.filter((site) => {
      if (
        q &&
        !site.name.toLowerCase().includes(q) &&
        !site.siteCode.toLowerCase().includes(q) &&
        !(site.address ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filterType && site.siteType !== filterType) return false;
      if (filterStatus && site.status !== filterStatus) return false;
      if (filterLabel && !site.labels.some((l) => l.name === filterLabel))
        return false;
      return true;
    });
  }, [sites, search, filterType, filterStatus, filterLabel]);

  const clearAll = () => {
    setSearch("");
    setFilterType(null);
    setFilterStatus(null);
    setFilterLabel(null);
  };

  const handleSiteClick = (siteId: string) => {
    navigate({
      to: "/dashboard/workspace/$workspaceId/sites/$siteId",
      params: { workspaceId, siteId },
    });
  };

  const toolbar = (
    <div className="flex items-center gap-2 w-full border-b border-border px-4 py-2.5">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sites…"
          className="w-full h-7 pl-8 pr-8 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Type filter */}
      <Popover open={typeOpen} onOpenChange={setTypeOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-xs font-medium transition-colors",
              filterType
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Type
            {filterType && (
              <span className="font-semibold">
                : {SITE_TYPE_LABELS[filterType]}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1" align="start">
          {Object.entries(SITE_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 rounded text-left transition-colors"
              onClick={() => {
                setFilterType(filterType === value ? null : value);
                setTypeOpen(false);
              }}
            >
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                {filterType === value && <Check className="w-3 h-3" />}
              </div>
              {label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Status filter */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-xs font-medium transition-colors",
              filterStatus
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            Status
            {filterStatus && (
              <span className="font-semibold">
                : {STATUS_COLORS[filterStatus]?.label}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          {Object.entries(STATUS_COLORS).map(([value, { dot, label }]) => (
            <button
              key={value}
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 rounded text-left transition-colors"
              onClick={() => {
                setFilterStatus(filterStatus === value ? null : value);
                setStatusOpen(false);
              }}
            >
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                {filterStatus === value ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
                )}
              </div>
              {label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Label filter */}
      {siteLabels.length > 0 && (
        <Popover open={labelOpen} onOpenChange={setLabelOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-xs font-medium transition-colors",
                filterLabel
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Tag className="w-3 h-3" />
              Label
              {filterLabel && (
                <span className="font-semibold">: {filterLabel}</span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            {siteLabels.map((l) => (
              <button
                key={l.name}
                type="button"
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 rounded text-left transition-colors"
                onClick={() => {
                  setFilterLabel(filterLabel === l.name ? null : l.name);
                  setLabelOpen(false);
                }}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  {filterLabel === l.name ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          LABEL_COLOR_HEX[l.color] ??
                          "var(--color-neutral-400)",
                      }}
                    />
                  )}
                </div>
                <span className="truncate">{l.name}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}

      {/* Clear all */}
      {(search || activeFilterCount > 0) && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          Clear
        </button>
      )}

      {/* Result count */}
      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
        {filteredSites.length} of {sites.length}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <PageTitle title="Sites" />
        <WorkspaceLayout title="Sites">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Site ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </WorkspaceLayout>
      </>
    );
  }

  if (sites.length === 0) {
    return (
      <>
        <PageTitle title="Sites" />
        <WorkspaceLayout
          title="Sites"
          headerActions={
            <Button
              variant="outline"
              size="xs"
              className="gap-1"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add site
            </Button>
          }
        >
          <Empty className="min-h-[60vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>No sites yet</EmptyTitle>
              <EmptyDescription>
                Add solar installation sites to start tracking maintenance
                requests by location.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button className="gap-1" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                Add site
              </Button>
            </EmptyContent>
          </Empty>
        </WorkspaceLayout>

        <CreateSiteModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          workspaceId={workspaceId}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle title="Sites" />
      <WorkspaceLayout
        title="Sites"
        headerActions={
          <Button
            variant="outline"
            size="xs"
            className="gap-1"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-3 h-3" />
            Add site
          </Button>
        }
      >
        {toolbar}

        {filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <Search className="w-8 h-8 opacity-20" />
            <p className="text-sm">No sites match your search</p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  Site
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Site ID
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Type
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Capacity
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Location
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Labels
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Contacts
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site) => {
                const statusMeta =
                  STATUS_COLORS[site.status] ?? STATUS_COLORS.inactive;
                return (
                  <TableRow
                    key={site.id}
                    className="cursor-pointer"
                    onClick={() => handleSiteClick(site.id)}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{site.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {site.siteCode}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm text-muted-foreground">
                        {SITE_TYPE_LABELS[site.siteType] ?? site.siteType}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      {site.systemCapacityKwp ? (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {site.systemCapacityKwp} kWp
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {site.address ? (
                        <div className="flex items-center gap-1 max-w-48">
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {site.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {site.labels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {site.labels.slice(0, 3).map((l) => (
                            <span
                              key={l.id}
                              className="inline-flex items-center gap-1 text-[11px] border border-border rounded-full px-1.5 py-0.5"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    LABEL_COLOR_HEX[l.color] ??
                                    "var(--color-neutral-400)",
                                }}
                              />
                              <span className="max-w-16 truncate">
                                {l.name}
                              </span>
                            </span>
                          ))}
                          {site.labels.length > 3 && (
                            <span className="text-[11px] text-muted-foreground">
                              +{site.labels.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm text-muted-foreground">
                        {site.contacts.length}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            statusMeta.dot,
                          )}
                        />
                        <span className="text-xs">{statusMeta.label}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </WorkspaceLayout>

      <CreateSiteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        workspaceId={workspaceId}
      />
    </>
  );
}
