import { useLocation } from "@tanstack/react-router";
import { produce } from "immer";
import {
  CalendarIcon,
  Check,
  ChevronDown,
  Lock,
  MapPin,
  Plus,
  Search,
  Tag,
  UserIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TaskDescriptionEditor from "@/components/task/task-description-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TaskAssignee } from "@/fetchers/task/create-task";
import useCreateLabel from "@/hooks/mutations/label/use-create-label";
import useCreateTask from "@/hooks/mutations/task/use-create-task";
import { useDeleteTask } from "@/hooks/mutations/task/use-delete-task";
import { useUpdateTask } from "@/hooks/mutations/task/use-update-task";
import useGetLabelsByWorkspace from "@/hooks/queries/label/use-get-labels-by-workspace";
import useGetServices from "@/hooks/queries/service-master/use-get-services";
import useGetSites from "@/hooks/queries/site/use-get-sites";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { useGetActiveWorkspaceUsers } from "@/hooks/queries/workspace-users/use-get-active-workspace-users";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { cn } from "@/lib/cn";
import { formatDateMedium } from "@/lib/format";
import { getPriorityIcon } from "@/lib/priority";
import { toast } from "@/lib/toast";
import useProjectStore from "@/store/project";
import type Task from "@/types/task";

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
  status?: string;
  zoneId?: string;
};

type Priority = "no-priority" | "low" | "medium" | "high" | "urgent";

type LabelColor =
  | "gray"
  | "dark-gray"
  | "purple"
  | "teal"
  | "green"
  | "yellow"
  | "orange"
  | "pink"
  | "red";

type Label = {
  id: string;
  name: string;
  color: string;
  taskId: string | null;
  workspaceId: string;
  createdAt: string;
};

type PopoverStep = "select" | "color";

function normalizeTask(
  task: Partial<Task> &
    Pick<Task, "id" | "title" | "status" | "zoneId" | "createdAt">,
): Task {
  return {
    ...task,
    number: task.number ?? null,
    description: task.description ?? null,
    priority: task.priority ?? null,
    startDate: task.startDate ?? null,
    dueDate: task.dueDate ?? null,
    position: task.position ?? 0,
    userId: task.userId ?? null,
    assigneeId: task.assigneeId ?? task.userId ?? null,
    assigneeName: task.assigneeName ?? null,
    assigneeImage: task.assigneeImage ?? null,
    labels: task.labels ?? [],
    externalLinks: task.externalLinks ?? [],
  };
}

