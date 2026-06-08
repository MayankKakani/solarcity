import { createFileRoute } from "@tanstack/react-router";
import { Plus, Shield, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import useCreateService from "@/hooks/mutations/service-master/use-create-service";
import useUpdateService from "@/hooks/mutations/service-master/use-update-service";
import useGetServices from "@/hooks/queries/service-master/use-get-services";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/workspace/services",
)({
  component: RouteComponent,
});

export type WORKSPACE_SERVICES = {
  id: string;
  name: string;
  description: string;
  currency: string;
  defaultPrice: string;
  isActive: boolean;
};

function DraftEditor({
  workspaceId,
  existingNames,
  onCreated,
  onDiscard,
}: {
  workspaceId: string;
  existingNames: string[];
  onCreated: (roleName: string) => void;
  onDiscard: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultPrice, setDefaultPrice] = useState<string>("0");
  const [currency, _setCurrency] = useState("INR");
  const [isActive, setIsActive] = useState<boolean>(true);
  const { mutateAsync: createService, isPending } = useCreateService();
  const id = useId();
  const handleCreate = async () => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    if (existingNames.map((n) => n.toLowerCase()).includes(trimmed)) {
      toast.error("A service with that name already exists");
      return;
    }
    if (!defaultPrice) {
      toast.error("Price is required");
      return;
    }
    try {
      await createService({
        workspaceId,
        name: trimmed,
        description,
        currency,
        isActive,
        defaultPrice,
      });
      toast.success("Service created");
      onCreated(trimmed);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create service",
      );
    }
  };

  return (
    <div>
      <div className="border-t border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Name</Label>
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
            disabled={isPending}
          />
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto mx-3.5 my-4">
        {/* <div key={`${resource}:${action}`}> */}
        <Separator className="mb-4" />
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col items-start gap-2 w-3/5">
            <Label htmlFor={id}>Description</Label>
            <Input
              aria-label="Description"
              id={id}
              placeholder="e.g. this service enables our customers."
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            <Label htmlFor={id}>Price (INR)</Label>
            <Input
              aria-label="Price"
              id={id}
              placeholder="e.g. 300 "
              type="number"
              value={defaultPrice}
              onChange={(e) => {
                setDefaultPrice(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            <Label htmlFor={id}>Is Active</Label>
            <Switch
              checked={isActive}
              onCheckedChange={(e) => setIsActive(e)}
            />
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex justify-end gap-2 px-4 py-3 bg-sidebar">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          disabled={isPending}
        >
          <X className="w-4 h-4" />
          Discard
        </Button>
        <Button size="sm" onClick={handleCreate} disabled={isPending}>
          Create Service
        </Button>
      </div>
    </div>
  );
}

function CustomRoleEditor({
  workspaceId,
  service,
}: {
  workspaceId: string;
  service: WORKSPACE_SERVICES;
}) {
  const [defaultPrice, setDefaultPrice] = useState(service.defaultPrice);
  const [isActive, setIsActive] = useState(service.isActive);
  const { mutateAsync: updateService } = useUpdateService();
  const [dirty, setDirty] = useState<boolean>(false);
  const id = useId();

  const isDirty = () => {
    if (service.defaultPrice !== defaultPrice) {
      setDirty(true);
    }
    if (service.isActive !== isActive) {
      setDirty(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateService({
        workspaceId,
        serviceId: service.id,
        isActive,
        defaultPrice,
      });
      toast.success("Service updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role",
      );
    }
  };

  // AccordionPanel sets `overflow-hidden`, which kills `position: sticky`
  // relative to the page. Instead, we cap the permission list height and
  // give it its own scroll, so the action bar below stays anchored at the
  // bottom of the accordion content while the user scrolls through
  // permissions.
  return (
    <div>
      <div className="max-h-[60vh] overflow-y-auto mx-3.5 my-4">
        <div className="flex flex-col items-start gap-2 w-24">
          <Label htmlFor={id}>Price (INR)</Label>
          <Input
            aria-label="Description"
            id={id}
            placeholder="e.g. 300"
            type="number"
            value={defaultPrice}
            onChange={(e) => {
              setDefaultPrice(e.target.value);
              isDirty();
            }}
          />
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-sidebar">
        <div className="flex items-start gap-2">
          <Label htmlFor={id}>Is Active</Label>
          <Switch checked={isActive} onCheckedChange={(e) => setIsActive(e)} />
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {dirty ? "You have unsaved changes" : "All changes saved"}
          </p>
          <Button size="sm" onClick={handleSave} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// function DeleteServiceConfirm({
//   service,
//   workspaceId,
//   onDeleted,
//   onCancel,
// }: {
//   service: WORKSPACE_SERVICES | null;
//   workspaceId: string;
//   onDeleted: () => void;
//   onCancel: () => void;
// }) {
//   const { mutateAsync: deleteService, isPending } = useDeleteService(workspaceId);

//   return (
//     <AlertDialogContent>
//       <AlertDialogHeader>
//         <AlertDialogTitle>Delete service</AlertDialogTitle>
//         <AlertDialogDescription>
//           {service
//             ? `This will permanently delete the service "${service.name}".`
//             : ""}
//         </AlertDialogDescription>
//       </AlertDialogHeader>
//       <AlertDialogFooter>
//         <AlertDialogClose disabled={isPending}>
//           <Button
//             variant="outline"
//             size="sm"
//             disabled={isPending}
//             onClick={onCancel}
//           >
//             Cancel
//           </Button>
//         </AlertDialogClose>
//         <Button
//           variant="destructive"
//           size="sm"
//           disabled={isPending || !service}
//           onClick={async () => {
//             if (!service) return;
//             try {
//               await deleteService(service.id);
//               toast.success("Service deleted");
//               // Caller closes the dialog after the mutation succeeds so a
//               // failed delete leaves the confirmation visible.
//               onDeleted();
//             } catch (error) {
//               toast.error(
//                 error instanceof Error
//                   ? error.message
//                   : "Failed to delete service",
//               );
//             }
//           }}
//         >
//           <Trash2 className="w-4 h-4 mr-2" />
//           Delete
//         </Button>
//       </AlertDialogFooter>
//     </AlertDialogContent>
//   );
// }

function RouteComponent() {
  const { workspace, isAdmin } = useWorkspacePermission();
  const workspaceId = workspace?.id ?? "";
  const {
    data: services = [],
    isLoading,
    isError: customServiceError,
    error: customServiceErrorValue,
  } = useGetServices(workspaceId);
  const [draftActive, setDraftActive] = useState(false);
  // const [serviceToDelete, setServiceToDelete] =
  //   useState<WORKSPACE_SERVICES | null>(null);
  const [openCustom, setOpenCustom] = useState<string[]>([]);

  // Defaults (viewer/member/admin) first so they anchor the list, then
  // user-created roles in their natural order.
  const sortedServices = useMemo(() => {
    services.sort((a, b) => (a.name as never) - (b.name as never));
    return [...services];
  }, [services]);

  if (!isAdmin) {
    return (
      <>
        <PageTitle title="Roles" />
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Services</h1>
            <p className="text-muted-foreground">
              You need admin or owner permissions to manage Services.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Services" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-muted-foreground">
            Define what services are provided by{" "}
            {workspace?.name ?? "this organisation"}.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-md font-medium">Service Catalouge</h2>
              <p className="text-xs text-muted-foreground">
                Edit the default services or add a tailored one. AMC/Requests
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
              New Service
            </Button>
          </div>
          <div className="border border-border rounded-md bg-sidebar">
            {isLoading && !draftActive ? (
              <p className="text-xs text-muted-foreground px-4 py-6">
                Loading…
              </p>
            ) : customServiceError ? (
              <p className="text-xs text-destructive px-4 py-6">
                {customServiceErrorValue instanceof Error
                  ? customServiceErrorValue.message
                  : "Failed to load services."}
              </p>
            ) : sortedServices.length === 0 && !draftActive ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Shield />
                  </EmptyMedia>
                  <EmptyTitle>No services yet</EmptyTitle>
                  <EmptyDescription>
                    Default services will appear here once they're seeded for
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
                        existingNames={[...services.map((r) => r.name)]}
                        onCreated={(serviceId) => {
                          setDraftActive(false);
                          setOpenCustom((prev) => [
                            ...prev.filter((v) => v !== "__draft__"),
                            serviceId,
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
                {sortedServices.map((service) => {
                  // const isDefault = isDefaultRole(role.role);
                  const description = service.description
                    ? service.description
                    : undefined;
                  return (
                    <AccordionItem
                      key={service.id}
                      value={service.name}
                      className="border-b border-border last:border-b-0"
                    >
                      <AccordionTrigger className="px-4">
                        <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium capitalize truncate">
                                  {service.name}
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
                          key={service.id}
                          workspaceId={workspaceId}
                          service={service}
                          // isDefault={isDefault}
                          // onDelete={() => setServiceToDelete(service)}
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
