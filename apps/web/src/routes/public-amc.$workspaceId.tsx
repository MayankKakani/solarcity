import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  PhoneCall,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import PageTitle from "@/components/page-title";
import { ThemeToggle } from "@/components/public-project/theme-toggle";
import type { AmcBundle, AmcBundleService } from "@/fetchers/amc/types";
import useGetPublicBundles from "@/hooks/queries/amc/use-get-public-bundles";

export const Route = createFileRoute("/public-amc/$workspaceId")({
  component: RouteComponent,
});

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  yearly: "Yearly",
};

const FREQUENCY_PER_YEAR: Record<string, number> = {
  monthly: 12,
  quarterly: 4,
  half_yearly: 2,
  yearly: 1,
};

// function formatPrice(price: string, priceUnit: string) {
//   const num = Number.parseFloat(price);
//   if (Number.isNaN(num)) return price;
//   const formatted = new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(num);
//   const unit =
//     priceUnit === "lump_sum"
//       ? "/ yr"
//       : `/ ${priceUnit.replace("per_", "").replace("_", " ")}`;
//   return `${formatted} ${unit}`;
// }

function annualVisits(service: AmcBundleService) {
  const perYear = FREQUENCY_PER_YEAR[service.frequency] ?? 1;
  const limit =
    service.annualLimit === 0
      ? perYear
      : Math.min(perYear, service.annualLimit);
  return limit;
}

function totalBundlePrice(bundle: AmcBundle) {
  return bundle.services.reduce((sum, s) => {
    const perVisit = Number.parseFloat(s.price) || 0;
    const visits = s.priceUnit === "lump_sum" ? 1 : annualVisits(s);
    return sum + perVisit * visits;
  }, 0);
}

// function BundleFeatureRow({
//   label,
//   value,
// }: {
//   label: string;
//   value: string | null;
// }) {
//   if (!value) return null;
//   return (
//     <div className="flex items-start gap-2 text-sm">
//       <Check className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
//       <span className="text-foreground/80">
//         <span className="font-medium text-foreground">{label}</span> — {value}
//       </span>
//     </div>
//   );
// }

function ServiceLine({ service }: { service: AmcBundleService }) {
  const visits = annualVisits(service);
  const freq = FREQUENCY_LABEL[service.frequency] ?? service.frequency;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
      <div className="flex items-center gap-2">
        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span>{service.serviceMaster.name}</span>
      </div>
      <div className="text-right text-muted-foreground text-xs shrink-0 ml-4">
        {visits}x / yr &middot; {freq}
      </div>
    </div>
  );
}

