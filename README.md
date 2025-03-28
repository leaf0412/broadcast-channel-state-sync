# broadcast-channel-state-sync

一个用于在浏览器标签页之间同步状态的 TypeScript 库，基于 BroadcastChannel API。

## 特性

- 使用 BroadcastChannel API 进行跨标签页通信
- 支持状态同步和更新
- 类型安全
- 可配置的重试机制和超时设置
- 自动状态初始化和同步
- 支持自定义状态管理器
- 内置对 Redux、Pinia、Zustand 和 MobX 的支持
- 支持 ESM 和 CommonJS 模块系统

## 安装

```bash
npm install broadcast-channel-state-sync
```

## 使用方法

### 基础用法

```typescript
import { BroadcastChannelManager } from 'broadcast-channel-state-sync';

// 定义你的状态类型
interface AppState {
  count: number;
  message: string;
}

// 创建一个状态管理器
const stateManager = {
  getState: () => ({ count: 0, message: 'Hello' }),
  setState: (state: Partial<AppState>) => {
    // 实现你的状态更新逻辑
    console.log('State updated:', state);
  }
};

// 创建 BroadcastChannelManager 实例
const manager = new BroadcastChannelManager<AppState>(stateManager, {
  channelName: 'my-app-state',
  syncTimeout: 3000,
  retryAttempts: 3,
  retryDelay: 1000
});

// 广播状态更新
manager.broadcastState({ count: 1 });

// 在组件卸载时清理
window.addEventListener('unload', () => {
  manager.destroy();
});
```

### 使用 Redux 适配器

```typescript
import { ReduxAdapter } from 'broadcast-channel-state-sync';
import { configureStore } from '@reduxjs/toolkit';
import todoSlice from './slices/todo';

// 创建 store
const store = configureStore({
  reducer: {
    todos: todoSlice.reducer,
  },
});

// 创建 Redux 适配器
const adapter = new ReduxAdapter({
  store,
  slices: {
    todos: todoSlice,
  },
  options: {
    channelName: 'redux-channel',
    syncTimeout: 3000,
    retryAttempts: 5,
  },
});

const manager = new BroadcastChannelManager(adapter, {
  channelName: 'redux-state'
});
```

### 使用 Pinia 适配器

```typescript
import { PiniaAdapter } from 'broadcast-channel-state-sync';
import { defineStore } from 'pinia';

// 定义 store
const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    filter: 'all',
  }),
  actions: {
    // ... 其他 actions
  },
});

// 创建 store 实例
const store = useTodoStore();

// 创建 Pinia 适配器
const adapter = new PiniaAdapter({
  store,
  options: {
    channelName: 'pinia-channel',
    syncTimeout: 3000,
    retryAttempts: 5,
  },
});

const manager = new BroadcastChannelManager(adapter, {
  channelName: 'pinia-state'
});
```

### 使用 Zustand 适配器

```typescript
import { ZustandAdapter } from 'broadcast-channel-state-sync';
import { create } from 'zustand';

// 定义 store
const useTodoStore = create((set) => ({
  todos: [],
  filter: 'all',
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, completed: false }]
  })),
  // ... 其他 actions
}));

// 创建 store 实例
const store = useTodoStore();

// 创建 Zustand 适配器
const adapter = new ZustandAdapter({
  store,
  options: {
    channelName: 'zustand-channel',
    syncTimeout: 3000,
    retryAttempts: 5,
  },
});

const manager = new BroadcastChannelManager(adapter, {
  channelName: 'zustand-state'
});
```

### 使用 MobX 适配器

```typescript
import { MobXAdapter } from 'broadcast-channel-state-sync';
import { makeAutoObservable } from 'mobx';

// 定义 store
class TodoStore {
  todos = [];
  filter = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  addTodo(text) {
    this.todos.push({ id: Date.now(), text, completed: false });
  }
}

// 创建 store 实例
const store = new TodoStore();

// 创建 MobX 适配器
const adapter = new MobXAdapter({
  store,
  options: {
    channelName: 'mobx-channel',
    syncTimeout: 3000,
    retryAttempts: 5,
  },
});

const manager = new BroadcastChannelManager(adapter, {
  channelName: 'mobx-state'
});
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| channelName | string | 'state_channel' | BroadcastChannel 的名称 |
| syncTimeout | number | 5000 | 状态同步超时时间（毫秒） |
| retryAttempts | number | 3 | 同步失败时的重试次数 |
| retryDelay | number | 1000 | 重试之间的延迟时间（毫秒） |
| instanceId | string | crypto.randomUUID() | 实例标识符 |

## 适配器说明

### Redux 适配器

Redux 适配器需要在创建时提供 store 和需要同步的 slices 配置。对于每个需要同步的 slice，你需要：

1. 在 slice 中定义 `setState` reducer，用于处理从其他标签页接收到的状态更新
2. 在创建适配器时，将 slice 实例传入 `slices` 配置中

适配器会自动检测这些方法并使用它们来更新状态。如果没有提供这些方法，状态同步将无法正常工作。

### Pinia 适配器

Pinia 适配器需要在创建时提供 store 实例和配置选项。适配器会自动处理状态更新，不需要在 store 中定义额外的方法。

### Zustand 适配器

Zustand 适配器需要在创建时提供 store 实例和配置选项。适配器会自动处理状态更新，不需要在 store 中定义额外的方法。

### MobX 适配器

MobX 适配器需要在创建时提供 store 实例和配置选项。适配器会自动处理状态更新，不需要在 store 中定义额外的方法。确保你的 store 类使用了 `makeAutoObservable` 或 `makeObservable` 来使状态可观察。

## 依赖版本

- @reduxjs/toolkit: ^2.6.1
- mobx: ^6.13.7
- pinia: ^3.0.1
- zustand: ^5.0.3

## 注意事项

- 该库依赖于 BroadcastChannel API，确保你的目标浏览器支持此 API
- 建议在初始化时提供一个合适的状态管理器实现
- 在组件卸载时调用 `destroy()` 方法以清理资源
- 使用适配器时，确保状态管理器的类型与适配器兼容
- 使用 Redux 适配器时，必须提供 `setState` 方法
- 所有适配器都支持通过 options 配置同步选项

## 许可证

MIT