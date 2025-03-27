import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { TodoState, TodoActions } from '../../../types';
import { produce } from 'immer';

const initialState: TodoState = {
  todos: [],
  filter: 'all',
  searchQuery: '',
};

// 创建一个纯状态的 store
const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState
      }),
      {
        name: 'todo-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

// 创建操作函数
export const todoActions: TodoActions = {
  addTodo: (text: string) =>
    useTodoStore.setState(
      produce((state) => {
        state.todos.push({
          id: String(Date.now()),
          text: String(text),
          completed: false,
          createdAt: new Date().toISOString(),
        });
      }),
      false,
      'addTodo'
    ),

  toggleTodo: (id: string) =>
    useTodoStore.setState(
      produce((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
          todo.updatedAt = new Date().toISOString();
        }
      }),
      false,
      'toggleTodo'
    ),

  deleteTodo: (id: string) =>
    useTodoStore.setState(
      produce((state) => {
        state.todos = state.todos.filter((todo) => todo.id !== id);
      }),
      false,
      'deleteTodo'
    ),

  updateTodo: (id: string, text: string) =>
    useTodoStore.setState(
      produce((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.text = text;
          todo.updatedAt = new Date().toISOString();
        }
      }),
      false,
      'updateTodo'
    ),

  toggleAllTodos: (completed: boolean) =>
    useTodoStore.setState(
      produce((state) => {
        state.todos.forEach((todo) => {
          todo.completed = completed;
          todo.updatedAt = new Date().toISOString();
        });
      }),
      false,
      'toggleAllTodos'
    ),

  clearCompleted: () =>
    useTodoStore.setState(
      produce((state) => {
        state.todos = state.todos.filter((todo) => !todo.completed);
      }),
      false,
      'clearCompleted'
    ),

  setFilter: (filter: TodoState['filter']) =>
    useTodoStore.setState({ filter }, false, 'setFilter'),

  setSearchQuery: (searchQuery: string) =>
    useTodoStore.setState({ searchQuery }, false, 'setSearchQuery'),

  getFilteredTodos: () => {
    const state = useTodoStore.getState();
    return state.todos
      .filter((todo) => {
        if (state.filter === 'active') return !todo.completed;
        if (state.filter === 'completed') return todo.completed;
        return true;
      })
      .filter((todo) =>
        todo.text.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
  },

  getTodoStats: () => {
    const state = useTodoStore.getState();
    const total = state.todos.length;
    const completed = state.todos.filter((todo) => todo.completed).length;
    const active = total - completed;
    return { total, completed, active };
  },
};

// 创建一个组合了状态和操作的 hook
export const useTodoStoreWithActions = () => {
  const state = useTodoStore();
  return {
    ...state,
    ...todoActions,
  };
};

export { useTodoStore };
