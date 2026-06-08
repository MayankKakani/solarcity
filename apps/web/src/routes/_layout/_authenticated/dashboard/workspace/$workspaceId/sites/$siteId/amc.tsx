import { createFileRoute, Link } from "@tanstack/react-router";
import { AmcDetailPage } from "@/components/amc/amc-detail-page";
import Layout from "@/components/common/layout";
import PageTitle from "@/components/page-title";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useGetSite from "@/hooks/queries/site/use-get-site";
// import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/sites/$siteId/amc",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceId, siteId } = Route.useParams();
  // const { data: workspace } = useActiveWorkspace(workspaceId);
  const { data: site } = useGetSite(siteId);

  return (
    <Layout>
      <PageTitle title={`AMC — ${site?.name ?? "Site"}`} />
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/dashboard/workspace/$workspaceId/sites"
                  params={{ workspaceId }}
                >
                  Sites
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/dashboard/workspace/$workspaceId/sites/$siteId/"
                  params={{ workspaceId, siteId }}
                >
                  {site?.name ?? siteId}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>AMC</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <AmcDetailPage siteId={siteId} workspaceId={workspaceId} />
    </Layout>
  );
}
