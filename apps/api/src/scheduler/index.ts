import { Cron } from "croner";
import { createAmcAutoTasks } from "./amc-auto-tasks";
import { checkAmcRenewalReminders } from "./amc-renewal-reminders";
import { checkDueDateReminders } from "./due-date-reminders";

const jobs: Cron[] = [];

export function initializeScheduler(): void {
  jobs.push(new Cron("*/5 * * * *", checkDueDateReminders));
  jobs.push(new Cron("0 6 * * *", checkAmcRenewalReminders));
  jobs.push(new Cron("0 7 * * *", createAmcAutoTasks));
  console.log(
    "⏰ Scheduler started (due date reminders, AMC renewal reminders, AMC auto-tasks)",
  );
}

export function shutdownScheduler(): void {
  for (const job of jobs) {
    job.stop();
  }
  jobs.length = 0;
}
