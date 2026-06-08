import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Download,
  Filter,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  PlusCircle,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import Layout from "@/components/common/layout";
import PageTitle from "@/components/page-title";
import ContactModal from "@/components/shared/modals/contact-modal";
import CreateTaskModal from "@/components/shared/modals/create-task-modal";
import EditSiteModal from "@/components/shared/modals/edit-site-modal";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { SiteContact } from "@/fetchers/site/get-sites";
import useRemoveContact from "@/hooks/mutations/site/use-remove-contact";
import useGetSite from "@/hooks/queries/site/use-get-site";
import useGetSiteTasks from "@/hooks/queries/site/use-get-site-tasks";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { cn } from "@/lib/cn";
import { formatDateMedium } from "@/lib/format";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/sites/$siteId/",
)({
  component: RouteComponent,
});

const SITE_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  agricultural: "Agricultural",
};

const CONTACT_ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-500/20 text-violet-400",
  caretaker: "bg-blue-500/20 text-blue-400",
  security: "bg-orange-500/20 text-orange-400",
  manager: "bg-emerald-500/20 text-emerald-400",
  contractor: "bg-amber-500/20 text-amber-400",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  "to-do": {
    label: "Open",
    dot: "bg-red-500",
    badge: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  "in-progress": {
    label: "In progress",
    dot: "bg-blue-500",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  "in-review": {
    label: "Pending",
    dot: "bg-amber-500",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  done: {
    label: "Resolved",
    dot: "bg-emerald-500",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
};

function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      dot: "bg-zinc-400",
      badge: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    }
  );
}

function ContactAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  const sizeClass = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-10 h-10 text-sm",
  }[size];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        color,
        sizeClass,
      )}
    >
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-2xl font-semibold", valueClass)}>{value}</span>
    </div>
  );
}

