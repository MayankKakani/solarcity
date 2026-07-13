import { relations } from "drizzle-orm";
import {
  accountTable,
  activityTable,
  amcAutoTaskTable,
  amcBundleServiceTable,
  amcBundleTable,
  amcRenewalReminderSentTable,
  amcSeatPurchaseTable,
  amcServiceTable,
  amcTable,
  apikeyTable,
  assetTable,
  columnTable,
  commentTable,
  externalLinkTable,
  githubIntegrationTable,
  integrationTable,
  invitationTable,
  labelTable,
  notificationTable,
  planTable,
  serviceMasterTable,
  sessionTable,
  siteContactTable,
  siteTable,
  taskAssignmentTable,
  taskRelationTable,
  taskReminderSentTable,
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
  workspaceSubscriptionTable,
  workspaceTable,
  workspaceUserTable,
  zoneAssignmentTable,
  zoneTable,
} from "./schema";

export const userTableRelations = relations(userTable, ({ many, one }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  teamMembers: many(teamMemberTable),
  workspaces: many(workspaceTable),
  workspaceMemberships: many(workspaceUserTable),
  assignedTasks: many(taskTable),
  timeEntries: many(timeEntryTable),
  activities: many(activityTable),
  comments: many(commentTable),
  assets: many(assetTable),
  notifications: many(notificationTable),
  notificationPreference: one(userNotificationPreferenceTable),
  notificationWorkspaceRules: many(userNotificationWorkspaceRuleTable),
  sentInvitations: many(invitationTable),
  apikeys: many(apikeyTable),
  taskAssignments: many(taskAssignmentTable, {
    relationName: "taskAssignmentUser",
  }),
  taskAssignmentsCreated: many(taskAssignmentTable, {
    relationName: "taskAssignmentAssignedBy",
  }),
  zoneAssignments: many(zoneAssignmentTable, {
    relationName: "zoneAssignmentUser",
  }),
  zoneAssignmentsCreated: many(zoneAssignmentTable, {
    relationName: "zoneAssignmentCreator",
  }),
  raisedRequests: many(taskTable, { relationName: "raisedByExecutive" }),
}));

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const accountTableRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

export const verificationTableRelations = relations(
  verificationTable,
  () => ({}),
);

export const workspaceTableRelations = relations(
  workspaceTable,
  ({ many }) => ({
    teams: many(teamTable),
    members: many(workspaceUserTable),
    zones: many(zoneTable),
    assets: many(assetTable),
    invitations: many(invitationTable),
    notificationWorkspaceRules: many(userNotificationWorkspaceRuleTable),
    sites: many(siteTable),
    serviceMasters: many(serviceMasterTable),
    amcBundles: many(amcBundleTable),
    subscription: many(workspaceSubscriptionTable),
    amcSeatPurchases: many(amcSeatPurchaseTable),
  }),
);

export const planTableRelations = relations(planTable, ({ many }) => ({
  subscriptions: many(workspaceSubscriptionTable),
}));

export const workspaceSubscriptionTableRelations = relations(
  workspaceSubscriptionTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [workspaceSubscriptionTable.workspaceId],
      references: [workspaceTable.id],
    }),
    plan: one(planTable, {
      fields: [workspaceSubscriptionTable.planId],
      references: [planTable.id],
    }),
  }),
);

export const amcSeatPurchaseTableRelations = relations(
  amcSeatPurchaseTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [amcSeatPurchaseTable.workspaceId],
      references: [workspaceTable.id],
    }),
  }),
);

