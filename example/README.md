# 状态管理库集成示例

这个目录包含了使用 BroadcastChannel 与不同状态管理库集成的示例。

## 目录结构

- `redux/` - Redux 集成示例
- `zustand/` - Zustand 集成示例
- `pinia/` - Pinia 集成示例

## 使用方法

1. 安装依赖：
```bash
npm install
```

2. 选择你想要使用的状态管理库示例：
   - Redux: 使用 `example/redux/` 目录下的代码
   - Zustand: 使用 `example/zustand/` 目录下的代码
   - Pinia: 使用 `example/pinia/` 目录下的代码

## 示例说明

每个示例都实现了相同的 Todo 应用功能，包括：
- 添加待办事项
- 切换待办事项状态
- 删除待办事项
- 过滤待办事项

所有示例都使用 BroadcastChannel 实现了跨标签页的状态同步。

## 集成方式

### Redux
使用 `store.ts` 中的 `broadcastManager` 实例来同步状态。

### Zustand
使用 `useTodoStore.ts` 中的 `broadcastManager` 实例来同步状态。

### Pinia
使用 `todoStore.ts` 中的 `broadcastManager` 实例来同步状态。

## 注意事项

1. 确保在使用前已经安装了所有必要的依赖
2. BroadcastChannel API 仅在支持该 API 的现代浏览器中可用
3. 每个状态管理库的示例都使用了独立的广播通道名称，以避免冲突 