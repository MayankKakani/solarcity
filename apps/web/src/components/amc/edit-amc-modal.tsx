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
import { Textarea } from "@/components/ui/textarea";
import type { Amc } from "@/fetchers/amc/types";
import useUpdateAmc from "@/hooks/mutations/amc/use-update-amc";
import { toast } from "@/lib/toast";

type Props = {
  amc: Amc;
  workspaceId: string;
  onClose: () => void;
};

export function EditAmcModal({ amc, workspaceId, onClose }: Props) {
  const updateAmc = useUpdateAmc(amc.siteId);
  const [status, setStatus] = useState<"active" | "expired" | "cancelled">(
    amc.status as "active" | "expired" | "cancelled",
  );
  const [contractReference, setContractReference] = useState(
    amc.contractReference ?? "",
  );
  const [notes, setNotes] = useState(amc.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateAmc.mutateAsync({
        workspaceId,
        amcId: amc.id,
        status,
        contractReference: contractReference || undefined,
        notes: notes || undefined,
      });
      toast.success("AMC updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update AMC");
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit AMC Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Contract Reference</Label>
            <Input
              value={contractReference}
              onChange={(e) => setContractReference(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAmc.isPending}>
              {updateAmc.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