export const workspaceUserTableRelations = relations(
  workspaceUserTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [workspaceUserTable.workspaceId],
      references: [workspaceTable.id],
    }),
    user: one(userTable, {
      fields: [workspaceUserTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const zoneTableRelations = relations(zoneTable, ({ one, many }) => ({
  workspace: one(workspaceTable, {
    fields: [zoneTable.workspaceId],
    references: [workspaceTable.id],
  }),
  tasks: many(taskTable),
  assets: many(assetTable),
  columns: many(columnTable),
  workflowRules: many(workflowRuleTable),
  githubIntegration: many(githubIntegrationTable),
  integrations: many(integrationTable),
  notificationWorkspacezones: many(userNotificationWorkspacezoneTable),
  assignments: many(zoneAssignmentTable),
}));

export const columnTableRelations = relations(columnTable, ({ one, many }) => ({
  zone: one(zoneTable, {
    fields: [columnTable.zoneId],
    references: [zoneTable.id],
  }),
  tasks: many(taskTable),
  workflowRules: many(workflowRuleTable),
}));

export const workflowRuleTableRelations = relations(
  workflowRuleTable,
  ({ one }) => ({
    zone: one(zoneTable, {
      fields: [workflowRuleTable.zoneId],
      references: [zoneTable.id],
    }),
    column: one(columnTable, {
      fields: [workflowRuleTable.columnId],
      references: [columnTable.id],
    }),
  }),
);

export const taskTableRelations = relations(taskTable, ({ one, many }) => ({
  zone: one(zoneTable, {
    fields: [taskTable.zoneId],
    references: [zoneTable.id],
  }),
  assignments: many(taskAssignmentTable),
  column: one(columnTable, {
    fields: [taskTable.columnId],
    references: [columnTable.id],
  }),
  site: one(siteTable, {
    fields: [taskTable.siteId],
    references: [siteTable.id],
  }),
  siteContact: one(siteContactTable, {
    fields: [taskTable.siteContactId],
    references: [siteContactTable.id],
  }),
  raisedByExecutive: one(userTable, {
    fields: [taskTable.raisedByExecutiveId],
    references: [userTable.id],
    relationName: "raisedByExecutive",
  }),
  serviceMaster: one(serviceMasterTable, {
    fields: [taskTable.serviceMasterId],
    references: [serviceMasterTable.id],
  }),
  amcService: one(amcServiceTable, {
    fields: [taskTable.amcServiceId],
    references: [amcServiceTable.id],
  }),
  timeEntries: many(timeEntryTable),
  activities: many(activityTable),
  comments: many(commentTable),
  assets: many(assetTable),
  labels: many(labelTable),
  externalLinks: many(externalLinkTable),
  sourceRelations: many(taskRelationTable, { relationName: "sourceTask" }),
  targetRelations: many(taskRelationTable, { relationName: "targetTask" }),
  remindersSent: many(taskReminderSentTable),
  amcAutoTask: one(amcAutoTaskTable),
}));

export const timeEntryTableRelations = relations(timeEntryTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [timeEntryTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [timeEntryTable.userId],
    references: [userTable.id],
  }),
}));

export const activityTableRelations = relations(activityTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [activityTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [activityTable.userId],
    references: [userTable.id],
  }),
}));

export const assetTableRelations = relations(assetTable, ({ one }) => ({
  workspace: one(workspaceTable, {
    fields: [assetTable.workspaceId],
    references: [workspaceTable.id],
  }),
  zone: one(zoneTable, {
    fields: [assetTable.zoneId],
    references: [zoneTable.id],
  }),
  task: one(taskTable, {
    fields: [assetTable.taskId],
    references: [taskTable.id],
  }),
  activity: one(activityTable, {
    fields: [assetTable.activityId],
    references: [activityTable.id],
  }),
  creator: one(userTable, {
    fields: [assetTable.createdBy],
    references: [userTable.id],
  }),
}));

export const labelTableRelations = relations(labelTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [labelTable.taskId],
    references: [taskTable.id],
  }),
  site: one(siteTable, {
    fields: [labelTable.siteId],
    references: [siteTable.id],
  }),
  contact: one(siteContactTable, {
    fields: [labelTable.contactId],
    references: [siteContactTable.id],
  }),
}));

export const notificationTableRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const userNotificationPreferenceTableRelations = relations(
  userNotificationPreferenceTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userNotificationPreferenceTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const userNotificationWorkspaceRuleTableRelations = relations(
  userNotificationWorkspaceRuleTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [userNotificationWorkspaceRuleTable.userId],
      references: [userTable.id],
    }),
    workspace: one(workspaceTable, {
      fields: [userNotificationWorkspaceRuleTable.workspaceId],
      references: [workspaceTable.id],
    }),
    selectedzones: many(userNotificationWorkspacezoneTable),
  }),
);

