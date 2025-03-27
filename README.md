# broadcast-channel-state-sync

一个用于在浏览器标签页之间同步状态的 TypeScript 库，基于 BroadcastChannel API。

## 特性

- 使用 BroadcastChannel API 进行跨标签页通信
- 支持状态同步和更新
- 类型安全
- 可配置的重试机制和超时设置
- 自动状态初始化和同步
- 支持自定义状态管理器

## 安装

```bash
npm install broadcast-channel-state-sync
```

## 使用方法

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

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| channelName | string | 'state_channel' | BroadcastChannel 的名称 |
| syncTimeout | number | 5000 | 状态同步超时时间（毫秒） |
| retryAttempts | number | 3 | 同步失败时的重试次数 |
| retryDelay | number | 1000 | 重试之间的延迟时间（毫秒） |
| instanceId | string | crypto.randomUUID() | 实例标识符 |

## 注意事项

- 该库依赖于 BroadcastChannel API，确保你的目标浏览器支持此 API
- 建议在初始化时提供一个合适的状态管理器实现
- 在组件卸载时调用 `destroy()` 方法以清理资源

## 许可证

MIT