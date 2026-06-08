import { config } from "dotenv-mono";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  accountTableRelations,
  activityTableRelations,
  amcAutoTaskTableRelations,
  amcBundleServiceTableRelations,
  amcBundleTableRelations,
  amcRenewalReminderSentTableRelations,
  amcServiceTableRelations,
  amcTableRelations,
  apikeyTableRelations,
  assetTableRelations,
  columnTableRelations,
  commentTableRelations,
  externalLinkTableRelations,
  githubIntegrationTableRelations,
  integrationTableRelations,
  invitationTableRelations,
  labelTableRelations,
  notificationTableRelations,
  serviceMasterTableRelations,
  sessionTableRelations,
  siteContactTableRelations,
  siteTableRelations,
  taskRelationTableRelations,
  taskTableRelations,
  teamMemberTableRelations,
  teamTableRelations,
  timeEntryTableRelations,
  userNotificationPreferenceTableRelations,
  userNotificationWorkspaceRuleTableRelations,
  userNotificationWorkspacezoneTableRelations,
  userTableRelations,
  verificationTableRelations,
  workflowRuleTableRelations,
  workspaceRoleTableRelations,
  workspaceTableRelations,
  workspaceUserTableRelations,
  zoneAssignmentTableRelations,
  zoneTableRelations,
} from "./relations";
import { resolveDatabaseConnectionString } from "./resolve-database-url";
import {
  accountTable,
  activityTable,
  amcAutoTaskTable,
  amcBundleServiceTable,
  amcBundleTable,
  amcRenewalReminderSentTable,
  amcServiceTable,
  amcTable,
  apikeyTable,
  assetTable,
  columnTable,
  commentTable,
  deviceCodeTable,
  externalLinkTable,
  githubIntegrationTable,
  integrationTable,
  invitationTable,
  labelTable,
  notificationTable,
  serviceMasterTable,
  sessionTable,
  siteContactTable,
  siteTable,
  taskRelationTable,
  taskTable,
  teamMemberTable,
  teamTable,
  timeEntryTable,
  userNotificationPreferenceTable,
  userNotificationWorkspaceRuleTable,
  userNotificationWorkspacezoneTable,
  userTable,
  verificationTable,
  workflowRuleTable,
  workspaceRoleTable,
  workspaceTable,
  workspaceUserTable,
  zoneAssignmentTable,
  zoneTable,
} from "./schema";

config();

export const schema = {
  accountTable,
  assetTable,
  activityTable,
  amcAutoTaskTable,
  amcBundleServiceTable,
  amcBundleTable,
  amcRenewalReminderSentTable,
  amcServiceTable,
  amcTable,
  apikeyTable,
  columnTable,
  commentTable,
  deviceCodeTable,
  externalLinkTable,
  githubIntegrationTable,
  integrationTable,
  invitationTable,
  labelTable,
  notificationTable,
  serviceMasterTable,
  zoneTable,
  sessionTable,
  taskRelationTable,
  taskTable,
  teamMemberTable,
  teamTable,
  timeEntryTable,
  userTable,
  userNotificationPreferenceTable,
  userNotificationWorkspacezoneTable,
  userNotificationWorkspaceRuleTable,
  verificationTable,
  workflowRuleTable,
  workspaceRoleTable,
  workspaceTable,
  workspaceUserTable,
  zoneAssignmentTable,
  siteTable,
  siteContactTable,
  accountTableRelations,
  assetTableRelations,
  activityTableRelations,
  amcAutoTaskTableRelations,
  amcBundleServiceTableRelations,
  amcBundleTableRelations,
  amcRenewalReminderSentTableRelations,
  amcServiceTableRelations,
  amcTableRelations,
  apikeyTableRelations,
  columnTableRelations,
  commentTableRelations,
  externalLinkTableRelations,
  githubIntegrationTableRelations,
  integrationTableRelations,
  invitationTableRelations,
  labelTableRelations,
  notificationTableRelations,
  serviceMasterTableRelations,
  zoneTableRelations,
  sessionTableRelations,
  taskRelationTableRelations,
  taskTableRelations,
  teamMemberTableRelations,
  teamTableRelations,
  timeEntryTableRelations,
  userTableRelations,
  userNotificationPreferenceTableRelations,
  userNotificationWorkspacezoneTableRelations,
  userNotificationWorkspaceRuleTableRelations,
  verificationTableRelations,
  workflowRuleTableRelations,
  workspaceRoleTableRelations,
  workspaceTableRelations,
  workspaceUserTableRelations,
  zoneAssignmentTableRelations,
  siteTableRelations,
  siteContactTableRelations,
};

type DatabaseInstance = ReturnType<typeof drizzle<typeof schema>>;

let pool: Pool | undefined;
let dbInstance: DatabaseInstance | undefined;

export function getDatabasePool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: resolveDatabaseConnectionString(),
    });
  }

  return pool;
}

export function getDatabase(): DatabaseInstance {
  if (!dbInstance) {
    dbInstance = drizzle(getDatabasePool(), {
      schema,
    });
  }

  return dbInstance;
}

const db = new Proxy({} as DatabaseInstance, {
  get(_target, property, receiver) {
    const value = Reflect.get(getDatabase(), property, receiver);

    if (typeof value === "function") {
      return value.bind(getDatabase());
    }

    return value;
  },
});

/**
 * Execute queries with RLS user context
 * Uses a single transaction to ensure set_config() and queries
 * run on the same connection
 */
export async function withUserContext<T>(
  userId: string,
  callback: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // Set user ID in this transaction
    await tx.execute(
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    );

    // Execute callback with same transaction
    return callback(tx);
  });
}

export default db;