export const userNotificationWorkspacezoneTableRelations = relations(
  userNotificationWorkspacezoneTable,
  ({ one }) => ({
    workspaceRule: one(userNotificationWorkspaceRuleTable, {
      fields: [
        userNotificationWorkspacezoneTable.workspaceId,
        userNotificationWorkspacezoneTable.workspaceRuleId,
      ],
      references: [
        userNotificationWorkspaceRuleTable.workspaceId,
        userNotificationWorkspaceRuleTable.id,
      ],
    }),
    zone: one(zoneTable, {
      fields: [
        userNotificationWorkspacezoneTable.workspaceId,
        userNotificationWorkspacezoneTable.zoneId,
      ],
      references: [zoneTable.workspaceId, zoneTable.id],
    }),
  }),
);

export const githubIntegrationTableRelations = relations(
  githubIntegrationTable,
  ({ one }) => ({
    zone: one(zoneTable, {
      fields: [githubIntegrationTable.zoneId],
      references: [zoneTable.id],
    }),
  }),
);

export const teamTableRelations = relations(teamTable, ({ one, many }) => ({
  workspace: one(workspaceTable, {
    fields: [teamTable.workspaceId],
    references: [workspaceTable.id],
  }),
  teamMembers: many(teamMemberTable),
}));

export const teamMemberTableRelations = relations(
  teamMemberTable,
  ({ one }) => ({
    team: one(teamTable, {
      fields: [teamMemberTable.teamId],
      references: [teamTable.id],
    }),
    user: one(userTable, {
      fields: [teamMemberTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const invitationTableRelations = relations(
  invitationTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [invitationTable.workspaceId],
      references: [workspaceTable.id],
    }),
    inviter: one(userTable, {
      fields: [invitationTable.inviterId],
      references: [userTable.id],
    }),
  }),
);

export const workspaceRoleTableRelations = relations(
  workspaceRoleTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [workspaceRoleTable.workspaceId],
      references: [workspaceTable.id],
    }),
  }),
);

export const apikeyTableRelations = relations(apikeyTable, ({ one }) => ({
  user: one(userTable, {
    fields: [apikeyTable.referenceId],
    references: [userTable.id],
  }),
}));

export const integrationTableRelations = relations(
  integrationTable,
  ({ one, many }) => ({
    zone: one(zoneTable, {
      fields: [integrationTable.zoneId],
      references: [zoneTable.id],
    }),
    externalLinks: many(externalLinkTable),
  }),
);

export const taskRelationTableRelations = relations(
  taskRelationTable,
  ({ one }) => ({
    sourceTask: one(taskTable, {
      fields: [taskRelationTable.sourceTaskId],
      references: [taskTable.id],
      relationName: "sourceTask",
    }),
    targetTask: one(taskTable, {
      fields: [taskRelationTable.targetTaskId],
      references: [taskTable.id],
      relationName: "targetTask",
    }),
  }),
);

export const externalLinkTableRelations = relations(
  externalLinkTable,
  ({ one }) => ({
    task: one(taskTable, {
      fields: [externalLinkTable.taskId],
      references: [taskTable.id],
    }),
    integration: one(integrationTable, {
      fields: [externalLinkTable.integrationId],
      references: [integrationTable.id],
    }),
  }),
);

export const taskReminderSentTableRelations = relations(
  taskReminderSentTable,
  ({ one }) => ({
    task: one(taskTable, {
      fields: [taskReminderSentTable.taskId],
      references: [taskTable.id],
    }),
  }),
);

export const commentTableRelations = relations(commentTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [commentTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.id],
  }),
}));

export const zoneAssignmentTableRelations = relations(
  zoneAssignmentTable,
  ({ one }) => ({
    zone: one(zoneTable, {
      fields: [zoneAssignmentTable.zoneId],
      references: [zoneTable.id],
    }),
    user: one(userTable, {
      fields: [zoneAssignmentTable.userId],
      references: [userTable.id],
      relationName: "zoneAssignmentUser",
    }),
    creator: one(userTable, {
      fields: [zoneAssignmentTable.createdBy],
      references: [userTable.id],
      relationName: "zoneAssignmentCreator",
    }),
  }),
);

