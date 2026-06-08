import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expiring:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

type Props = {
  status: string;
  expiryUrgency?: "none" | "ok" | "warning" | "critical";
};

export function AmcStatusBadge({ status, expiryUrgency }: Props) {
  const isExpiring =
    status === "active" &&
    (expiryUrgency === "warning" || expiryUrgency === "critical");
  const displayStatus = isExpiring ? "expiring" : status;
  const label = isExpiring
    ? "Expiring"
    : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[displayStatus] ?? STATUS_STYLES.expired,
      )}
    >
      {label}
    </span>
  );
}
