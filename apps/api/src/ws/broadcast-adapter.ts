export type ProjectBroadcastMessage = {
  type: string;
  zoneId: string;
  taskId?: string;
  sourceTaskId?: string;
  targetTaskId?: string;
};

export type BroadcastMessage = {
  zoneId: string;
  message: ProjectBroadcastMessage;
  excludeInitiatorId?: string;
};

export type BroadcastAdapter = {
  /** Publish a message to all instances watching this project */
  publish(msg: BroadcastMessage): Promise<void>;

  /** Subscribe to messages for delivery to local connections */
  subscribe(handler: (msg: BroadcastMessage) => void): Promise<void>;

  /** Cleanup on shutdown */
  shutdown(): Promise<void>;
};
