import { ZustandAdapter } from '../../../dist';
import { useTodoStore, todoActions } from './slices/todo';

// 创建广播通道管理器，只传递纯状态
const broadcastManager = new ZustandAdapter({
  slices: {
    todo: useTodoStore,
  },
  options: {
    channelName: 'zustand-channel',
    syncTimeout: 3000,
    retryAttempts: 5,
  },
});

// 创建一个组合了状态和操作的 hook
const useStoreWithActions = () => {
  const state = useTodoStore();
  return {
    ...state,
    ...todoActions,
  };
};

export { useTodoStore, useStoreWithActions, broadcastManager };
