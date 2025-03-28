import { makeAutoObservable } from 'mobx';
import { MobxAdapter } from '../../../../dist';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

class TodoStore {
  todos: Todo[] = [];
  filter: 'all' | 'active' | 'completed' = 'all';

  constructor() {
    makeAutoObservable(this);
    this.setupBroadcastChannel();
  }

  private setupBroadcastChannel() {
    const adapter = new MobxAdapter({
      store: this,
      stateKeys: ['todos', 'filter'],
      options: {
        channelName: 'todo-store',
        // @ts-ignore
        serialize: (data: unknown) => JSON.stringify(data),
        // @ts-ignore
        deserialize: (data: string) => JSON.parse(data),
      },
    });

    // 页面卸载时清理
    window.addEventListener('unload', () => {
      adapter.destroy();
    });
  }

  addTodo(text: string) {
    this.todos.push({
      id: Math.random().toString(36).slice(2),
      text,
      completed: false,
    });
  }

  toggleTodo(id: string) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  removeTodo(id: string) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.filter = filter;
  }

  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  }

  get activeCount() {
    return this.todos.filter(todo => !todo.completed).length;
  }

  get completedCount() {
    return this.todos.filter(todo => todo.completed).length;
  }
}

export const todoStore = new TodoStore(); 