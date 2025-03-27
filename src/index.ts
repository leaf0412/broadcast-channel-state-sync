import { BroadcastAdapter as ReduxAdapter } from './adapters/redux';

export { default as BroadcastChannelManager } from './core/BroadcastChannelManager';
export type { StateManager, BroadcastChannelOptions } from './types';
export { ReduxAdapter };
export { generateUUID } from './utils';
