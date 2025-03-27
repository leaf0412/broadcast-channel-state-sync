import { generateUUID } from '../utils';
import {
  BroadcastMessage,
  StateManager,
  BroadcastChannelOptions,
} from '../types';

const MESSAGE_TYPES = {
  STATE_REQUEST: 'STATE_REQUEST',
  STATE_RESPONSE: 'STATE_RESPONSE',
  STATE_UPDATE: 'STATE_UPDATE',
  STATE_SYNC_START: 'STATE_SYNC_START',
  STATE_SYNC_END: 'STATE_SYNC_END',
} as const;

class BroadcastChannelManager<T> {
  private bc: BroadcastChannel;
  private stateManager: StateManager<T>;
  private isReceivingBroadcast: boolean;
  private pendingSyncs: Map<
    string,
    {
      resolve: (value: T) => void;
      reject: (reason?: unknown) => void;
      timer: NodeJS.Timeout;
    }
  >;
  private options: Required<BroadcastChannelOptions>;
  private messageQueue: Array<{
    message: BroadcastMessage<T>;
    timestamp: number;
  }>;
  private processingQueue: boolean;

  constructor(
    stateManager: StateManager<T>,
    options: BroadcastChannelOptions = {}
  ) {
    this.options = {
      channelName: options.channelName ?? 'state_channel',
      syncTimeout: options.syncTimeout ?? 5000,
      retryAttempts: options.retryAttempts ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      instanceId: options.instanceId ?? generateUUID(),
    };

    this.bc = new BroadcastChannel(this.options.channelName);
    this.stateManager = stateManager;
    this.isReceivingBroadcast = false;
    this.pendingSyncs = new Map();
    this.messageQueue = [];
    this.processingQueue = false;

    this.setupEventListeners();
    this.initializeState();
  }

  private setupEventListeners(): void {
    this.bc.onmessage = this.handleMessage.bind(this);
    window.addEventListener('unload', () => this.destroy());
  }

  private async handleMessage(
    event: MessageEvent<BroadcastMessage<T>>
  ): Promise<void> {
    const { data } = event;
    if (data.source === this.options.instanceId) {
      return;
    }

    this.messageQueue.push({
      message: data,
      timestamp: Date.now(),
    });

    if (!this.processingQueue) {
      await this.processMessageQueue();
    }
  }

  private async processMessageQueue(): Promise<void> {
    this.processingQueue = true;

    const messageHandlers = {
      [MESSAGE_TYPES.STATE_REQUEST]: this.handleStateRequest.bind(this),
      [MESSAGE_TYPES.STATE_RESPONSE]: this.handleStateResponse.bind(this),
      [MESSAGE_TYPES.STATE_UPDATE]: this.handleStateUpdate.bind(this),
      [MESSAGE_TYPES.STATE_SYNC_START]: this.handleSyncStart.bind(this),
      [MESSAGE_TYPES.STATE_SYNC_END]: this.handleSyncEnd.bind(this),
    };

    while (this.messageQueue.length > 0) {
      const { message } = this.messageQueue.shift()!;

      try {
        const handler = messageHandlers[message.type];
        if (handler) {
          await handler(message);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }

    this.processingQueue = false;
  }

  private async handleStateRequest(
    message: BroadcastMessage<T>
  ): Promise<void> {
    const currentState = this.stateManager.getState();
    this.bc.postMessage({
      type: MESSAGE_TYPES.STATE_RESPONSE,
      state: currentState,
      id: message.id,
      timestamp: Date.now(),
      source: this.options.instanceId,
    });
  }

  private async handleStateResponse(
    message: BroadcastMessage<T>
  ): Promise<void> {
    const pendingSync = this.pendingSyncs.get(message.id!);
    if (pendingSync) {
      clearTimeout(pendingSync.timer);
      this.pendingSyncs.delete(message.id!);
      pendingSync.resolve(message.state as T);
    }
  }

  private async handleStateUpdate(message: BroadcastMessage<T>): Promise<void> {
    if (this.isReceivingBroadcast) return;

    try {
      this.isReceivingBroadcast = true;
      await this.updateState(message.state as Partial<T>);
    } finally {
      this.isReceivingBroadcast = false;
    }
  }

  private async handleSyncStart(message: BroadcastMessage<T>): Promise<void> {
    // console.log('Sync started:', message.id);
  }

  private async handleSyncEnd(message: BroadcastMessage<T>): Promise<void> {
    // console.log('Sync ended:', message.id);
  }

  private async updateState(state: Partial<T>): Promise<void> {
    this.stateManager.setState(state);
  }

  public async broadcastState(newState: Partial<T>): Promise<void> {
    if (this.isReceivingBroadcast) return;

    const message: BroadcastMessage<T> = {
      type: MESSAGE_TYPES.STATE_UPDATE,
      state: newState,
      timestamp: Date.now(),
      source: this.options.instanceId,
    };

    this.bc.postMessage(message);
  }

  private async getInitialState(): Promise<T> {
    let attempts = 0;

    while (attempts < this.options.retryAttempts) {
      try {
        const state = await this.requestState();
        return state;
      } catch (error) {
        attempts++;
        if (attempts === this.options.retryAttempts) {
          return this.stateManager.getState();
        }
        await new Promise(resolve =>
          setTimeout(resolve, this.options.retryDelay)
        );
      }
    }

    return this.stateManager.getState();
  }

  private async requestState(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const syncId = generateUUID();
      const timer = setTimeout(() => {
        this.pendingSyncs.delete(syncId);
        reject(new Error('State sync timeout'));
      }, this.options.syncTimeout);

      this.pendingSyncs.set(syncId, { resolve, reject, timer });

      this.bc.postMessage({
        type: MESSAGE_TYPES.STATE_REQUEST,
        id: syncId,
        timestamp: Date.now(),
        source: this.options.instanceId,
      });
    });
  }

  private async initializeState(): Promise<void> {
    try {
      const syncId = generateUUID();

      this.bc.postMessage({
        type: MESSAGE_TYPES.STATE_SYNC_START,
        id: syncId,
        timestamp: Date.now(),
        source: this.options.instanceId,
      });

      const initialState = await this.getInitialState();

      this.isReceivingBroadcast = true;
      await this.updateState(initialState);

      this.bc.postMessage({
        type: MESSAGE_TYPES.STATE_SYNC_END,
        id: syncId,
        timestamp: Date.now(),
        source: this.options.instanceId,
      });
    } finally {
      this.isReceivingBroadcast = false;
    }
  }

  public destroy(): void {
    this.pendingSyncs.forEach(({ timer }) => clearTimeout(timer));
    this.pendingSyncs.clear();
    this.messageQueue = [];
    this.bc.onmessage = null;
    this.bc.close();
  }
}

export default BroadcastChannelManager;