function CreateTaskModal({
  open,
  onClose,
  status,
  zoneId,
}: CreateTaskModalProps) {
  const { t } = useTranslation();
  const { project, setProject } = useProjectStore();

  const labelColors = useMemo(
    () =>
      [
        {
          value: "gray" as LabelColor,
          labelKey: "stone" as const,
          color: "var(--color-stone-500)",
        },
        {
          value: "dark-gray" as LabelColor,
          labelKey: "slate" as const,
          color: "var(--color-slate-500)",
        },
        {
          value: "purple" as LabelColor,
          labelKey: "lavender" as const,
          color: "var(--color-violet-500)",
        },
        {
          value: "teal" as LabelColor,
          labelKey: "sage" as const,
          color: "var(--color-emerald-600)",
        },
        {
          value: "green" as LabelColor,
          labelKey: "forest" as const,
          color: "var(--color-green-600)",
        },
        {
          value: "yellow" as LabelColor,
          labelKey: "amber" as const,
          color: "var(--color-amber-600)",
        },
        {
          value: "orange" as LabelColor,
          labelKey: "terracotta" as const,
          color: "var(--color-orange-600)",
        },
        {
          value: "pink" as LabelColor,
          labelKey: "rose" as const,
          color: "var(--color-rose-600)",
        },
        {
          value: "red" as LabelColor,
          labelKey: "crimson" as const,
          color: "var(--color-red-600)",
        },
      ].map(({ labelKey, ...rest }) => ({
        ...rest,
        label: t(`common:modals.createTask.labelColors.${labelKey}`),
      })),
    [t],
  );
  const location = useLocation();
  const { data: workspace } = useActiveWorkspace();
  const { data: workspaceUsers } = useGetActiveWorkspaceUsers(
    workspace?.id || "",
  );
  const { mutateAsync: createLabel } = useCreateLabel();
  const { data: workspaceLabels = [] } = useGetLabelsByWorkspace(
    workspace?.id || "",
  );
  const { canManageTasks, canManageLabels } = useWorkspacePermission();
  const canCreateTaskCapability = canManageTasks();
  const canCreateLabelCapability = canManageLabels();

  const { data: sites = [] } = useGetSites(workspace?.id || "");
  const { data: services = [] } = useGetServices(workspace?.id || "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("no-priority");
  const [assignees, setAssignees] = useState<TaskAssignee[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [createMore, setCreateMore] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [draftTask, setDraftTask] = useState<Task | null>(null);

  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(
    undefined,
  );
  const [selectedServiceMasterId, setSelectedServiceMasterId] = useState<
    string | undefined
  >(undefined);
  const [selectedContactId, setSelectedContactId] = useState<
    string | undefined
  >(undefined);
  const [siteSearchValue, setSiteSearchValue] = useState("");
  const [siteOpen, setSiteOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const selectedService = services.find(
    (s) => s.id === selectedServiceMasterId,
  );
  const selectedContact = selectedSite?.contacts.find(
    (c) => c.id === selectedContactId,
  );

  const isTitleAutoGenerated = !!(selectedSite && selectedService);
  const autoGeneratedTitle = isTitleAutoGenerated
    ? `${selectedService.name} — ${selectedSite.name}, ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
    : "";

  const [labelsOpen, setLabelsOpen] = useState(false);
  const [labelsStep, setLabelsStep] = useState<PopoverStep>("select");
  const [searchValue, setSearchValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<LabelColor>("gray");
  const [newLabelName, setNewLabelName] = useState("");

  const routezoneId = location.pathname.match(/\/zone\/([^/]+)/)?.[1] ?? null;
  const resolvedzoneId = zoneId || project?.id || routezoneId || "";

  const searchInputRef = useRef<HTMLInputElement>(null);
  const draftCreationPromiseRef = useRef<Promise<Task> | null>(null);
  const didSubmitRef = useRef(false);

  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: deleteTask } = useDeleteTask();

  const filteredLabels = (() => {
    const searchFiltered = workspaceLabels.filter((label) =>
      label.name.toLowerCase().includes(searchValue.toLowerCase()),
    );

    const labelMap = new Map<string, (typeof workspaceLabels)[0]>();
    for (const label of searchFiltered) {
      const existing = labelMap.get(label.name);
      if (!existing || (label.taskId === null && existing.taskId !== null)) {
        labelMap.set(label.name, label);
      }
    }

    return Array.from(labelMap.values());
  })();

  const isCreatingNewLabel =
    searchValue &&
    !workspaceLabels.some(
      (label) => label.name.toLowerCase() === searchValue.toLowerCase(),
    );

  const handleClose = () => {
    const shouldDeleteDraft = draftTask && !didSubmitRef.current;

    setTitle("");
    setDescription("");
    setPriority("no-priority");
    setAssignees([]);
    setStartDate(undefined);
    setDueDate(undefined);
    setCreateMore(false);
    setLabels([]);
    setLabelsStep("select");
    setSearchValue("");
    setSelectedColor("gray");
    setNewLabelName("");
    setSelectedSiteId(undefined);
    setSelectedServiceMasterId(undefined);
    setSelectedContactId(undefined);
    setSiteSearchValue("");
    draftCreationPromiseRef.current = null;
    didSubmitRef.current = false;
    setDraftTask(null);
    onClose();

    if (shouldDeleteDraft) {
      void deleteTask(draftTask.id).catch(() => {
        // ignore cleanup failures for abandoned empty drafts
      });
    }
  };

  const syncTaskIntoProject = useCallback(
    (task: Task) => {
      if (!project) return;

      const updatedProject = produce(project, (draft) => {
        let existingTask:
          | (typeof draft.columns)[number]["tasks"][number]
          | undefined;

        for (const column of draft.columns ?? []) {
          const taskIndex = column.tasks.findIndex(
            (columnTask) => columnTask.id === task.id,
          );

          if (taskIndex !== -1) {
            existingTask = column.tasks[taskIndex];
            column.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (task.status === "planned" || task.status === "archived") {
          return;
        }

        const targetColumn = draft.columns?.find(
          (column) => column.id === task.status,
        );
        if (!targetColumn) return;

        targetColumn.tasks.push({
          ...existingTask,
          ...task,
          assigneeId: task.userId,
          assigneeName:
            workspaceUsers?.members?.find(
              (member) => member.userId === task.userId,
            )?.user?.name ??
            existingTask?.assigneeName ??
            null,
          assigneeImage:
            workspaceUsers?.members?.find(
              (member) => member.userId === task.userId,
            )?.user?.image ??
            existingTask?.assigneeImage ??
            null,
          position: task.position ?? 0,
        });
      });

      setProject(updatedProject);
    },
    [project, setProject, workspaceUsers?.members],
  );

  const ensureDraftTask = useCallback(async () => {
    if (draftTask) {
      return draftTask.id;
    }

    if (draftCreationPromiseRef.current) {
      const pendingTask = await draftCreationPromiseRef.current;
      return pendingTask.id;
    }

    if (!resolvedzoneId) {
      toast.error(t("common:modals.createTask.chooseProjectForImages"));
      return null;
    }

    const draftStatus = "planned";
    const draftPromise = createTask({
      title: title.trim() || t("common:modals.createTask.untitledTask"),
      description: description.trim() || "",
      assignees,
      priority,
      zoneId: resolvedzoneId,
      startDate: startDate ? startDate.toISOString() : undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      status: draftStatus,
    }).then((task) => normalizeTask(task));

    draftCreationPromiseRef.current = draftPromise;

    try {
      const createdTask = await draftPromise;
      setDraftTask(createdTask);
      return createdTask.id;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("common:modals.createTask.prepareTaskError"),
      );
      return null;
    } finally {
      draftCreationPromiseRef.current = null;
    }
  }, [
    assignees,
    createTask,
    description,
    draftTask,
    startDate,
    dueDate,
    priority,
    resolvedzoneId,
    title,
    t,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTitle = isTitleAutoGenerated
      ? autoGeneratedTitle
      : title.trim();
    if (!effectiveTitle || !resolvedzoneId || !workspace?.id) return;

    try {
      const taskStatus = status ?? "to-do";
      didSubmitRef.current = true;

      const savedTask = draftTask
        ? normalizeTask(
            await updateTask({
              ...draftTask,
              title: effectiveTitle,
              description: description.trim() || "",
              userId: null,
              status: taskStatus,
              priority,
              startDate: startDate ? startDate.toISOString() : null,
              dueDate: dueDate ? dueDate.toISOString() : null,
              zoneId: resolvedzoneId,
            }),
          )
        : normalizeTask(
            await createTask({
              title: effectiveTitle,
              description: description.trim() || "",
              assignees,
              priority,
              zoneId: resolvedzoneId,
              startDate: startDate ? startDate.toISOString() : undefined,
              dueDate: dueDate ? dueDate.toISOString() : undefined,
              status: taskStatus,
              siteId: selectedSiteId,
              siteContactId: selectedContactId,
              serviceMasterId: selectedServiceMasterId,
            }),
          );

      for (const label of labels) {
        try {
          await createLabel({
            name: label.name,
            color: label.color,
            taskId: savedTask.id,
            workspaceId: workspace.id,
          });
        } catch (error) {
          console.error("Failed to create label:", error);
        }
      }

      setDraftTask(savedTask);
      syncTaskIntoProject(savedTask);
      toast.success(
        draftTask
          ? t("common:modals.createTask.successUpdated")
          : t("common:modals.createTask.successCreated"),
      );

      if (createMore) {
        setTitle("");
        setDescription("");
        setPriority("no-priority");
        setAssignees([]);
        setStartDate(undefined);
        setDueDate(undefined);
        setLabels([]);
        setLabelsStep("select");
        setSearchValue("");
        setSelectedColor("gray");
        setNewLabelName("");
        setSelectedSiteId(undefined);
        setSelectedServiceMasterId(undefined);
        setSelectedContactId(undefined);
        setSiteSearchValue("");
        draftCreationPromiseRef.current = null;
        didSubmitRef.current = false;
        setDraftTask(null);
      } else {
        handleClose();
      }
    } catch (error) {
      didSubmitRef.current = false;
      toast.error(
        error instanceof Error
          ? error.message
          : t("common:modals.createTask.createError"),
      );
    }
  };

  const priorityOptions = useMemo(
    () =>
      (["no-priority", "low", "medium", "high", "urgent"] as const).map(
        (value) => ({
          value,
          label: t(`tasks:priority.${value}`),
        }),
      ),
    [t],
  );

  const selectedPriority = priorityOptions.find((p) => p.value === priority);

  const statusLabel = useMemo(() => {
    if (status) {
      return t(`tasks:status.${status}`);
    }
    return t("tasks:status.in-progress");
  }, [status, t]);
  const toggleAssignee = (userId: string) => {
    setAssignees((prev) => {
      const existing = prev.find((a) => a.userId === userId);
      if (existing) {
        return prev.filter((a) => a.userId !== userId);
      }
      return [...prev, { userId, role: "engineer" }];
    });
  };

  const toggleAssigneeRole = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignees((prev) =>
      prev.map((a) =>
        a.userId === userId
          ? { ...a, role: a.role === "engineer" ? "supervisor" : "engineer" }
          : a,
      ),
    );
  };

  useEffect(() => {
    if (labelsOpen && labelsStep === "select" && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [labelsOpen, labelsStep]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        const effectiveTitle = isTitleAutoGenerated
          ? autoGeneratedTitle
          : title.trim();
        if (effectiveTitle && project?.id && workspace?.id) {
          const form = document.querySelector("form");
          if (form) {
            form.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true }),
            );
          }
        }
      }
    },
    [
      open,
      title,
      project?.id,
      workspace?.id,
      isTitleAutoGenerated,
      autoGeneratedTitle,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const resetLabelsPopover = () => {
    setLabelsStep("select");
    setSearchValue("");
    setNewLabelName("");
    setSelectedColor("gray");
  };

  const handleLabelsClose = () => {
    setLabelsOpen(false);
    setTimeout(resetLabelsPopover, 200);
  };

  const toggleLabel = (labelName: string) => {
    const existingLabel = labels.find((l) => l.name === labelName);
    if (existingLabel) {
      setLabels(labels.filter((l) => l.name !== labelName));
    } else {
      const workspaceLabel = workspaceLabels.find((l) => l.name === labelName);
      if (workspaceLabel) {
        setLabels([
          ...labels,
          {
            id: workspaceLabel.id,
            name: workspaceLabel.name,
            color: workspaceLabel.color,
            taskId: null,
            workspaceId: workspaceLabel.workspaceId || "",
            createdAt: workspaceLabel.createdAt,
          },
        ]);
      }
    }
  };

  const handleCreateNewClick = () => {
    setNewLabelName(searchValue);
    setLabelsStep("color");
  };

  const handleColorSelect = async (color: LabelColor) => {
    setSelectedColor(color);

    if (!newLabelName.trim() || !workspace?.id) return;

    try {
      const createdLabel = await createLabel({
        name: newLabelName.trim(),
        color: color,
        workspaceId: workspace.id,
      });

      const newLabel: Label = {
        id: createdLabel.id,
        name: createdLabel.name,
        color: createdLabel.color,
        taskId: createdLabel.taskId ?? null,
        workspaceId: createdLabel.workspaceId ?? workspace.id,
        createdAt: createdLabel.createdAt,
      };

      setLabels([...labels, newLabel]);
      toast.success(t("common:modals.createTask.labelCreated"));
      handleLabelsClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("common:modals.createTask.labelCreateError"),
      );
    }
  };

  const removeLabel = (labelName: string) => {
    setLabels(labels.filter((l) => l.name !== labelName));
  };

  // Defense-in-depth: if the user lacks task-create permission, don't render
  // the modal even if a stale trigger somehow opens it (e.g., keyboard
  // shortcut after the capability has changed).
  if (!canCreateTaskCapability) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="solarplan-create-task-modal max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle asChild>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="text-muted-foreground font-semibold tracking-wider text-sm">
                  {project?.slug?.toUpperCase() ||
                    t("common:modals.createTask.breadcrumbTask")}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="text-foreground font-medium text-sm">
                  {t("common:modals.createTask.title")}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("common:modals.createTask.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 space-y-6"
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6">
            {/* Request title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Request title
                </span>
                {isTitleAutoGenerated && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 border border-emerald-500/40 rounded-full px-2 py-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    Auto-generated
                  </span>
                )}
              </div>
              {isTitleAutoGenerated ? (
                <div className="flex items-center gap-2 px-0 py-3 text-2xl font-semibold tracking-tight text-foreground border-none outline-none bg-transparent select-none opacity-70">
                  {autoGeneratedTitle}
                </div>
              ) : (
                <Input
                  unstyled
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  disabled
                  placeholder={t(
                    "common:modals.createTask.taskTitlePlaceholder",
                  )}
                  className="w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:py-3 [&_[data-slot=input]]:text-2xl [&_[data-slot=input]]:leading-tight [&_[data-slot=input]]:font-semibold [&_[data-slot=input]]:tracking-tight [&_[data-slot=input]]:text-foreground [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:outline-none"
                  required={!isTitleAutoGenerated}
                />
              )}
              {isTitleAutoGenerated && (
                <p className="text-[10px] text-muted-foreground">
                  Generated as: [Service type] — [Site name], [Date]
                </p>
              )}
            </div>

            {/* Site details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium shrink-0">
                  Site details
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Site / Plant name */}
                <div className="space-y-1">
                  <label
                    htmlFor={"a"}
                    className="text-xs text-muted-foreground"
                  >
                    Site / Plant name
                  </label>
                  <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md hover:bg-accent/50 transition-colors text-left"
                      >
                        <span
                          className={
                            selectedSite
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedSite ? selectedSite.name : "Select site…"}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <div className="flex items-center gap-2 p-2 border-b border-border">
                        <Search className="w-3 h-3 text-muted-foreground" />
                        <input
                          value={siteSearchValue}
                          onChange={(e) => setSiteSearchValue(e.target.value)}
                          placeholder="Search sites…"
                          className="w-full bg-transparent text-xs border-none focus:outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="py-1 max-h-48 overflow-y-auto">
                        {sites
                          .filter((s) =>
                            s.name
                              .toLowerCase()
                              .includes(siteSearchValue.toLowerCase()),
                          )
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50 text-left"
                              onClick={() => {
                                setSelectedSiteId(s.id);
                                setSelectedContactId(undefined);
                                setSiteSearchValue("");
                                setSiteOpen(false);
                              }}
                            >
                              {selectedSiteId === s.id && (
                                <Check className="w-3 h-3 flex-shrink-0" />
                              )}
                              {selectedSiteId !== s.id && (
                                <div className="w-3 h-3 flex-shrink-0" />
                              )}
                              <span className="truncate">{s.name}</span>
                            </button>
                          ))}
                        {sites.filter((s) =>
                          s.name
                            .toLowerCase()
                            .includes(siteSearchValue.toLowerCase()),
                        ).length === 0 && (
                          <span className="block px-3 py-2 text-xs text-muted-foreground">
                            No sites found
                          </span>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Site ID */}
                <div className="space-y-1">
                  <label
                    htmlFor={"a"}
                    className="text-xs text-muted-foreground"
                  >
                    Site ID
                  </label>
                  <div className="flex items-center px-3 py-2 text-sm border border-border rounded-md bg-muted/30">
                    <span
                      className={
                        selectedSite
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {selectedSite
                        ? selectedSite.siteCode
                        : "Auto-fills on selection"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label htmlFor={"a"} className="text-xs text-muted-foreground">
                  Location
                </label>
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-muted-foreground truncate">
                    {selectedSite?.address ?? "Fetched from site record…"}
                  </span>
                </div>
              </div>

              {/* System capacity */}
              <div className="space-y-1">
                <label htmlFor={"a"} className="text-xs text-muted-foreground">
                  System capacity (kWp)
                </label>
                <div className="flex items-center px-3 py-2 text-sm border border-border rounded-md bg-muted/30">
                  <span
                    className={
                      selectedSite?.systemCapacityKwp
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {selectedSite?.systemCapacityKwp ??
                      "Fetched from site record…"}
                  </span>
                </div>
              </div>
            </div>

            {/* Issue details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium shrink-0">
                  Issue details
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Service type */}
              <div className="space-y-1">
                <label htmlFor={"a"} className="text-xs text-muted-foreground">
                  Service type <span className="text-red-500">*</span>
                </label>
                <Popover open={serviceOpen} onOpenChange={setServiceOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md hover:bg-accent/50 transition-colors text-left"
                    >
                      <span
                        className={
                          selectedService
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedService
                          ? selectedService.name
                          : "Panel damage / Wiring / Inverter fault / Soiling…"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-1" align="start">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 text-left"
                        onClick={() => {
                          setSelectedServiceMasterId(s.id);
                          setServiceOpen(false);
                        }}
                      >
                        {selectedServiceMasterId === s.id && (
                          <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {selectedServiceMasterId !== s.id && (
                          <div className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{s.name}</span>
                      </button>
                    ))}
                    {services.length === 0 && (
                      <span className="block px-3 py-2 text-xs text-muted-foreground">
                        No services configured
                      </span>
                    )}
                  </PopoverContent>
                </Popover>
                {selectedSite && selectedService && (
                  <p className="text-[10px] text-emerald-500">
                    Selecting this generates the request title above
                  </p>
                )}
              </div>

              {/* Raised by */}
              <div className="space-y-1">
                <label htmlFor={"a"} className="text-xs text-muted-foreground">
                  Raised by
                </label>
                <div className="flex items-center justify-between px-3 py-2 border border-border rounded-md">
                  {selectedContact ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedContact.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {selectedContact.role}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0 text-muted-foreground">
                      <UserIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {selectedSite
                          ? "Select contact…"
                          : "Select a site first"}
                      </span>
                    </div>
                  )}
                  {selectedSite && (
                    <Popover open={contactOpen} onOpenChange={setContactOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="ml-2 text-xs border border-border rounded px-2 py-1 hover:bg-accent/50 transition-colors flex-shrink-0"
                        >
                          Change
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1" align="end">
                        {selectedSite.contacts.map((contact) => (
                          <button
                            key={contact.id}
                            type="button"
                            className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent/50 text-left"
                            onClick={() => {
                              setSelectedContactId(contact.id);
                              setContactOpen(false);
                            }}
                          >
                            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{contact.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">
                                {contact.role}
                              </p>
                            </div>
                            {selectedContactId === contact.id && (
                              <Check className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                        {selectedSite.contacts.length === 0 && (
                          <span className="block px-3 py-2 text-xs text-muted-foreground">
                            No contacts for this site
                          </span>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[200px]">
              <TaskDescriptionEditor
                value={description}
                onChange={setDescription}
                placeholder={t(
                  "common:modals.createTask.descriptionPlaceholder",
                )}
                taskId={draftTask?.id}
                ensureTaskId={ensureDraftTask}
              />
            </div>

            {labels.length > 0 && (
              <div className="flex flex-wrap mb-2">
                {labels.map((label) => (
                  <Badge
                    key={label.name}
                    color={label.color}
                    variant="outline"
                    className="flex items-center gap-1 pl-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => removeLabel(label.name)}
                  >
                    <span
                      className="inline-block w-2 h-2 mr-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          labelColors.find((c) => c.value === label.color)
                            ?.color || "var(--color-neutral-400)",
                      }}
                    />
                    <span className="max-w-20 truncate">{label.name}</span>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 py-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/50 text-foreground rounded-md text-xs font-medium border border-border">
                <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                {statusLabel}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      startDate
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>
                      {startDate
                        ? formatDateMedium(startDate)
                        : t("common:modals.createTask.startDate")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="w-full bg-popover"
                  />
                  {startDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setStartDate(undefined)}
                      >
                        {t("common:modals.createTask.clearStartDate")}
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      priority !== "no-priority"
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {getPriorityIcon(priority)}
                    <span>
                      {selectedPriority
                        ? selectedPriority.label
                        : t("common:modals.createTask.priority")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <div className="space-y-1">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
                        onClick={() => setPriority(option.value as Priority)}
                      >
                        {getPriorityIcon(option.value)}
                        <span className="text-sm">{option.label}</span>
                        {priority === option.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      assignees.length > 0
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {assignees.length > 0 ? (
                      <>
                        <div className="flex -space-x-1">
                          {assignees.slice(0, 3).map((a) => {
                            const member = workspaceUsers?.members?.find(
                              (m) => m.userId === a.userId,
                            );
                            return (
                              <Avatar
                                key={a.userId}
                                className="h-4 w-4 ring-1 ring-background"
                              >
                                <AvatarImage
                                  src={member?.user?.image ?? ""}
                                  alt={member?.user?.name || ""}
                                />
                                <AvatarFallback className="text-[8px] font-medium">
                                  {member?.user?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            );
                          })}
                        </div>
                        <span>
                          {assignees.length === 1
                            ? (workspaceUsers?.members?.find(
                                (m) => m.userId === assignees[0].userId,
                              )?.user?.name ??
                              t("common:modals.createTask.assign"))
                            : `${assignees.length} ${t("common:modals.createTask.assign")}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{t("common:modals.createTask.assign")}</span>
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-1" align="start">
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
                      onClick={() => setAssignees([])}
                    >
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          ?
                        </span>
                      </div>
                      <span className="text-sm">
                        {t("common:modals.createTask.assignUnassigned")}
                      </span>
                      {assignees.length === 0 && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </button>
                    {workspaceUsers?.members?.map((member) => {
                      const assignment = assignees.find(
                        (a) => a.userId === member.userId,
                      );
                      const isSelected = !!assignment;
                      return (
                        <button
                          key={member.userId}
                          type="button"
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors min-h-8"
                          onClick={() => toggleAssignee(member.userId || "")}
                        >
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarImage
                              src={member?.user?.image ?? ""}
                              alt={member?.user?.name || ""}
                            />
                            <AvatarFallback className="text-xs font-medium border border-border/30">
                              {member?.user?.name?.charAt(0).toUpperCase() ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm truncate">
                              {member?.user?.name}
                            </span>
                            {isSelected && (
                              <button
                                type="button"
                                className="text-[10px] text-left text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) =>
                                  toggleAssigneeRole(member.userId || "", e)
                                }
                              >
                                {assignment.role === "supervisor"
                                  ? "Supervisor"
                                  : "Engineer"}{" "}
                                ↕
                              </button>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="ml-auto h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      dueDate
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>
                      {dueDate
                        ? formatDateMedium(dueDate)
                        : t("common:modals.createTask.dueDate")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    className="w-full bg-popover"
                  />
                  {dueDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setDueDate(undefined)}
                      >
                        {t("common:modals.createTask.clearDueDate")}
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      labels.length > 0
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{t("common:modals.createTask.labels")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  {labelsStep === "select" && (
                    <div className="w-auto">
                      <div className="flex items-center gap-2 p-2 border-b border-border">
                        <Search className="w-3 h-3 text-muted-foreground" />
                        <input
                          ref={searchInputRef}
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          placeholder={t(
                            "common:modals.createTask.searchLabels",
                          )}
                          className="w-full bg-transparent border-none text-foreground text-xs focus:outline-none placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="py-1">
                        {filteredLabels.length === 0 &&
                          searchValue.length === 0 && (
                            <span className="text-xs text-muted-foreground px-2">
                              {t("common:modals.createTask.noLabelsFound")}
                            </span>
                          )}
                        {filteredLabels.map((label) => (
                          <button
                            key={label.id}
                            type="button"
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                            onClick={() => toggleLabel(label.name)}
                          >
                            <div className="flex-shrink-0 w-3 flex justify-center">
                              {labels.some((l) => l.name === label.name) && (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  labelColors.find(
                                    (c) => c.value === label.color,
                                  )?.color || "var(--color-neutral-400)",
                              }}
                            />
                            <span className="max-w-20 truncate">
                              {label.name}
                            </span>
                          </button>
                        ))}

                        {canCreateLabelCapability &&
                          isCreatingNewLabel &&
                          filteredLabels.length > 0 && (
                            <div className="border-t border-border my-1" />
                          )}
                        {canCreateLabelCapability && isCreatingNewLabel && (
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                            onClick={handleCreateNewClick}
                          >
                            <div className="flex-shrink-0 w-3 flex justify-center">
                              <Plus className="w-3 h-3" />
                            </div>
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  labelColors.find(
                                    (c) => c.value === selectedColor,
                                  )?.color || "var(--color-neutral-400)",
                              }}
                            />
                            <span className="truncate">
                              {t("common:modals.createTask.createLabel", {
                                name: searchValue,
                              })}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {labelsStep === "color" && (
                    <div className="w-auto">
                      <div className="flex items-center justify-between p-2 border-b border-border">
                        <span className="text-xs font-medium">
                          {t("common:modals.createTask.chooseColor")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLabelsStep("select")}
                          className="w-4 h-4 flex items-center justify-center hover:bg-accent/50 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="py-1">
                        {labelColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left",
                              selectedColor === color.value && "bg-accent/30",
                            )}
                            onClick={() =>
                              handleColorSelect(color.value as LabelColor)
                            }
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="truncate">{color.label}</span>
                            {selectedColor === color.value && (
                              <Check className="w-3 h-3 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t border-border bg-background px-6 py-4">
            <div className="flex items-center gap-3 mr-auto">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={createMore}
                  onChange={(e) => setCreateMore(e.target.checked)}
                  className="rounded border-border bg-background text-primary focus:ring-ring focus:ring-offset-0 focus:ring-2 transition-all"
                />
                {t("common:modals.createTask.createMore")}
              </label>
            </div>

            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!isTitleAutoGenerated && !title.trim()}
              size="sm"
              className="disabled:opacity-50"
            >
              Create Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTaskModal;
