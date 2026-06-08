import type { WSContext } from "hono/ws";
import { subscribeToEvent } from "../events";
import { isRedisConfigured } from "../redis";
import type {
  BroadcastAdapter,
  BroadcastMessage,
  ProjectBroadcastMessage,
} from "./broadcast-adapter";
import { InMemoryBroadcastAdapter } from "./in-memory-broadcast-adapter";
import { RedisBroadcastAdapter } from "./redis-broadcast-adapter";

type ProjectConnection = {
  ws: WSContext;
  userId: string;
  initiatorId: string;
};

/**
 * Local connections — Each instance tracks only its own WebSocket connections.
 */
const projectConnections = new Map<string, Set<ProjectConnection>>();

/**
 * Batching queues and timers local per-instance.
 * They accumulate messages before flushing to the broadcast adapter.
 */
const projectBroadcastQueues = new Map<
  string,
  Map<string, { message: ProjectBroadcastMessage; excludeInitiatorId?: string }>
>();
const projectBroadcastTimeouts = new Map<
  string,
  ReturnType<typeof setTimeout>
>();

let adapter: BroadcastAdapter | null = null;

// --- Subscribe to incoming broadcasts and deliver to local connections ---
export async function initializeWebSocketAdapter() {
  if (adapter) return;

  const nextAdapter = isRedisConfigured()
    ? new RedisBroadcastAdapter()
    : new InMemoryBroadcastAdapter();

  try {
    await nextAdapter.subscribe((msg: BroadcastMessage) => {
      deliverToLocalConnections(
        msg.zoneId,
        msg.message,
        msg.excludeInitiatorId,
      );
    });
  } catch (err) {
    await nextAdapter.shutdown().catch(() => {});
    throw err;
  }

  adapter = nextAdapter;
  console.log(`📡 WebSockets Initialized using: "${adapter.constructor.name}"`);
}

export async function shutdownWebSocketAdapter() {
  const pendingQueues = [...projectBroadcastQueues.entries()];

  for (const timeout of projectBroadcastTimeouts.values()) {
    clearTimeout(timeout);
  }
  projectBroadcastTimeouts.clear();
  projectBroadcastQueues.clear();

  const currentAdapter = adapter;
  if (currentAdapter) {
    await Promise.allSettled(
      pendingQueues.flatMap(([zoneId, queue]) =>
        [...queue.values()].map(({ message, excludeInitiatorId }) =>
          currentAdapter.publish({ zoneId, message, excludeInitiatorId }),
        ),
      ),
    );
  }

  await currentAdapter?.shutdown();
  adapter = null;
}

function deliverToLocalConnections(
  zoneId: string,
  message: ProjectBroadcastMessage,
  excludeInitiatorId?: string,
) {
  const connections = projectConnections.get(zoneId);
  if (!connections) return;

  const payload = JSON.stringify(message);
  for (const conn of connections) {
    if (excludeInitiatorId && conn.initiatorId === excludeInitiatorId) continue;
    try {
      conn.ws.send(payload);
    } catch {
      connections.delete(conn);
    }
  }
  if (connections.size === 0) {
    projectConnections.delete(zoneId);
  }
}

export function addConnection(
  zoneId: string,
  ws: WSContext,
  userId: string,
  initiatorId: string,
) {
  if (!projectConnections.has(zoneId)) {
    projectConnections.set(zoneId, new Set());
  }
  const conn: ProjectConnection = { ws, userId, initiatorId };
  projectConnections.get(zoneId)?.add(conn);
  return conn;
}

export function removeConnection(zoneId: string, conn: ProjectConnection) {
  const connections = projectConnections.get(zoneId);
  if (connections) {
    connections.delete(conn);
    if (connections.size === 0) {
      projectConnections.delete(zoneId);
    }
  }
}

