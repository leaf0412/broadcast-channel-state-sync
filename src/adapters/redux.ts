import { Slice, Store } from '@reduxjs/toolkit';
import { BaseAdapter } from '../core/BaseAdapter';
import { BroadcastChannelOptions } from '../types';

export interface BroadcastAdapterOptions {
  store: Store;
  slices: Record<string, Slice<any>>;
  options?: BroadcastChannelOptions;
}

export class BroadcastAdapter<T> extends BaseAdapter<T> {
  private readonly slices: Record<string, Slice<any>>;
  private readonly store: Store;
  private unsubscribeCallback: (() => void) | null = null;
  private prevState: any;

  constructor({ store, slices, options = {} }: BroadcastAdapterOptions) {
    if (!store) {
      throw new Error('Store cannot be empty');
    }
    if (!slices || Object.keys(slices).length === 0) {
      throw new Error('Slices cannot be empty');
    }

    super({
      getState: () => {
        try {
          const currentState = store.getState();
          const state: Partial<T> = {};
          Object.keys(slices).forEach(key => {
            if (key in currentState) {
              state[key as keyof T] = currentState[key];
            }
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
              const slice = slices[key];
              const actions = Object.values(slice.actions);
              const setStateAction = actions.find(
                action =>
                  action.type.endsWith('/setState') ||
                  action.type.endsWith('/replaceState')
              );

              if (setStateAction) {
                store.dispatch(setStateAction(value));
              } else {
                console.warn(
                  `No setState or replaceState action found for slice ${key}`
                );
              }
            }
          });
        } catch (error) {
          console.error('Error setting state:', error);
          throw error;
        }
      },
      options: {
        ...options,
        channelName: options.channelName ?? 'redux-channel',
      },
    });

    this.store = store;
    this.slices = slices;
    this.prevState = store.getState();
    this.setupSubscription();
  }

  private setupSubscription(): void {
    this.unsubscribeCallback = this.store.subscribe(() => {
      try {
        const newState = this.store.getState();
        const changedSlices: Partial<T> = {};

        Object.entries(this.slices).forEach(([key, slice]) => {
          const prevSliceState = this.prevState[key];
          const newSliceState = newState[key];

          if (prevSliceState !== newSliceState) {
            changedSlices[key as keyof T] = newSliceState;
          }
        });

        if (Object.keys(changedSlices).length > 0) {
          this.broadcastState(changedSlices).catch(error => {
            console.error('Error broadcasting changed slices:', error);
          });
        }

        this.prevState = newState;
      } catch (error) {
        console.error('Error in store subscription:', error);
      }
    });
  }

  public destroy(): void {
    if (this.unsubscribeCallback) {
      this.unsubscribeCallback();
    }
    super.destroy();
  }
}
