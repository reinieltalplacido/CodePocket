export type VaultEventResource = "snippets" | "folders" | "profile" | "api-keys";

export type VaultEvent = {
  id: string;
  resource: VaultEventResource;
  action: string;
  entityId?: string;
  title?: string;
  source?: string;
  timestamp: string;
};

type Listener = (event: VaultEvent) => void;

type BusState = {
  listeners: Map<string, Set<Listener>>;
  recent: Map<string, VaultEvent[]>;
};

const globalForRealtime = globalThis as unknown as {
  __codepocketRealtimeBus?: BusState;
};

const state: BusState = globalForRealtime.__codepocketRealtimeBus ?? {
  listeners: new Map(),
  recent: new Map(),
};

if (!globalForRealtime.__codepocketRealtimeBus) {
  globalForRealtime.__codepocketRealtimeBus = state;
}

export function emitVaultEvent(
  userId: string,
  payload: Omit<VaultEvent, "id" | "timestamp">
): VaultEvent {
  const event: VaultEvent = {
    ...payload,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  const history = state.recent.get(userId) ?? [];
  state.recent.set(userId, [event, ...history].slice(0, 20));

  const userListeners = state.listeners.get(userId);
  if (userListeners) {
    for (const listener of userListeners) {
      try {
        listener(event);
      } catch {
        // Ignore disconnected subscriber errors
      }
    }
  }

  return event;
}

export function getRecentVaultEvents(userId: string): VaultEvent[] {
  return state.recent.get(userId) ?? [];
}

export function subscribeVaultEvents(userId: string, listener: Listener): () => void {
  let userListeners = state.listeners.get(userId);
  if (!userListeners) {
    userListeners = new Set();
    state.listeners.set(userId, userListeners);
  }
  userListeners.add(listener);

  return () => {
    const current = state.listeners.get(userId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) {
      state.listeners.delete(userId);
    }
  };
}