function BundleCard({
  bundle,
  isPopular,
  currency,
}: {
  bundle: AmcBundle;
  isPopular: boolean;
  currency: string;
}) {
  const annualPrice = totalBundlePrice(bundle);
  const monthlyPrice = annualPrice / 12;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-lg ${
        isPopular
          ? "border-emerald-500 shadow-emerald-500/10 shadow-md"
          : "border-border"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
      )}

      <div className="px-6 pt-6 pb-4">
        {isPopular && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
            Most Popular
          </span>
        )}
        <h3 className="text-xl font-bold capitalize">{bundle.name}</h3>
        {bundle.description && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {bundle.description}
          </p>
        )}

        <div className="mt-4">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold tracking-tight">
              {formatted.format(annualPrice)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            = {formatted.format(monthlyPrice)} / mo &nbsp;&middot;&nbsp; billed
            annually
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-4 space-y-0.5">
        {bundle.services.map((s) => (
          <ServiceLine key={s.id} service={s} />
        ))}
      </div>

      <div className="px-6 pb-6 pt-2">
        <a
          href="#contact"
          className={`flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            isPopular
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          Get {bundle.name} <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function ComparisonTable({ bundles }: { bundles: AmcBundle[] }) {
  const allServices = Array.from(
    new Map(
      bundles.flatMap((b) =>
        b.services.map((s) => [s.serviceMasterId, s.serviceMaster.name]),
      ),
    ).entries(),
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground w-48">
              SERVICE
            </th>
            {bundles.map((b) => (
              <th
                key={b.id}
                className="text-center px-4 py-3 font-semibold capitalize"
              >
                {b.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allServices.map(([masterId, masterName]) => (
            <tr
              key={masterId}
              className="border-b border-border last:border-0 hover:bg-muted/20"
            >
              <td className="px-4 py-3 text-muted-foreground">{masterName}</td>
              {bundles.map((bundle) => {
                const svc = bundle.services.find(
                  (s) => s.serviceMasterId === masterId,
                );
                return (
                  <td key={bundle.id} className="px-4 py-3 text-center">
                    {svc ? (
                      <span className="inline-flex flex-col items-center gap-0.5">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] text-muted-foreground">
                          {annualVisits(svc)}x / yr
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30 text-lg">
                        —
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-8">
        <div className="space-y-3 text-center">
          <div className="h-8 w-64 bg-muted rounded-lg mx-auto animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorView() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <Sun className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-semibold">Plans not found</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          This workspace doesn't have any active AMC plans published yet.
        </p>
      </div>
    </div>
  );
}

const W = "w-full max-w-5xl mx-auto px-4 sm:px-6";

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  const { data, isLoading, error } = useGetPublicBundles(workspaceId);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !data || data.bundles.length === 0) return <ErrorView />;

  const { workspace, bundles } = data;
  const midIdx = Math.floor(bundles.length / 2);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-background">
      <PageTitle title={`${workspace.name} — AMC Plans`} />

      {/* Sticky header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className={`${W} py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-sm">{workspace.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#compare"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Compare plans
            </a>
            <ThemeToggle />
            <a
              href="#contact"
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Talk to an expert
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-background py-16 text-center">
        <div className={W}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-4">
            <Zap className="h-3.5 w-3.5" />
            Annual Maintenance Contract
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Protect your solar investment.
            <br />
            <span className="text-emerald-500">
              Maximise every unit you generate.
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unserviced solar panels lose up to 20% of annual output from dust,
            faults, and degradation. Our AMC plans keep your system clean,
            efficient, and covered — every month of the year.
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "20%", label: "avg. output lost without AMC" },
              { value: "2x", label: "longer effective panel lifespan" },
              { value: "100%", label: "warranty compliance maintained" },
              {
                value: bundles.length.toString(),
                label: "plan options to choose from",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-muted/30 px-4 py-4 text-center"
              >
                <p className="text-2xl font-bold text-emerald-500">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What happens without AMC */}
      <section className="bg-muted/20 border-y border-border py-12">
        <div className={W}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-6 text-center">
            What happens without regular maintenance
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "🌫️",
                title: "–15–20% Dust & soiling losses",
                body: "Dust accumulation on panels reduces output by 1–1.5% per week. In high-dust regions, panels can lose up to 30% without monthly cleaning.",
              },
              {
                icon: "⚡",
                title: "23% Faults invisible to the eye",
                body: "Microcracks, hot spots, and loose wiring don't show up until a panel fails. Technical audits catch these early — before they become costly replacements.",
              },
              {
                icon: "🛡️",
                title: "Void Warranty & insurance risk",
                body: "Most panel manufacturers require documented maintenance records. Without AMC service logs, warranty claims and insurance payouts can be rejected outright.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5 space-y-2"
              >
                <div className="text-2xl">{item.icon}</div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-background py-16">
        <div className={W}>
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Choose your plan
            </p>
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="text-sm text-muted-foreground mt-2">
              All plans include panel cleaning. Upgrade for technical audits,
              thermal imaging, and priority support.
            </p>
          </div>
          <div
            className={`grid gap-6 ${
              bundles.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : bundles.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {bundles.map((bundle, idx) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                isPopular={bundles.length > 1 && idx === midIdx}
                currency="INR"
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Prices are indicative. Final quote depends on system size, location,
            and site access.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      {bundles.length > 1 && (
        <section id="compare" className="bg-background pb-16">
          <div className={W}>
            <div className="mb-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                What's covered — and how often
              </p>
              <h2 className="text-2xl font-bold">Compare plans side-by-side</h2>
            </div>
            <ComparisonTable bundles={bundles} />
          </div>
        </section>
      )}

      {/* Why AMC */}
      <section className="bg-muted/20 border-y border-border py-12">
        <div className={W}>
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Why it matters
              </p>
              <h2 className="text-2xl font-bold leading-snug">
                Every rupee spent on AMC returns 1.4× in recovered energy
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Based on industry averages: 18% output loss from unmaintained
                panels, 85% recovery with AMC services, 0.78 system performance
                ratio.
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
                  text: "Documented service history for warranty claims",
                },
                {
                  icon: <Zap className="h-4 w-4 text-amber-500" />,
                  text: "Early fault detection prevents panel replacements",
                },
                {
                  icon: <Sun className="h-4 w-4 text-amber-400" />,
                  text: "Consistent cleaning restores full generation capacity",
                },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-background py-16">
        <div className={`${W} text-center`}>
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 space-y-4">
            <PhoneCall className="h-8 w-8 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold">
              Not sure which plan is right for you?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Share your system size and we'll recommend the plan that maximises
              your ROI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href="#compare"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Compare plans <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`mailto:info@${workspaceSlug}.com`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                Talk to an expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div
          className={`${W} py-4 flex items-center justify-between text-xs text-muted-foreground`}
        >
          <span>
            Powered by{" "}
            <span className="font-semibold text-foreground">Solarplan</span>
          </span>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
