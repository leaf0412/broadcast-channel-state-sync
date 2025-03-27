import { defineStore } from 'pinia';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed',
  }),

  getters: {
    filteredTodos: state => {
      if (state.filter === 'active') {
        return state.todos.filter(todo => !todo.completed);
      } else if (state.filter === 'completed') {
        return state.todos.filter(todo => todo.completed);
      }
      return state.todos;
    },

    totalCount: state => state.todos.length,

    activeCount: state => state.todos.filter(todo => !todo.completed).length,

    completedCount: state => state.todos.filter(todo => todo.completed).length,
  },

  actions: {
    addTodo(text: string) {
      const newTodo: Todo = {
        id: Date.now(),
        text,
        completed: false,
      };
      this.todos.push(newTodo);
    },

    toggleTodo(id: number) {
      const todo = this.todos.find(todo => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    removeTodo(id: number) {
      const index = this.todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        this.todos.splice(index, 1);
      }
    },

    setFilter(filter: 'all' | 'active' | 'completed') {
      this.filter = filter;
    },

    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed);
    },
  },
});
