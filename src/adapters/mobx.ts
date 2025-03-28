import { makeAutoObservable, runInAction, autorun } from 'mobx';
import { BaseAdapter } from '../core/BaseAdapter';
import { BroadcastChannelOptions } from '../types';

export interface BroadcastAdapterOptions {
  store: any;
  stateKeys: string[];
  options?: BroadcastChannelOptions;
}

export class BroadcastAdapter<T> extends BaseAdapter<T> {
  private readonly store: any;
  private readonly stateKeys: string[];
  private disposer: (() => void) | null = null;
  private prevState: Partial<T>;
  private readonly getStateFn: () => T;

  constructor({ store, stateKeys, options = {} }: BroadcastAdapterOptions) {
    if (!store) {
      throw new Error('Store cannot be empty');
    }
    if (!stateKeys || stateKeys.length === 0) {
      throw new Error('State keys cannot be empty');
    }

    const getState = () => {
      try {
        const state: Partial<T> = {};
        stateKeys.forEach(key => {
          if (key in store) {
            // 对数组进行深拷贝
            if (Array.isArray(store[key])) {
              state[key as keyof T] = JSON.parse(JSON.stringify(store[key]));
            } else {
              state[key as keyof T] = store[key];
            }
          }
        });
        return state as T;
      } catch (error) {
        console.error('Error getting state:', error);
        throw error;
      }
    };

    super({
      getState,
      setState: (state: Partial<T>) => {
        try {
          runInAction(() => {
            Object.entries(state).forEach(([key, value]) => {
              if (stateKeys.includes(key) && key in store) {
                // 对数组进行深拷贝
                if (Array.isArray(value)) {
                  store[key] = JSON.parse(JSON.stringify(value));
                } else {
                  store[key] = value;
                }
              }
            });
          });
        } catch (error) {
          console.error('Error setting state:', error);
          throw error;
        }
      },
      options: {
        ...options,
        channelName: options.channelName ?? 'mobx-channel',
      },
    });

    this.store = store;
    this.stateKeys = stateKeys;
    this.getStateFn = getState;
    this.prevState = getState();
    this.setupSubscription();
  }

  private setupSubscription(): void {
    // 使用 MobX 的 autorun 来监听状态变化
    this.disposer = autorun(() => {
      try {
        const newState = this.getStateFn();
        const changedKeys: Partial<T> = {};

        this.stateKeys.forEach(key => {
          const prevValue = this.prevState[key as keyof T];
          const newValue = newState[key as keyof T];

          // 对数组进行深度比较
          if (Array.isArray(prevValue) && Array.isArray(newValue)) {
            if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
              changedKeys[key as keyof T] = newValue;
            }
          } else if (prevValue !== newValue) {
            changedKeys[key as keyof T] = newValue;
          }
        });

        if (Object.keys(changedKeys).length > 0) {
          this.broadcastState(changedKeys).catch(error => {
            console.error('Error broadcasting changed state:', error);
          });
        }

        this.prevState = newState;
      } catch (error) {
        console.error('Error in store subscription:', error);
      }
    });
  }

  public destroy(): void {
    if (this.disposer) {
      this.disposer();
    }
    super.destroy();
  }
}