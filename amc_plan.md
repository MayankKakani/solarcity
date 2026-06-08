# AMC (Annual Maintenance Contract) Feature Plan

## Context

Solar sites need structured maintenance contracts. Each site can have one active AMC that defines which types of maintenance services are covered and how many times each service is allowed per year. When a task is created and linked to an AMC service, it counts toward the contract limit. If the limit is already reached, the task is still created but flagged as "out of AMC" (billable separately). There is no existing AMC, billing, or subscription system — this is greenfield.

---

## Database Changes

**File: `apps/api/src/database/schema.ts`**

### New table: `amcTable`

```ts
export const amcTable = pgTable("amc", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  siteId: text("site_id").notNull().references(() => siteTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),      // app sets to startDate + 1 year
  status: text("status").notNull().default("active"),          // "active" | "expired" | "cancelled"
  contractReference: text("contract_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("amc_siteId_idx").on(table.siteId),
  uniqueIndex("amc_site_active_unique").on(table.siteId).where(sql`${table.status} = 'active'`),
]);
```

The partial unique index enforces one active AMC per site at the DB level.

### New table: `amcServiceTable`

```ts
export const amcServiceTable = pgTable("amc_service", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  amcId: text("amc_id").notNull().references(() => amcTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name: text("name").notNull(),
  serviceType: text("service_type").notNull(),   // "preventive_maintenance" | "corrective_maintenance" | "part_replacement" | "custom"
  limit: integer("limit").notNull(),              // 0 = unlimited
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("amc_service_amcId_idx").on(table.amcId),
]);
```

No `used` counter column — usage is computed at query time from tasks to avoid drift.

### Modify existing `taskTable`

Add two new columns:

```ts
amcServiceId: text("amc_service_id").references(() => amcServiceTable.id, { onDelete: "set null", onUpdate: "cascade" }),
outOfAmc: boolean("out_of_amc").notNull().default(false),
```

Add index: `index("task_amcServiceId_idx").on(table.amcServiceId)`

---

## Relations

**File: `apps/api/src/database/relations.ts`**

- Add `amcRelations`: belongs to `siteTable`, has many `amcServiceTable`
- Add `amcServiceRelations`: belongs to `amcTable`, has many `taskTable`
- Update `siteRelations`: add `amcs` (one-to-many → `amcTable`)
- Update `taskRelations`: add `amcService` (many-to-one → `amcServiceTable`)

---

## API Endpoints

New router: `apps/api/src/amc/index.ts` — registered in `apps/api/src/index.ts` as `api.route("/amc", amcRouter)`.

Auth pattern mirrors `site/index.ts`: `workspaceAccess.fromQuery()` reads `?workspaceId=` from the query string.

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| `GET` | `/amc?siteId=` | `get-amc-by-site` | Returns the active AMC + services with computed `used` count; null if none |
| `POST` | `/amc?workspaceId=` | `create-amc` | Body: `{ siteId, startDate, contractReference?, notes?, services[] }`. Sets `endDate = startDate + 1yr`. Validates no active AMC exists. |
| `PUT` | `/amc/:amcId?workspaceId=` | `update-amc` | Update `status`, `contractReference`, `notes` only |
| `DELETE` | `/amc/:amcId?workspaceId=` | `delete-amc` | Hard delete; tasks get `amcServiceId` set null via cascade |
| `POST` | `/amc/:amcId/services?workspaceId=` | `add-amc-service` | Add a service line |
| `PUT` | `/amc/:amcId/services/:serviceId?workspaceId=` | `update-amc-service` | Update name, serviceType, limit |
| `DELETE` | `/amc/:amcId/services/:serviceId?workspaceId=` | `delete-amc-service` | Remove a service line |

Usage is embedded in `get-amc-by-site` response — no separate usage endpoint needed.

**Usage query pattern** in `get-amc-by-site`:
```ts
const usageCounts = await db
  .select({ amcServiceId: taskTable.amcServiceId, used: count() })
  .from(taskTable)
  .where(and(
    inArray(taskTable.amcServiceId, serviceIds),
    not(eq(taskTable.status, "cancelled"))
  ))
  .groupBy(taskTable.amcServiceId);
```

---

## Task Creation Change

**File: `apps/api/src/task/controllers/create-task.ts`**

Add `amcServiceId?: string` to the function signature. After the existing `issueTypeId` cost-snapshot block, insert:

```ts
let outOfAmc = false;
if (amcServiceId) {
  const service = await db.query.amcServiceTable.findFirst({
    where: eq(amcServiceTable.id, amcServiceId),
    with: { amc: { columns: { status: true, startDate: true, endDate: true, siteId: true } } },
  });

  if (!service || service.amc.status !== "active" || service.amc.siteId !== siteId)
    throw new HTTPException(400, { message: "Invalid or inactive AMC service" });

  const now = new Date();
  if (now < service.amc.startDate || now > service.amc.endDate)
    throw new HTTPException(400, { message: "AMC contract period has ended" });

  if (service.limit > 0) {
    const [{ used }] = await db
      .select({ used: count() })
      .from(taskTable)
      .where(and(eq(taskTable.amcServiceId, amcServiceId), not(eq(taskTable.status, "cancelled"))));
    outOfAmc = used >= service.limit;
  }
}
```

