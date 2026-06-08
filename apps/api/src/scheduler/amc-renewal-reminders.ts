import { and, between, eq } from "drizzle-orm";
import db from "../database";
import {
  amcRenewalReminderSentTable,
  amcTable,
  siteTable,
} from "../database/schema";
import createNotification from "../notification/controllers/create-notification";

type ReminderType = "30_days" | "15_days" | "7_days";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000; // ±1 hour window

function buildWindows(now: Date) {
  const nowMs = now.getTime();
  return [
    {
      start: new Date(nowMs + 29 * DAY_MS + 23 * WINDOW_MS),
      end: new Date(nowMs + 30 * DAY_MS + WINDOW_MS),
      type: "30_days" as ReminderType,
      daysRemaining: 30,
    },
    {
      start: new Date(nowMs + 14 * DAY_MS + 23 * WINDOW_MS),
      end: new Date(nowMs + 15 * DAY_MS + WINDOW_MS),
      type: "15_days" as ReminderType,
      daysRemaining: 15,
    },
    {
      start: new Date(nowMs + 6 * DAY_MS + 23 * WINDOW_MS),
      end: new Date(nowMs + 7 * DAY_MS + WINDOW_MS),
      type: "7_days" as ReminderType,
      daysRemaining: 7,
    },
  ];
}

export async function checkAmcRenewalReminders(): Promise<void> {
  const now = new Date();
  const windows = buildWindows(now);

  for (const window of windows) {
    const amcsInWindow = await db
      .select({
        id: amcTable.id,
        siteId: amcTable.siteId,
        siteName: siteTable.name,
        endDate: amcTable.endDate,
        workspaceId: siteTable.workspaceId,
      })
      .from(amcTable)
      .innerJoin(siteTable, eq(amcTable.siteId, siteTable.id))
      .where(
        and(
          eq(amcTable.status, "active"),
          between(amcTable.endDate, window.start, window.end),
        ),
      );

    for (const amc of amcsInWindow) {
      // Deduplicate — skip if reminder already sent
      const [inserted] = await db
        .insert(amcRenewalReminderSentTable)
        .values({ amcId: amc.id, reminderType: window.type })
        .onConflictDoNothing()
        .returning({ id: amcRenewalReminderSentTable.id });

      if (!inserted) continue;

      // Notify all workspace admins/owners
      // const admins = await db
      //   .select({ userId: workspaceUserTable.userId })
      //   .from(workspaceUserTable)
      //   .where(
      //     and(
      //       eq(workspaceUserTable.workspaceId, amc.workspaceId),
      //       // role is "owner" or "admin" — match both
      //       isNull(workspaceUserTable.id),
      //     ),
      //   );

      // Fetch owners and admins
      const adminUsers = await db.query.workspaceUserTable.findMany({
        where: (t, { eq: eq_, and: and_, or: or_ }) =>
          and_(
            eq_(t.workspaceId, amc.workspaceId),
            or_(eq_(t.role, "owner"), eq_(t.role, "admin")),
          ),
        columns: { userId: true },
      });

      for (const admin of adminUsers) {
        await createNotification({
          userId: admin.userId,
          type: "amc_renewal_reminder",
          title: `AMC Renewal Reminder: ${amc.siteName}`,
          content: `The AMC for ${amc.siteName} expires in ${window.daysRemaining} days (${new Date(amc.endDate).toLocaleDateString()}).`,
          eventData: {
            amcId: amc.id,
            siteName: amc.siteName,
            endDate: amc.endDate,
            reminderType: window.type,
            daysRemaining: window.daysRemaining,
          },
          resourceId: amc.id,
          resourceType: "amc",
        });
      }
    }
  }
}
