import { createFileRoute } from "@tanstack/react-router";
import { Plus, Shield, Trash2, X } from "lucide-react";
import { useId, useState } from "react";
import PageTitle from "@/components/page-title";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useCreateBundle from "@/hooks/mutations/amc/use-create-bundle";
import useUpdateBundle from "@/hooks/mutations/amc/use-update-bundle";
import useGetBundles from "@/hooks/queries/amc/use-get-bundles";
import useGetServices from "@/hooks/queries/service-master/use-get-services";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/workspace/amc-bundles",
)({
  component: RouteComponent,
});

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

type ServiceRow = {
  id?: string;
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

// function BundleRow({
//   bundle,
//   workspaceId,
// }: {
//   bundle: AmcBundle;
//   workspaceId: string;
// }) {
//   const [expanded, setExpanded] = useState(false);
//   const deleteBundle = useDeleteBundle(workspaceId);
//   const [confirmDelete, setConfirmDelete] = useState(false);

//   return (
//     <div className="rounded-lg border">
//       {/** biome-ignore lint/a11y/noStaticElementInteractions: <ignore> */}
//       {/** biome-ignore lint/a11y/useKeyWithClickEvents: <ignore> */}
//       <div
//         className="flex cursor-pointer items-center justify-between px-4 py-3"
//         onClick={() => setExpanded((v) => !v)}
//       >
//         <div className="flex items-center gap-2">
//           {expanded ? (
//             <ChevronDown className="h-4 w-4 text-muted-foreground" />
//           ) : (
//             <ChevronRight className="h-4 w-4 text-muted-foreground" />
//           )}
//           <p className="text-sm font-medium">{bundle.name}</p>
//           <span className="text-xs text-muted-foreground">
//             {bundle.services.length} service
//             {bundle.services.length !== 1 ? "s" : ""}
//           </span>
//         </div>
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={(e) => {
//             e.stopPropagation();
//             setConfirmDelete(true);
//           }}
//         >
//           <Trash2 className="h-4 w-4 text-destructive" />
//         </Button>
//       </div>

//       {expanded && bundle.services.length > 0 && (
//         <div className="border-t px-4 py-3">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-xs text-muted-foreground">
//                 <th className="pb-2 text-left font-medium">Service</th>
//                 <th className="pb-2 text-left font-medium">Frequency</th>
//                 <th className="pb-2 text-left font-medium">Limit/yr</th>
//                 <th className="pb-2 text-left font-medium">Price</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {bundle.services.map((s) => (
//                 <tr key={s.id}>
//                   <td className="py-1.5">{s.serviceMaster.name}</td>
//                   <td className="py-1.5 text-muted-foreground capitalize">
//                     {s.frequency.replace("_", " ")}
//                   </td>
//                   <td className="py-1.5">
//                     {s.annualLimit === 0 ? "Unlimited" : s.annualLimit}
//                   </td>
//                   <td className="py-1.5">
//                     {s.price} {s.priceUnit.replace("_", " ")}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <AlertDialog
//         open={confirmDelete}
//         onOpenChange={() => setConfirmDelete(false)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete bundle?</AlertDialogTitle>
//             <AlertDialogDescription>
//               "{bundle.name}" and its service lines will be removed.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogClose>Cancel</AlertDialogClose>
//             <Button
//               variant="destructive"
//               onClick={async () => {
//                 try {
//                   await deleteBundle.mutateAsync(bundle.id);
//                   toast.success("Bundle deleted");
//                   setConfirmDelete(false);
//                 } catch (err) {
//                   toast.error(err instanceof Error ? err.message : "Failed");
//                 }
//               }}
//             >
//               Delete
//             </Button>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

type CreateBundle = {
  id?: string;
  workspaceId: string;
  name: string;
  description?: string;
  isActive: boolean;
  services: ServiceRow[];
};

function DraftEditor({
  workspaceId,
  onCreated,
  onDiscard,
}: {
  workspaceId: string;
  onCreated: (roleName: string) => void;
  onDiscard: () => void;
}) {
  const { data: services = [] } = useGetServices(workspaceId);
  const { data: serviceMasters = [] } = useGetServices(workspaceId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const createBundle = useCreateBundle();
  const id = useId();

  function addRow() {
    setRows((r) => [
      ...r,
      {
        serviceMasterId: "",
        frequency: "monthly",
        annualLimit: 1,
        price: "0",
        priceUnit: "per_visit",
      },
    ]);
  }

  function updateRow(
    i: number,
    field: keyof ServiceRow,
    value: string | number,
  ) {
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );
  }

  const handleCreate = async () => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }

    try {
      await createBundle.mutateAsync({
        workspaceId,
        name: trimmed,
        description,
        isActive,
        services: rows,
      });
      toast.success("Service created");
      onCreated(trimmed);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create bundle",
      );
    }
  };

  return (
    <div>
      {/* <form onSubmit={handleCreate} className="space-y-4"> */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Bundle Name</Label>
            <p className="text-xs text-muted-foreground">
              Lowercase. Cannot be changed later.
            </p>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cleaning"
            className="w-64"
            autoFocus
            disabled={createBundle.isPending}
          />
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto mx-3.5 my-4">
        <Separator className="mb-4" />
        <div className="space-y-2 m-2">
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between m-2">
            <Label>Services</Label>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              Add Service
            </Button>
          </div>
          {rows.map((row, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
              key={i}
              className="grid grid-cols-6 gap-2 items-end rounded border p-3"
            >
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Service</Label>
                <Select
                  value={row.serviceMasterId}
                  onValueChange={(v) => {
                    const svc = services.find((s) => s.id === v);
                    // biome-ignore lint/style/noNonNullAssertion: <ignore>
                    updateRow(i, "serviceMasterId", v!);
                    if (svc?.defaultPrice)
                      updateRow(i, "price", svc.defaultPrice);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick…">
                      {
                        serviceMasters.find((s) => s.id === row.serviceMasterId)
                          ?.name
                      }
                    </SelectValue>
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
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Frequency</Label>
                <Select
                  value={row.frequency}
                  // biome-ignore lint/style/noNonNullAssertion: <ignore>
                  onValueChange={(v) => updateRow(i, "frequency", v!)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {
                        FREQUENCIES.find((f) => f.value === row.frequency)
                          ?.label
                      }
                    </SelectValue>
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
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Annual Limit</Label>
                <Input
                  type="number"
                  min={0}
                  value={row.annualLimit}
                  onChange={(e) =>
                    updateRow(i, "annualLimit", Number(e.target.value))
                  }
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label className="text-xs">Price</Label>
                <Input
                  value={row.price}
                  onChange={(e) => updateRow(i, "price", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Unit</Label>
                <Select
                  value={row.priceUnit}
                  // biome-ignore lint/style/noNonNullAssertion: <ignore>
                  onValueChange={(v) => updateRow(i, "priceUnit", v!)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {
                        PRICE_UNITS.find((u) => u.value === row.priceUnit)
                          ?.label
                      }
                    </SelectValue>
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
              <div className="col-span-1 space-y-2">
                <Label htmlFor={id} className="text-xs">
                  Is Active
                </Label>
                <Switch
                  checked={isActive}
                  onCheckedChange={(e) => setIsActive(e)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          {/* <Button type="button" variant="outline" onClick={onClose}>Cancel</Button> */}
          {/* <Button type="submit" disabled={!name || createBundle.isPending}>
              {createBundle.isPending ? "Creating…" : "Create Bundle"}
            </Button> */}
        </div>
        {/* </form> */}
      </div>
      <Separator />
      <div className="flex justify-end gap-2 px-4 py-3 bg-sidebar">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          disabled={createBundle.isPending}
        >
          <X className="w-4 h-4" />
          Discard
        </Button>
        <Button
          size="sm"
          disabled={createBundle.isPending}
          onClick={handleCreate}
        >
          Create Bundle
        </Button>
      </div>
      {/* </form> */}
    </div>
  );
}

function CustomRoleEditor({
  workspaceId,
  bundle,
}: {
  workspaceId: string;
  bundle: CreateBundle;
}) {
  const { mutateAsync: updateBundle, isPending } = useUpdateBundle();
  const { data: serviceMasters = [] } = useGetServices(workspaceId);
  const [name, setName] = useState(bundle.name);
  const [description, setDescription] = useState(bundle.description ?? "");
  const [isActive, setIsActive] = useState<boolean>(bundle.isActive);
  const [rows, setRows] = useState<ServiceRow[]>(bundle.services);
  const id = useId();

  function addRow() {
    setRows((r) => [
      ...r,
      {
        serviceMasterId: "",
        frequency: "monthly",
        annualLimit: 1,
        price: "0",
        priceUnit: "per_visit",
      },
    ]);
  }

  function updateRow(
    i: number,
    field: keyof ServiceRow,
    value: string | number,
  ) {
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  const handleSave = async () => {
    try {
      await updateBundle({
        workspaceId,
        // biome-ignore lint/style/noNonNullAssertion: <ignore>
        bundleId: bundle.id!,
        name: name.trim() || undefined,
        description,
        isActive,
        services: rows,
      });
      toast.success("Bundle updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update bundle",
      );
    }
  };

  return (
    <div>
      <div className="border-t border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Bundle Name</Label>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cleaning"
            className="w-64"
            disabled={isPending}
          />
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto mx-3.5 my-4">
        <Separator className="mb-4" />
        <div className="space-y-2 m-2">
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex items-center gap-3 m-2">
          <Label htmlFor={id} className="text-sm font-medium">
            Active
          </Label>
          <Switch
            id={id}
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between m-2">
            <Label>Services</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={isPending}
            >
              Add Service
            </Button>
          </div>
          {rows.map((row, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
              key={i}
              className="grid grid-cols-6 gap-2 items-end rounded border p-3"
            >
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Service</Label>
                <Select
                  value={row.serviceMasterId}
                  onValueChange={(v) => {
                    const svc = serviceMasters.find((s) => s.id === v);
                    // biome-ignore lint/style/noNonNullAssertion: <ignore>
                    updateRow(i, "serviceMasterId", v!);
                    if (svc?.defaultPrice)
                      updateRow(i, "price", svc.defaultPrice);
                  }}
                  disabled={!!row.id || isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick…">
                      {
                        serviceMasters.find((s) => s.id === row.serviceMasterId)
                          ?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {serviceMasters.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Frequency</Label>
                <Select
                  value={row.frequency}
                  onValueChange={(v) => updateRow(i, "frequency", v)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {
                        FREQUENCIES.find((f) => f.value === row.frequency)
                          ?.label
                      }
                    </SelectValue>
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
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Annual Limit</Label>
                <Input
                  type="number"
                  min={0}
                  value={row.annualLimit}
                  onChange={(e) =>
                    updateRow(i, "annualLimit", Number(e.target.value))
                  }
                  disabled={isPending}
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label className="text-xs">Price</Label>
                <Input
                  value={row.price}
                  onChange={(e) => updateRow(i, "price", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Unit</Label>
                <Select
                  value={row.priceUnit}
                  // biome-ignore lint/style/noNonNullAssertion: <ignore>
                  onValueChange={(v) => updateRow(i, "priceUnit", v!)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {
                        PRICE_UNITS.find((u) => u.value === row.priceUnit)
                          ?.label
                      }
                    </SelectValue>
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
              <div className="col-span-1 flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(i)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="flex justify-end gap-2 px-4 py-3 bg-sidebar">
        <Button size="sm" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { workspace, isAdmin } = useWorkspacePermission();
  const workspaceId = workspace?.id ?? "";
  const {
    data: bundles = [],
    isLoading,
    isError: customBundleError,
    error: customBundleErrorValue,
  } = useGetBundles(workspaceId);
  const [draftActive, setDraftActive] = useState(false);
  // const [serviceToDelete, setServiceToDelete] = useState<WORKSPACE_SERVICES | null>(null);
  const [openCustom, setOpenCustom] = useState<string[]>([]);

  if (!isAdmin) {
    return (
      <>
        <PageTitle title="Roles" />
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">AMC Bundles</h1>
            <p className="text-muted-foreground">
              You need admin or owner permissions to manage AMC Bundles.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="AMC Bundles" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">AMC Bundles</h1>
          <p className="text-muted-foreground">
            Define AMC bundles for your organisation
            {/* {workspace?.name ?? "this organisation"}. */}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-md font-medium">Bundle Catalouge</h2>
              <p className="text-xs text-muted-foreground">
                Edit the default AMC Bundles or add a tailored one. AMC/Requests
                keep their assigned service name across edits.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setDraftActive(true);
                setOpenCustom((prev) =>
                  prev.includes("__draft__") ? prev : [...prev, "__draft__"],
                );
              }}
              disabled={draftActive}
            >
              <Plus className="w-3.5 h-3.5" />
              New Bundle
            </Button>
          </div>
          <div className="border border-border rounded-md bg-sidebar">
            {isLoading && !draftActive ? (
              <p className="text-xs text-muted-foreground px-4 py-6">
                Loading…
              </p>
            ) : customBundleError ? (
              <p className="text-xs text-destructive px-4 py-6">
                {customBundleErrorValue instanceof Error
                  ? customBundleErrorValue.message
                  : "Failed to load bundles."}
              </p>
            ) : bundles.length === 0 && !draftActive ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Shield />
                  </EmptyMedia>
                  <EmptyTitle>No AMC Bundles yet</EmptyTitle>
                  <EmptyDescription>
                    Default bundles will appear here once they're seeded for
                    this organsiation.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Accordion
                openMultiple
                value={openCustom}
                onValueChange={(value) =>
                  setOpenCustom(Array.isArray(value) ? value : [value])
                }
              >
                {draftActive && (
                  <AccordionItem
                    value="__draft__"
                    className="border-b border-border last:border-b-0"
                  >
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm font-medium italic">
                          New Service
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionPanel className="px-0 pt-0 pb-0">
                      <DraftEditor
                        workspaceId={workspaceId}
                        // existingNames={[
                        //   ...bundles.map((r) => r.name),
                        // ]}
                        onCreated={(bundleId) => {
                          setDraftActive(false);
                          setOpenCustom((prev) => [
                            ...prev.filter((v) => v !== "__draft__"),
                            bundleId,
                          ]);
                        }}
                        onDiscard={() => {
                          setDraftActive(false);
                          setOpenCustom((prev) =>
                            prev.filter((v) => v !== "__draft__"),
                          );
                        }}
                      />
                    </AccordionPanel>
                  </AccordionItem>
                )}
                {bundles.map((bundle) => {
                  // const isDefault = isDefaultRole(role.role);
                  const description = bundle.description
                    ? bundle.description
                    : undefined;
                  return (
                    <AccordionItem
                      key={bundle.id}
                      value={bundle.name}
                      className="border-b border-border last:border-b-0"
                    >
                      <AccordionTrigger className="px-4">
                        <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium capitalize truncate">
                                  {bundle.name}
                                </p>
                                {/* {isDefault && (
                                  <span className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    Default
                                  </span>
                                )} */}
                              </div>
                              {description && (
                                <p className="text-xs font-normal text-muted-foreground truncate">
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-normal text-muted-foreground shrink-0">
                            {/* {permissionCount(role.permission)} permissions */}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionPanel className="px-0 pt-0 pb-0">
                        <CustomRoleEditor
                          key={bundle.id}
                          workspaceId={workspaceId}
                          bundle={{
                            id: bundle.id,
                            workspaceId: bundle.workspaceId,
                            name: bundle.name,
                            description: bundle.description ?? undefined,
                            isActive: bundle.isActive,
                            services: bundle.services.map((s) => ({
                              id: s.id,
                              serviceMasterId: s.serviceMasterId,
                              frequency: s.frequency,
                              annualLimit: s.annualLimit,
                              price: s.price,
                              priceUnit: s.priceUnit,
                            })),
                          }}
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      </div>

      {/* <AlertDialog
        open={!!serviceToDelete}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
      >
        <DeleteServiceConfirm
          service={serviceToDelete}
          workspaceId={workspaceId}
          onDeleted={() => {
            setOpenCustom((prev) =>
              prev.filter((v) => v !== serviceToDelete?.name),
            );
            setServiceToDelete(null);
          }}
          onCancel={() => setServiceToDelete(null)}
        />
      </AlertDialog> */}
    </>
  );
}
