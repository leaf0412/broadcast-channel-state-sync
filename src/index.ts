import { BroadcastAdapter as ReduxAdapter } from './adapters/redux';
import { BroadcastAdapter as PiniaAdapter } from './adapters/pinia';

export { default as BroadcastChannelManager } from './core/BroadcastChannelManager';
export type { StateManager, BroadcastChannelOptions } from './types';
export { ReduxAdapter, PiniaAdapter };
export { generateUUID } from './utils';