Then include `amcServiceId: amcServiceId || null, outOfAmc` in the `db.insert(taskTable).values(...)` call.

**File: `apps/api/src/task/index.ts`** — add `amcServiceId: v.optional(v.string())` to the create task Valibot schema and pass it through to the controller.

---

## Frontend

### New files

**Fetchers** (`apps/web/src/fetchers/amc/`):
- `get-amc-by-site.ts`, `create-amc.ts`, `update-amc.ts`, `delete-amc.ts`, `add-amc-service.ts`, `update-amc-service.ts`, `delete-amc-service.ts`

**Hooks** (`apps/web/src/hooks/queries/amc/`):
- `use-amc-by-site.ts` — `useQuery({ queryKey: ["amc", siteId], queryFn: () => getAmcBySite(siteId), enabled: !!siteId })`

**Mutation hooks** (`apps/web/src/hooks/mutations/amc/`):
- `use-create-amc.ts`, `use-update-amc.ts`, `use-delete-amc.ts`, `use-add-amc-service.ts`, `use-update-amc-service.ts`, `use-delete-amc-service.ts`

**Components** (`apps/web/src/components/amc/`):
- `amc-section.tsx` — contract summary card + service usage table
- `create-amc-modal.tsx` — form: startDate, contractReference, notes, dynamic service lines list
- `edit-amc-modal.tsx` — same fields minus startDate; can set status to "cancelled"

**Route**: `apps/web/src/routes/_layout/_authenticated/dashboard/workspace/$workspaceId/sites/$siteId/amc.tsx`
- New "AMC" tab on the site detail page

### Modified files

**`apps/web/src/routes/.../sites/$siteId/index.tsx`**
- Add "AMC" tab link pointing to the new route

**`apps/web/src/components/shared/modals/create-task-modal.tsx`**
- When a site is selected, fetch its active AMC
- Show "AMC Service" selector if an AMC exists; populate options with service names + `used / limit` usage
- Services at/over limit shown with amber "Over limit" badge (still selectable)
- Include `amcServiceId` in the create task API payload

**Task detail view** — show AMC service name + out-of-AMC badge if `outOfAmc = true`

---

## File List Summary

### New files
```
apps/api/src/amc/index.ts
apps/api/src/amc/controllers/create-amc.ts
apps/api/src/amc/controllers/get-amc-by-site.ts
apps/api/src/amc/controllers/update-amc.ts
apps/api/src/amc/controllers/delete-amc.ts
apps/api/src/amc/controllers/add-amc-service.ts
apps/api/src/amc/controllers/update-amc-service.ts
apps/api/src/amc/controllers/delete-amc-service.ts
apps/web/src/fetchers/amc/{get-amc-by-site,create-amc,update-amc,delete-amc,add-amc-service,update-amc-service,delete-amc-service}.ts
apps/web/src/hooks/queries/amc/use-amc-by-site.ts
apps/web/src/hooks/mutations/amc/{use-create-amc,use-update-amc,use-delete-amc,use-add-amc-service,use-update-amc-service,use-delete-amc-service}.ts
apps/web/src/components/amc/{amc-section,create-amc-modal,edit-amc-modal}.tsx
apps/web/src/routes/_layout/_authenticated/dashboard/workspace/$workspaceId/sites/$siteId/amc.tsx
```

### Modified files
```
apps/api/src/database/schema.ts              — add amcTable, amcServiceTable, 2 columns to taskTable
apps/api/src/database/relations.ts           — new & updated relations
apps/api/src/database/index.ts               — export new tables/relations in schema object
apps/api/src/index.ts                        — register amcRouter
apps/api/src/task/index.ts                   — add amcServiceId to create validator
apps/api/src/task/controllers/create-task.ts — AMC limit check + outOfAmc flag
apps/web/src/routes/.../sites/$siteId/index.tsx  — add AMC tab
apps/web/src/components/shared/modals/create-task-modal.tsx  — AMC service selector
```

---

## Implementation Order

1. **Schema** — add tables + task columns → `db:generate` → verify migration SQL
2. **Relations** — update `relations.ts` and `database/index.ts`
3. **Backend** — AMC controllers + router → register in `apps/api/src/index.ts`
4. **Task controller** — add AMC limit logic to `create-task.ts`
5. **Frontend data layer** — fetchers → hooks
6. **Frontend UI** — AMC section + modals → site route → task modal enhancement

---

## Verification

1. `pnpm --filter @solarplan/api db:generate` → inspect migration: new `amc`, `amc_service` tables; `task` altered with 2 columns; partial unique index present
2. Start API: `POST /api/amc` creates contract → `GET /api/amc?siteId=` returns it with `used: 0`
3. Second `POST /api/amc` for same site without cancelling first → expect 409/400
4. Create tasks linked to a service up to its limit → `outOfAmc: false`; one more → `outOfAmc: true`
5. Cancel a task → re-query usage → count drops (cancelled tasks excluded)
6. Frontend: navigate to site → AMC tab shows empty state → create AMC → service usage bars appear → open New Request modal with that site selected → AMC service selector visible → select over-limit service → task creates with amber "Out of AMC" badge in detail view
