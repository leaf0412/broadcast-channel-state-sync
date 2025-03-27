export interface BroadcastMessage<T = unknown> {
  type:
    | 'STATE_UPDATE'
    | 'STATE_REQUEST'
    | 'STATE_RESPONSE'
    | 'STATE_SYNC_START'
    | 'STATE_SYNC_END';
  id?: string;
  state?: Partial<T>;
  timestamp?: number;
  source?: string;
  [key: string]: unknown;
}

export interface StateManager<T> {
  getState: () => T;
  setState: (state: Partial<T>) => void;
}

export interface BroadcastChannelOptions {
  channelName?: string;
  syncTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  instanceId?: string;
}
