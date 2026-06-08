import { and, eq } from "drizzle-orm";
import db from "../database";
import { integrationTable } from "../database/schema";
import { subscribeToEvent } from "../events";
import type {
  IntegrationPlugin,
  PluginContext,
  TaskCommentCreatedEvent,
  TaskCreatedEvent,
  TaskDescriptionChangedEvent,
  TaskPriorityChangedEvent,
  TaskStatusChangedEvent,
  TaskTitleChangedEvent,
} from "./types";

const plugins = new Map<string, IntegrationPlugin>();
let eventSubscriptionsInitialized = false;

export function registerPlugin(plugin: IntegrationPlugin): void {
  if (plugins.has(plugin.type)) {
    throw new Error(`Plugin ${plugin.type} already registered`);
  }
  plugins.set(plugin.type, plugin);
  console.log(`✓ Registered plugin: ${plugin.name}`);
}

export function initializeEventSubscriptions(): void {
  if (eventSubscriptionsInitialized) {
    return;
  }

  subscribeToEvent<{
    taskId: string;
    userId: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    number: number;
    zoneId: string;
  }>("task.created", async (data) => {
    await broadcastTaskCreated({
      taskId: data.taskId,
      zoneId: data.zoneId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      number: data.number,
    });
  });

  subscribeToEvent<{
    taskId: string;
    userId: string | null;
    oldStatus: string;
    newStatus: string;
    title: string;
    zoneId: string;
  }>("task.status_changed", async (data) => {
    await broadcastTaskStatusChanged({
      taskId: data.taskId,
      zoneId: data.zoneId,
      userId: data.userId,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      title: data.title,
    });
  });

  subscribeToEvent<{
    taskId: string;
    userId: string | null;
    oldPriority: string;
    newPriority: string;
    title: string;
    zoneId: string;
  }>("task.priority_changed", async (data) => {
    await broadcastTaskPriorityChanged({
      taskId: data.taskId,
      zoneId: data.zoneId,
      userId: data.userId,
      oldPriority: data.oldPriority,
      newPriority: data.newPriority,
      title: data.title,
    });
  });

  subscribeToEvent<{
    taskId: string;
    userId: string | null;
    oldTitle: string;
    newTitle: string;
    zoneId: string;
  }>("task.title_changed", async (data) => {
    await broadcastTaskTitleChanged({
      taskId: data.taskId,
      zoneId: data.zoneId,
      userId: data.userId,
      oldTitle: data.oldTitle,
      newTitle: data.newTitle,
    });
  });

  subscribeToEvent<{
    taskId: string;
    userId: string | null;
    oldDescription: string | null;
    newDescription: string | null;
    zoneId: string;
  }>("task.description_changed", async (data) => {
    await broadcastTaskDescriptionChanged({
      taskId: data.taskId,
      zoneId: data.zoneId,
      userId: data.userId,
      oldDescription: data.oldDescription,
      newDescription: data.newDescription,
    });
  });

  subscribeToEvent<{
    taskId: string;
    userId: string;
    comment: string;
    zoneId: string;
  }>("task.comment_created", async (data) => {
    await broadcastTaskCommentCreated({
      taskId: data.taskId,
      zoneId: data.zoneId,
      userId: data.userId,
      comment: data.comment,
    });
  });

  eventSubscriptionsInitialized = true;
  console.log("✓ Plugin event subscriptions initialized");
}

export function getPlugin(type: string): IntegrationPlugin | undefined {
  return plugins.get(type);
}

export function listPlugins(): IntegrationPlugin[] {
  return Array.from(plugins.values());
}

async function getActiveIntegrations(zoneId: string) {
  return db.query.integrationTable.findMany({
    where: and(
      eq(integrationTable.zoneId, zoneId),
      eq(integrationTable.isActive, true),
    ),
  });
}

function createContext(integration: {
  id: string;
  zoneId: string;
  config: string;
}): PluginContext {
  return {
    integrationId: integration.id,
    zoneId: integration.zoneId,
    config: JSON.parse(integration.config) as Record<string, unknown>,
  };
}

export async function broadcastTaskCreated(
  event: TaskCreatedEvent,
): Promise<void> {
  const integrations = await getActiveIntegrations(event.zoneId);

  for (const integration of integrations) {
    const plugin = getPlugin(integration.type);
    if (!plugin?.onTaskCreated) continue;

    const context = createContext(integration);

    try {
      await plugin.onTaskCreated(event, context);
    } catch (error) {
      console.error(`Plugin ${plugin.type} error on task.created:`, error);
    }
  }
}

export async function broadcastTaskStatusChanged(
  event: TaskStatusChangedEvent,
): Promise<void> {
  const integrations = await getActiveIntegrations(event.zoneId);

  for (const integration of integrations) {
    const plugin = getPlugin(integration.type);
    if (!plugin?.onTaskStatusChanged) continue;

    const context = createContext(integration);

    try {
      await plugin.onTaskStatusChanged(event, context);
    } catch (error) {
      console.error(
        `Plugin ${plugin.type} error on task.status_changed:`,
        error,
      );
    }
  }
}

export async function broadcastTaskPriorityChanged(
  event: TaskPriorityChangedEvent,
): Promise<void> {
  const integrations = await getActiveIntegrations(event.zoneId);

  for (const integration of integrations) {
    const plugin = getPlugin(integration.type);
    if (!plugin?.onTaskPriorityChanged) continue;

    const context = createContext(integration);

    try {
      await plugin.onTaskPriorityChanged(event, context);
    } catch (error) {
      console.error(
        `Plugin ${plugin.type} error on task.priority_changed:`,
        error,
      );
    }
  }
}

export async function broadcastTaskTitleChanged(
  event: TaskTitleChangedEvent,
): Promise<void> {
  const integrations = await getActiveIntegrations(event.zoneId);

  for (const integration of integrations) {
    const plugin = getPlugin(integration.type);
    if (!plugin?.onTaskTitleChanged) continue;

    const context = createContext(integration);

    try {
      await plugin.onTaskTitleChanged(event, context);
    } catch (error) {
      console.error(
        `Plugin ${plugin.type} error on task.title_changed:`,
        error,
      );
    }
  }
}

export async function broadcastTaskDescriptionChanged(
  event: TaskDescriptionChangedEvent,
): Promise<void> {
  const integrations = await getActiveIntegrations(event.zoneId);

  for (const integration of integrations) {
    const plugin = getPlugin(integration.type);
    if (!plugin?.onTaskDescriptionChanged) continue;

    const context = createContext(integration);

    try {
      await plugin.onTaskDescriptionChanged(event, context);
    } catch (error) {
      console.error(
        `Plugin ${plugin.type} error on task.description_changed:`,
        error,
      );
    }
  }
}

export async function broadcastTaskCommentCreated(
  event: TaskCommentCreatedEvent,
): Promise<void> {
  const integrations = await getActiveIntegrations(event.zoneId);

  for (const integration of integrations) {
    const plugin = getPlugin(integration.type);
    if (!plugin?.onTaskCommentCreated) continue;

    const context = createContext(integration);

    try {
      await plugin.onTaskCommentCreated(event, context);
    } catch (error) {
      console.error(
        `Plugin ${plugin.type} error on task.comment_created:`,
        error,
      );
    }
  }
}
