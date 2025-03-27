import BroadcastChannelManager from './BroadcastChannelManager';
import { generateUUID } from '../utils';
import { BroadcastChannelOptions } from '../types';

export interface BaseAdapterOptions<T> {
  getState: () => T;
  setState: (state: Partial<T>) => void;
  options?: BroadcastChannelOptions;
}

export abstract class BaseAdapter<T> {
  protected readonly manager: BroadcastChannelManager<T>;

  constructor({ getState, setState, options = {} }: BaseAdapterOptions<T>) {
    this.manager = new BroadcastChannelManager(
      { getState, setState },
      {
        channelName: options.channelName ?? 'broadcast-channel',
        syncTimeout: options.syncTimeout ?? 3000,
        retryAttempts: options.retryAttempts ?? 5,
        retryDelay: options.retryDelay ?? 1000,
        instanceId: options.instanceId ?? generateUUID(),
      }
    );
  }

  protected async broadcastState(newState: Partial<T>): Promise<void> {
    try {
      await this.manager.broadcastState(newState);
    } catch (error) {
      console.error('Error broadcasting state:', error);
      throw error;
    }
  }

  public destroy(): void {
    this.manager.destroy();
  }
} 