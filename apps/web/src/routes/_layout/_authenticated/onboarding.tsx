import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import PageTitle from "@/components/page-title";
import getWorkspaces from "@/fetchers/workspace/get-workspaces";

export const Route = createFileRoute("/_layout/_authenticated/onboarding")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.user?.name) {
      throw redirect({ to: "/profile-setup" });
    }

    const workspaces = await getWorkspaces();
    if (workspaces.length > 0) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("auth:onboarding.pageTitle")} />
      <OnboardingFlow />
    </>
  );
}
