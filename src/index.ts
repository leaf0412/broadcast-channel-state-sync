import { BroadcastAdapter as ReduxAdapter } from './adapters/redux';
import { BroadcastAdapter as PiniaAdapter } from './adapters/pinia';
import { BroadcastAdapter as ZustandAdapter } from './adapters/zustand';

export { default as BroadcastChannelManager } from './core/BroadcastChannelManager';
export type { StateManager, BroadcastChannelOptions } from './types';
export { ReduxAdapter, PiniaAdapter, ZustandAdapter };
export { generateUUID } from './utils';
