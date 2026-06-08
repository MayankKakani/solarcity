/**
 * Given an AMC start date, computes which anniversary year we are currently in
 * and returns the boundaries of that year. Service usage limits reset per year.
 *
 * Example: startDate = 2023-06-01, today = 2025-08-15
 *   → yearIndex = 2, currentYearStart = 2025-06-01, nextYearStart = 2026-06-01
 */
export function computeCurrentAmcYear(startDate: Date): {
  currentYearStart: Date;
  nextYearStart: Date;
  yearIndex: number;
} {
  const now = new Date();
  const start = new Date(startDate);

  let yearIndex = 0;
  let currentYearStart = new Date(start);
  let nextYearStart = new Date(start);
  nextYearStart.setFullYear(nextYearStart.getFullYear() + 1);

  while (nextYearStart <= now) {
    yearIndex += 1;
    currentYearStart = new Date(nextYearStart);
    nextYearStart = new Date(nextYearStart);
    nextYearStart.setFullYear(nextYearStart.getFullYear() + 1);
  }

  return { currentYearStart, nextYearStart, yearIndex };
}

/**
 * Compute the period key for a given date and frequency.
 * Used for deduplicating auto-created tasks in the scheduler.
 */
export function computePeriodKey(date: Date, frequency: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  switch (frequency) {
    case "monthly":
      return `${year}-${String(month).padStart(2, "0")}`;
    case "quarterly": {
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    }
    case "half_yearly": {
      const half = month <= 6 ? 1 : 2;
      return `${year}-H${half}`;
    }
    case "yearly":
      return `${year}`;
    default:
      return `${year}-${String(month).padStart(2, "0")}`;
  }
}