export function broadcastToProject(
  zoneId: string,
  message: ProjectBroadcastMessage,
  excludeInitiatorId?: string,
) {
  if (!adapter) {
    console.warn("broadcastToProject called before adapter initialization");
    return;
  }

  if (!projectBroadcastQueues.has(zoneId)) {
    projectBroadcastQueues.set(zoneId, new Map());
  }

  const messageKey = `${message.type}:${message.taskId ?? ""}:${message.sourceTaskId ?? ""}:${message.targetTaskId ?? ""}`;
  projectBroadcastQueues
    .get(zoneId)
    ?.set(messageKey, { message, excludeInitiatorId });

  if (projectBroadcastTimeouts.has(zoneId)) {
    return;
  }

  const timeout = setTimeout(() => {
    projectBroadcastTimeouts.delete(zoneId);
    const queue = projectBroadcastQueues.get(zoneId);
    projectBroadcastQueues.delete(zoneId);

    if (!queue || !adapter) return;

    // Publish each queued message through the adapter
    for (const { message: msg, excludeInitiatorId: exId } of queue.values()) {
      void adapter
        .publish({
          zoneId,
          message: msg,
          excludeInitiatorId: exId,
        })
        .catch((err) => {
          console.error(
            `Failed to publish broadcast for project ${zoneId}:`,
            err,
          );
        });
    }
  }, 100);

  projectBroadcastTimeouts.set(zoneId, timeout);
}

type TaskEvent = {
  id: string | undefined;
  zoneId: string;
  userId: string;
  initiatorId?: string;
  taskId: string;
  sourceTaskId: string | undefined;
  targetTaskId: string | undefined;
};

const taskUpdateEvents = [
  "task.created",
  "task.updated",
  "task.deleted",
  "task.status_changed",
  "task.priority_changed",
  "task.unassigned",
  "task.assignee_changed",
  "task.due_date_changed",
  "task.title_changed",
  "task.description_changed",
  "task.label_assigned",
  "task.label_unassigned",
  "task.label_created",
  "task.label_deleted",
  "task-relation.created",
  "task-relation.deleted",
  "task.comment_created",
  "comment.created",
  "comment.deleted",
  "comment.updated",
];

subscribeToEvent<{
  taskId: string;
  userId: string;
  initiatorId?: string;
  type: string;
  content: string;
  fromzoneId: string;
  fromProjectName: string;
  tozoneId: string;
  toProjectName: string;
  oldStatus: string;
  newStatus: string;
}>("task.moved", async (data) => {
  const { fromzoneId, initiatorId, tozoneId, taskId } = data;

  broadcastToProject(
    tozoneId,
    { type: "TASK_MOVED", zoneId: tozoneId, taskId },
    initiatorId,
  );
  broadcastToProject(
    fromzoneId,
    { type: "TASK_MOVED", zoneId: fromzoneId, taskId },
    initiatorId,
  );
});

subscribeToEvent<{
  zoneId: string;
  userId: string;
  initiatorId?: string;
}>("task-relation.refresh", async (data) => {
  const { zoneId, initiatorId } = data;
  if (!zoneId) return;

  broadcastToProject(
    zoneId,
    {
      type: "TASK_RELATION_UPDATED",
      zoneId,
      taskId: "",
      sourceTaskId: undefined,
      targetTaskId: undefined,
    },
    initiatorId,
  );
});

for (const eventName of taskUpdateEvents) {
  subscribeToEvent<TaskEvent>(eventName, async (data) => {
    const { zoneId, initiatorId } = data;
    const taskId = data.taskId;

    if (!zoneId || !taskId) return;
    let type: string;
    switch (eventName) {
      case "task.created":
        type = "TASK_CREATED";
        break;
      case "task.deleted":
        type = "TASK_DELETED";
        break;
      case "task-relation.created":
      case "task-relation.deleted":
        type = "TASK_RELATION_UPDATED";
        break;
      case "task.label_assigned":
      case "task.label_unassigned":
      case "task.label_created":
      case "task.label_deleted":
        type = "TASK_LABEL_UPDATED";
        break;
      case "task.comment_created":
      case "comment.created":
      case "comment.deleted":
      case "comment.updated":
        type = "COMMENT_UPDATED";
        break;
      default:
        type = "TASK_UPDATED";
    }

    broadcastToProject(
      zoneId,
      {
        type,
        zoneId,
        taskId: taskId,
        sourceTaskId: data.sourceTaskId,
        targetTaskId: data.targetTaskId,
      },
      initiatorId,
    );
  });
}
