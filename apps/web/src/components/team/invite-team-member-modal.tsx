import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";
import useInviteByPhone from "@/hooks/mutations/invitation/use-invite-by-phone";
import useGetProjects from "@/hooks/queries/project/use-get-projects";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import useWorkspaceRoles from "@/hooks/queries/workspace/use-workspace-roles";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";
import { Button } from "../ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "../ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  open: boolean;
  onClose: () => void;
};

const teamMemberSchema = z.object({
  phoneNumber: z.string().min(1),
  role: z.string().min(1),
  zoneIds: z.array(z.string()),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

function InviteTeamMemberModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const { mutateAsync } = useInviteByPhone();
  const queryClient = useQueryClient();
  const { data: workspace } = useActiveWorkspace();
  const workspaceId = workspace?.id ?? "";
  const { canInviteUsers } = useWorkspacePermission();
  const canInvite = canInviteUsers();

  const { data: roles = [] } = useWorkspaceRoles(workspaceId || undefined);
  const { data: projects = [] } = useGetProjects({ workspaceId });

  const form = useForm<TeamMemberFormValues>({
    resolver: standardSchemaResolver(teamMemberSchema),
    defaultValues: {
      phoneNumber: "",
      role: "member",
      zoneIds: [],
    },
  });

  const selectedZoneIds = form.watch("zoneIds");

  const projectItems = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.name })),
    [projects],
  );

  const selectedItems = useMemo(
    () => projectItems.filter((item) => selectedZoneIds.includes(item.value)),
    [projectItems, selectedZoneIds],
  );

  const onSubmit = async ({
    phoneNumber,
    role,
    zoneIds,
  }: TeamMemberFormValues) => {
    if (!workspaceId) {
      toast.error(t("team:inviteModal.error"));
      return;
    }
    if (!canInvite) {
      toast.error(t("team:inviteModal.error"));
      return;
    }
    try {
      await mutateAsync({ phoneNumber, role, zoneIds, workspaceId });
      await queryClient.refetchQueries({
        queryKey: ["workspace-users", workspaceId],
      });
      toast.success(t("team:inviteModal.success"));
      form.reset();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("team:inviteModal.error"),
      );
    }
  };

  const resetAndClose = () => {
    queryClient.invalidateQueries({
      queryKey: ["workspace-users", workspaceId],
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogPopup className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{t("team:inviteModal.title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
            <DialogPanel className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("team:inviteModal.phoneLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder={t("team:inviteModal.phonePlaceholder")}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("team:inviteModal.roleLabel")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("team:inviteModal.rolePlaceholder")}
                          >
                            {field.value}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.length > 0 ? (
                            roles.map((r) => (
                              <SelectItem key={r.id} value={r.role}>
                                {r.role}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="member">member</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {projects.length > 0 && (
                <FormItem>
                  <FormLabel>{t("team:inviteModal.projectsLabel")}</FormLabel>
                  <Combobox
                    multiple
                    items={projectItems}
                    value={selectedItems}
                    onValueChange={(items) =>
                      form.setValue(
                        "zoneIds",
                        items.map((i) => i.value),
                        { shouldDirty: true, shouldTouch: true },
                      )
                    }
                  >
                    <ComboboxChips>
                      {selectedItems.map((item) => (
                        <ComboboxChip key={item.value} value={item}>
                          {item.label}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        placeholder={t("team:inviteModal.projectsPlaceholder")}
                      />
                    </ComboboxChips>
                    <ComboboxPopup>
                      <ComboboxEmpty>
                        {t("team:inviteModal.noProjects")}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxPopup>
                  </Combobox>
                </FormItem>
              )}
            </DialogPanel>

            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" size="sm" type="button" />}
              >
                {t("common:actions.cancel")}
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                disabled={!workspaceId || !canInvite}
              >
                {t("team:inviteModal.sendInvitation")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}

export default InviteTeamMemberModal;