function RouteComponent() {
  const { workspaceId, siteId } = Route.useParams();
  const navigate = useNavigate();
  const { data: workspace } = useActiveWorkspace();
  const { data: site, isLoading: siteLoading } = useGetSite(siteId);
  const { data: tasks = [], isLoading: tasksLoading } = useGetSiteTasks(siteId);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [editSiteOpen, setEditSiteOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SiteContact | undefined>(
    undefined,
  );
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const { mutateAsync: removeContact } = useRemoveContact(siteId);

  const openTasks = tasks.filter((t) => t.status === "to-do").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const resolvedLast30 = tasks.filter((t) => {
    if (t.status !== "done") return false;
    const created = new Date(t.createdAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return created >= cutoff;
  }).length;

  const displayedTasks = showAllTasks ? tasks : tasks.slice(0, 6);

  if (siteLoading) {
    return (
      <>
        <PageTitle title="Site" />
        <Layout>
          <Layout.Header>
            <Skeleton className="h-5 w-64" />
          </Layout.Header>
          <Layout.Content>
            <div className="grid grid-cols-2 gap-4 p-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </Layout.Content>
        </Layout>
      </>
    );
  }

  if (!site) {
    return (
      <Layout>
        <Layout.Header>
          <span className="text-sm text-muted-foreground">Site not found</span>
        </Layout.Header>
        <Layout.Content>
          <div className="flex items-center justify-center h-full text-muted-foreground">
            This site does not exist or you don&apos;t have access.
          </div>
        </Layout.Content>
      </Layout>
    );
  }

  // const primaryContact =
  //   site.contacts.find((c) => c.isPrimary) ?? site.contacts[0];

  return (
    <>
      <PageTitle title={site.name} />
      <CreateTaskModal
        open={newRequestOpen}
        onClose={() => setNewRequestOpen(false)}
      />
      <EditSiteModal
        open={editSiteOpen}
        onClose={() => setEditSiteOpen(false)}
        site={site}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setEditingContact(undefined);
        }}
        siteId={siteId}
        siteName={site.name}
        workspaceId={site.workspaceId}
        contact={editingContact}
      />
      <AlertDialog
        open={!!deleteContactId}
        onOpenChange={(open) => {
          if (!open) setDeleteContactId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the contact from this site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </AlertDialogClose>
            <AlertDialogClose
              onClick={async () => {
                if (!deleteContactId) return;
                try {
                  await removeContact({ contactId: deleteContactId });
                  toast.success("Contact removed");
                } catch {
                  toast.error("Failed to remove contact");
                }
                setDeleteContactId(null);
              }}
            >
              <Button variant="destructive" size="sm">
                Remove
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Layout>
        <Layout.Header>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 min-w-0">
              <SidebarTrigger className="-ml-1 h-6 w-6 flex-shrink-0" />
              <div className="mx-1.5 h-4 w-px shrink-0 bg-border/80" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/dashboard/workspace/${workspaceId}`}
                      className="text-xs text-muted-foreground"
                    >
                      {workspace?.name ?? workspaceId.slice(0, 3).toUpperCase()}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/dashboard/workspace/${workspaceId}/sites`}
                      className="text-xs text-muted-foreground"
                    >
                      Sites
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-xs text-foreground font-medium">
                      {site.name} — {site.siteCode}
                    </span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {/* Status badge */}
              <div className="ml-3 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium text-emerald-400 capitalize">
                  {site.status.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="xs"
                className="gap-1"
                onClick={() => setEditSiteOpen(true)}
              >
                <Pencil className="w-3 h-3" />
                Edit site
              </Button>
              <Button
                size="xs"
                className="gap-1"
                onClick={() => setNewRequestOpen(true)}
              >
                <PlusCircle className="w-3 h-3" />
                New request
              </Button>
            </div>
          </div>
        </Layout.Header>

        <Layout.Content>
          <div className="p-4 space-y-4">
            {/* Top two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Site details */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Building2 className="w-3.5 h-3.5" />
                  Site details
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Site ID
                    </p>
                    <p className="text-sm font-mono font-medium">
                      {site.siteCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Plant type
                    </p>
                    <p className="text-sm">
                      {site.inverterModel
                        ? `${SITE_TYPE_LABELS[site.siteType] ?? site.siteType} solar`
                        : (SITE_TYPE_LABELS[site.siteType] ?? site.siteType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Capacity
                    </p>
                    <p className="text-sm font-medium">
                      {site.systemCapacityKwp
                        ? `${Number(site.systemCapacityKwp) >= 1000 ? `${(Number(site.systemCapacityKwp) / 1000).toFixed(1)} MWp` : `${site.systemCapacityKwp} kWp`}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Commissioned
                    </p>
                    <p className="text-sm">
                      {site.installationDate
                        ? formatDateMedium(new Date(site.installationDate))
                        : "—"}
                    </p>
                  </div>
                </div>

                {site.address && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Location
                    </p>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm">{site.address}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <StatCard label="Open requests" value={openTasks} />
                  <StatCard
                    label="In progress"
                    value={inProgressTasks}
                    valueClass="text-blue-400"
                  />
                  <StatCard
                    label="Resolved (30d)"
                    value={resolvedLast30}
                    valueClass="text-emerald-400"
                  />
                </div>
              </div>

              {/* Right: Site location map placeholder */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5" />
                  Site location
                </div>

                {/* Map placeholder */}
                <div className="bg-muted/40 border border-border rounded-lg h-40 flex flex-col items-center justify-center gap-2">
                  <Building2 className="w-8 h-8 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    Map preview
                  </span>
                  <Button variant="outline" size="xs" className="gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    Open full map
                  </Button>
                </div>

                {site.address && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
                      <span className="text-sm">{site.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Contacts
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  className="gap-1"
                  onClick={() => {
                    setEditingContact(undefined);
                    setContactModalOpen(true);
                  }}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>

              {site.contacts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <p className="text-sm">No contacts added yet.</p>
                  <Button
                    variant="outline"
                    size="xs"
                    className="gap-1"
                    onClick={() => {
                      setEditingContact(undefined);
                      setContactModalOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Add first contact
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {site.contacts.map((contact) => {
                    const roleColorClass =
                      CONTACT_ROLE_COLORS[contact.role] ??
                      "bg-zinc-500/20 text-zinc-400";
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 py-3 first:pt-1"
                      >
                        <ContactAvatar name={contact.name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {contact.name}
                            </span>
                            {contact.isPrimary && (
                              <span className="text-[10px] text-muted-foreground">
                                · Primary
                              </span>
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-xs capitalize px-1.5 py-0.5 rounded",
                              roleColorClass,
                            )}
                          >
                            {contact.role.replace("_", " ")}
                          </span>
                        </div>
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </a>
                        )}
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <button
                            type="button"
                            title="Edit contact"
                            className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            onClick={() => {
                              setEditingContact(contact);
                              setContactModalOpen(true);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Remove contact"
                            className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors"
                            onClick={() => setDeleteContactId(contact.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Maintenance requests table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Maintenance requests
                  </span>
                  <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    {tasks.length} total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="xs" className="gap-1">
                    <Filter className="w-3 h-3" />
                    Filter
                  </Button>
                  <Button variant="outline" size="xs" className="gap-1">
                    <Download className="w-3 h-3" />
                    Export
                  </Button>
                </div>
              </div>

              {tasksLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Zap className="w-8 h-8 opacity-20" />
                  <span className="text-sm">No maintenance requests yet</span>
                  <Button
                    variant="outline"
                    size="xs"
                    className="mt-1 gap-1"
                    onClick={() => setNewRequestOpen(true)}
                  >
                    <Plus className="w-3 h-3" />
                    Create first request
                  </Button>
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left font-medium py-2 px-4 w-6">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                          />
                        </th>
                        <th className="text-left font-medium py-2 px-2">
                          Request title
                        </th>
                        <th className="text-left font-medium py-2 px-2">
                          Issue type
                        </th>
                        <th className="text-left font-medium py-2 px-2">
                          Raised by
                        </th>
                        <th className="text-left font-medium py-2 px-2">
                          Status
                        </th>
                        <th className="text-left font-medium py-2 px-2">
                          Due date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {displayedTasks.map((task) => {
                        const statusCfg = getStatusConfig(task.status);
                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-accent/30 transition-colors group cursor-pointer"
                            onClick={() => {
                              if (task.zoneId) {
                                navigate({
                                  to: "/dashboard/workspace/$workspaceId/zone/$zoneId/task/$taskId",
                                  params: {
                                    workspaceId,
                                    zoneId: task.zoneId,
                                    taskId: task.id,
                                  },
                                });
                              }
                            }}
                          >
                            <td className="py-2.5 px-4">
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="font-medium text-sm">
                                {task.title}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="text-sm text-muted-foreground">
                                {task.serviceMasterName ?? "—"}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              {task.siteContactName ? (
                                <div className="flex items-center gap-1.5">
                                  <ContactAvatar
                                    name={task.siteContactName}
                                    size="sm"
                                  />
                                  <span className="text-sm">
                                    {task.siteContactName.split(" ")[0]}{" "}
                                    {task.siteContactName.split(" ")[1]?.[0]}.
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2">
                              <div
                                className={cn(
                                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                                  statusCfg.badge,
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    statusCfg.dot,
                                  )}
                                />
                                {statusCfg.label}
                              </div>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="text-sm text-muted-foreground">
                                {task.dueDate
                                  ? formatDateMedium(new Date(task.dueDate))
                                  : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {tasks.length > 6 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
                      <span>
                        Showing {displayedTasks.length} of {tasks.length}{" "}
                        requests
                      </span>
                      <button
                        type="button"
                        className="text-primary hover:underline text-xs"
                        onClick={() => setShowAllTasks((v) => !v)}
                      >
                        {showAllTasks ? "Show less" : "View all"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* AMC Contract quick link */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Annual Maintenance Contract
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View AMC details, service usage, and coverage limits.
                  </p>
                </div>
                <Link
                  to="/dashboard/workspace/$workspaceId/sites/$siteId/amc"
                  params={{ workspaceId, siteId }}
                >
                  <Button variant="outline" size="sm">
                    View AMC
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Layout.Content>
      </Layout>
    </>
  );
}
