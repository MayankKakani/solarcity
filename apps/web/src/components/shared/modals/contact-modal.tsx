import { Check, Mail, Phone, Plus, Search, Star, Tag, X } from "lucide-react";
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
import type { SiteContact, SiteLabel } from "@/fetchers/site/get-sites";
import useCreateLabel from "@/hooks/mutations/label/use-create-label";
import useDeleteLabel from "@/hooks/mutations/label/use-delete-label";
import useAddContact from "@/hooks/mutations/site/use-add-contact";
import useGetLabelsByWorkspace from "@/hooks/queries/label/use-get-labels-by-workspace";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "caretaker", label: "Caretaker" },
  { value: "security", label: "Security" },
  { value: "manager", label: "Manager" },
  { value: "contractor", label: "Contractor" },
] as const;

const ROLE_COLORS: Record<string, string> = {
  owner: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  caretaker: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  security: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  manager: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  contractor: "border-amber-500/40 bg-amber-500/10 text-amber-400",
};

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

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  workspaceId: string;
  contact?: SiteContact;
};

function ContactLabelPicker({
  contactId,
  workspaceId,
  activeLabels,
}: {
  contactId: string;
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

  const suggestions = workspaceLabels.filter(
    (l) =>
      !l.taskId &&
      !l.contactId &&
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
        await createLabel({ name: labelName, color, workspaceId, contactId });
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
        contactId,
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
    if (open && !colorStep) setTimeout(() => searchRef.current?.focus(), 80);
  }, [open, colorStep]);

  return (
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
            <span className="max-w-20 truncate">{label.name}</span>
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
                      {activeNames.has(l.name) && <Check className="w-3 h-3" />}
                    </div>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          LABEL_COLORS.find((c) => c.value === l.color)?.hex ??
                          "var(--color-neutral-400)",
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
  );
}

function ContactModal({
  open,
  onClose,
  siteId,
  siteName,
  workspaceId,
  contact,
}: ContactModalProps) {
  const isEdit = !!contact;
  const { mutateAsync: addContact, isPending } = useAddContact(siteId);

  const [name, setName] = useState("");
  const [role, setRole] =
    useState<(typeof ROLES)[number]["value"]>("caretaker");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setRole(contact.role as typeof role);
      setPhone(contact.phone ?? "");
      setEmail(contact.email ?? "");
      setIsPrimary(contact.isPrimary);
    }
  }, [contact]);

  const handleClose = () => {
    setName("");
    setRole("caretaker");
    setPhone("");
    setEmail("");
    setIsPrimary(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addContact({
        siteId,
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        isPrimary,
      });
      toast.success(isEdit ? "Contact updated" : "Contact added");
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save contact",
      );
    }
  };

  const initials =
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  const avatarColors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  const avatarColor = name
    ? avatarColors[name.charCodeAt(0) % avatarColors.length]
    : "bg-muted";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader className="px-3 pt-4 pb-1 gap-1.5">
          <DialogTitle className="sr-only">
            {isEdit ? "Edit contact" : "Add contact"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit
              ? "Edit site contact details"
              : "Add a new contact to this site"}
          </DialogDescription>
          <Breadcrumb>
            <BreadcrumbList className="gap-1 text-xs">
              <BreadcrumbItem className="text-muted-foreground font-medium tracking-wide truncate max-w-28">
                {siteName.toUpperCase()}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3.5" />
              <BreadcrumbItem className="text-foreground font-medium">
                {isEdit ? "Edit contact" : "Add contact"}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-3 py-2 space-y-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0 transition-colors",
                  avatarColor,
                )}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  unstyled
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  placeholder="Full name…"
                  className="w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:py-1 [&_[data-slot=input]]:text-xl [&_[data-slot=input]]:leading-tight [&_[data-slot=input]]:font-semibold [&_[data-slot=input]]:text-foreground [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:outline-none"
                  required
                />
                {name && (
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {role}
                  </p>
                )}
              </div>
            </div>

            {/* Role picker */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">
                Role <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      role === r.value
                        ? ROLE_COLORS[r.value]
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">
                Phone
              </Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 45312"
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>

            {/* Labels — only shown when editing an existing contact */}
            {isEdit && contact && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">
                  Labels
                </Label>
                <ContactLabelPicker
                  contactId={contact.id}
                  workspaceId={workspaceId}
                  activeLabels={contact.labels}
                />
              </div>
            )}

            {/* Primary toggle */}
            <button
              type="button"
              onClick={() => setIsPrimary((v) => !v)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors",
                isPrimary
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Star
                className={cn(
                  "w-3.5 h-3.5 flex-shrink-0",
                  isPrimary && "fill-amber-400",
                )}
              />
              <span>
                {isPrimary ? "Primary contact" : "Set as primary contact"}
              </span>
            </button>
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
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || isPending}
              className="disabled:opacity-50"
            >
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Adding…"
                : isEdit
                  ? "Save changes"
                  : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ContactModal;
