import { BroadcastAdapter as ReduxAdapter } from './adapters/redux';
import { BroadcastAdapter as PiniaAdapter } from './adapters/pinia';
import { BroadcastAdapter as ZustandAdapter } from './adapters/zustand';
import { BroadcastAdapter as MobxAdapter } from './adapters/mobx';

export { default as BroadcastChannelManager } from './core/BroadcastChannelManager';
export type { StateManager, BroadcastChannelOptions } from './types';
export { ReduxAdapter, PiniaAdapter, ZustandAdapter, MobxAdapter };
export { generateUUID } from './utils';
