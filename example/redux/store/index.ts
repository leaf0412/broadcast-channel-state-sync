import { configureStore, Slice } from '@reduxjs/toolkit';
import todoSlice from './slices/todo';
import { ReduxAdapter } from '../../../dist';

const slices: Record<string, Slice> = {
  todos: todoSlice,
};

const store = configureStore({
  reducer: {
    todos: todoSlice.reducer,
  },
});

// 创建广播通道管理器
const broadcastManager = new ReduxAdapter({
  store,
  slices,
  options: {
    channelName: 'redux-channel',
    syncTimeout: 3000,
    retryAttempts: 5,
  },
});

export { store, broadcastManager };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
