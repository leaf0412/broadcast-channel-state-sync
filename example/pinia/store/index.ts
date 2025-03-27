import { createPinia } from 'pinia';
import { PiniaAdapter } from '../../../dist';
import { useTodoStore } from './slices/todo';
import { useUserStore } from './slices/user';

export const pinia = createPinia();

// Create store instances
export function setupStoreSync() {
  const todoStore = useTodoStore(pinia);
  const userStore = useUserStore(pinia);

  // Set up broadcast adapter with all stores
  const storeSlices = {
    todo: todoStore,
    user: userStore,
  };

  const adapter = new PiniaAdapter({
    slices: storeSlices,
    options: {
      channelName: 'pinia-channel',
      syncTimeout: 3000,
      retryAttempts: 5,
    },
  });

  return adapter;
}
