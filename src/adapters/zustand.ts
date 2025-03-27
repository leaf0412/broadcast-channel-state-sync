import { StoreApi } from 'zustand';
import { BaseAdapter } from '../core/BaseAdapter';
import { BroadcastChannelOptions } from '../types';

export interface BroadcastAdapterOptions {
  slices: Record<string, StoreApi<any>>;
  options?: BroadcastChannelOptions;
}

export class BroadcastAdapter<T> extends BaseAdapter<T> {
  private readonly slices: Record<string, StoreApi<any>>;
  private unsubscribeCallbacks: Array<() => void> = [];

  constructor({ slices, options = {} }: BroadcastAdapterOptions) {
    if (!slices || Object.keys(slices).length === 0) {
      throw new Error('Slices cannot be empty');
    }

    super({
      getState: () => {
        try {
          const state: Partial<T> = {};
          Object.entries(slices).forEach(([key, slice]) => {
            state[key as keyof T] = slice.getState();
          });
          return state as T;
        } catch (error) {
          console.error('Error getting state:', error);
          throw error;
        }
      },
      setState: (state: Partial<T>) => {
        try {
          Object.entries(state).forEach(([key, value]) => {
            if (slices[key]) {
              slices[key].setState(value);
            }
          });
        } catch (error) {
          console.error('Error setting state:', error);
          throw error;
        }
      },
      options: {
        ...options,
        channelName: options.channelName ?? 'zustand-channel',
      },
    });

    this.slices = slices;
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    Object.entries(this.slices).forEach(([key, slice]) => {
      const unsubscribe = slice.subscribe(state => {
        this.broadcastState({ [key]: state } as Partial<T>).catch(error => {
          console.error(`Error broadcasting state for ${key}:`, error);
        });
      });
      this.unsubscribeCallbacks.push(unsubscribe);
    });
  }

  public destroy(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    super.destroy();
  }
}
