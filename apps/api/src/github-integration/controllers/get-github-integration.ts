import { and, eq } from "drizzle-orm";
import db from "../../database";
import { integrationTable } from "../../database/schema";
import {
  defaultGitHubConfig,
  type GitHubConfig,
} from "../../plugins/github/config";

async function getGithubIntegration(zoneId: string) {
  const integration = await db.query.integrationTable.findFirst({
    where: and(
      eq(integrationTable.zoneId, zoneId),
      eq(integrationTable.type, "github"),
    ),
  });

  if (!integration) {
    return null;
  }

  const config = JSON.parse(integration.config) as GitHubConfig;

  return {
    id: integration.id,
    zoneId: integration.zoneId,
    repositoryOwner: config.repositoryOwner,
    repositoryName: config.repositoryName,
    installationId: config.installationId,
    branchPattern: config.branchPattern || defaultGitHubConfig.branchPattern,
    commentTaskLinkOnGitHubIssue: config.commentTaskLinkOnGitHubIssue !== false,
    isActive: integration.isActive,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,
  };
}

export default getGithubIntegration;
