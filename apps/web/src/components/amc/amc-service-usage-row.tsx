import type { AmcService } from "@/fetchers/amc/types";
import { cn } from "@/lib/cn";

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  yearly: "Yearly",
};

const PRICE_UNIT_LABELS: Record<string, string> = {
  per_visit: "/visit",
  per_unit: "/unit",
  lump_sum: "lump sum",
};

export function AmcServiceUsageRow({ service }: { service: AmcService }) {
  const pct =
    service.annualLimit > 0
      ? Math.min(100, Math.round((service.used / service.annualLimit) * 100))
      : 0;
  const overLimit =
    service.annualLimit > 0 && service.used >= service.annualLimit;
  const unlimited = service.annualLimit === 0;

  return (
    <tr
      className={cn(
        "border-b last:border-0",
        overLimit && "bg-amber-50 dark:bg-amber-900/10",
      )}
    >
      <td className="py-3 pr-4 font-medium text-sm">
        {service.serviceMaster.name}
        {overLimit && (
          <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Over limit
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">
        {FREQUENCY_LABELS[service.frequency] ?? service.frequency}
      </td>
      <td className="py-3 pr-4 text-sm">
        {unlimited ? "Unlimited" : service.annualLimit}
      </td>
      <td className="py-3 pr-4 text-sm">{service.used}</td>
      <td className="py-3 pr-4 text-sm">
        {unlimited ? "—" : service.remaining === null ? "—" : service.remaining}
      </td>
      <td className="py-3 pr-4 w-32">
        {!unlimited && (
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                overLimit ? "bg-amber-500" : "bg-green-500",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </td>
      <td className="py-3 text-sm text-muted-foreground">
        {service.serviceMaster.currency ?? ""} {service.price}
        <span className="text-xs">
          {" "}
          {PRICE_UNIT_LABELS[service.priceUnit] ?? service.priceUnit}
        </span>
      </td>
    </tr>
  );
}