// ============================================================================
// task_assignment relations
// ============================================================================

export const taskAssignmentTableRelations = relations(
  taskAssignmentTable,
  ({ one }) => ({
    task: one(taskTable, {
      fields: [taskAssignmentTable.taskId],
      references: [taskTable.id],
    }),
    user: one(userTable, {
      fields: [taskAssignmentTable.userId],
      references: [userTable.id],
      relationName: "taskAssignmentUser",
    }),
    assignedByUser: one(userTable, {
      fields: [taskAssignmentTable.assignedBy],
      references: [userTable.id],
      relationName: "taskAssignmentAssignedBy",
    }),
  }),
);

// ============================================================================
// site, site_contact, issue_type relations
// ============================================================================

export const siteTableRelations = relations(siteTable, ({ one, many }) => ({
  workspace: one(workspaceTable, {
    fields: [siteTable.workspaceId],
    references: [workspaceTable.id],
  }),
  contacts: many(siteContactTable),
  tasks: many(taskTable),
  amcs: many(amcTable),
}));

export const siteContactTableRelations = relations(
  siteContactTable,
  ({ one, many }) => ({
    site: one(siteTable, {
      fields: [siteContactTable.siteId],
      references: [siteTable.id],
    }),
    tasks: many(taskTable),
  }),
);

// ============================================================================
// AMC relations
// ============================================================================

export const serviceMasterTableRelations = relations(
  serviceMasterTable,
  ({ one, many }) => ({
    workspace: one(workspaceTable, {
      fields: [serviceMasterTable.workspaceId],
      references: [workspaceTable.id],
    }),
    bundleServices: many(amcBundleServiceTable),
    amcServices: many(amcServiceTable),
  }),
);

export const amcBundleTableRelations = relations(
  amcBundleTable,
  ({ one, many }) => ({
    workspace: one(workspaceTable, {
      fields: [amcBundleTable.workspaceId],
      references: [workspaceTable.id],
    }),
    services: many(amcBundleServiceTable),
    amcs: many(amcTable),
  }),
);

export const amcBundleServiceTableRelations = relations(
  amcBundleServiceTable,
  ({ one }) => ({
    bundle: one(amcBundleTable, {
      fields: [amcBundleServiceTable.bundleId],
      references: [amcBundleTable.id],
    }),
    serviceMaster: one(serviceMasterTable, {
      fields: [amcBundleServiceTable.serviceMasterId],
      references: [serviceMasterTable.id],
    }),
  }),
);

export const amcTableRelations = relations(amcTable, ({ one, many }) => ({
  site: one(siteTable, {
    fields: [amcTable.siteId],
    references: [siteTable.id],
  }),
  bundle: one(amcBundleTable, {
    fields: [amcTable.bundleId],
    references: [amcBundleTable.id],
  }),
  services: many(amcServiceTable),
  renewalRemindersSent: many(amcRenewalReminderSentTable),
}));

export const amcServiceTableRelations = relations(
  amcServiceTable,
  ({ one, many }) => ({
    amc: one(amcTable, {
      fields: [amcServiceTable.amcId],
      references: [amcTable.id],
    }),
    serviceMaster: one(serviceMasterTable, {
      fields: [amcServiceTable.serviceMasterId],
      references: [serviceMasterTable.id],
    }),
    tasks: many(taskTable),
    autoTasks: many(amcAutoTaskTable),
  }),
);

export const amcRenewalReminderSentTableRelations = relations(
  amcRenewalReminderSentTable,
  ({ one }) => ({
    amc: one(amcTable, {
      fields: [amcRenewalReminderSentTable.amcId],
      references: [amcTable.id],
    }),
  }),
);

export const amcAutoTaskTableRelations = relations(
  amcAutoTaskTable,
  ({ one }) => ({
    amcService: one(amcServiceTable, {
      fields: [amcAutoTaskTable.amcServiceId],
      references: [amcServiceTable.id],
    }),
    task: one(taskTable, {
      fields: [amcAutoTaskTable.taskId],
      references: [taskTable.id],
    }),
  }),
);
