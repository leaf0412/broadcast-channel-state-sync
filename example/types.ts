export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
}

export interface TodoActions {
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  toggleAllTodos: (completed: boolean) => void;
  clearCompleted: () => void;
  setFilter: (filter: TodoState['filter']) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTodos: () => Todo[];
  getTodoStats: () => { total: number; completed: number; active: number };
} 