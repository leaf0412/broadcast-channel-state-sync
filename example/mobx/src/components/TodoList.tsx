import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { todoStore } from '../store/todoStore';

const TodoList: React.FC = observer(() => {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      todoStore.addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      {/* 添加新 Todo */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加
          </button>
        </div>
      </form>

      {/* 过滤器 */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => todoStore.setFilter(filter)}
            className={`px-3 py-1 rounded ${
              todoStore.filter === filter
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {filter === 'all' ? '全部' : filter === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* Todo 列表 */}
      <ul className="space-y-2">
        {todoStore.filteredTodos.map(todo => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => todoStore.toggleTodo(todo.id)}
              className="w-5 h-5"
            />
            <span
              className={`flex-1 ${
                todo.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => todoStore.removeTodo(todo.id)}
              className="px-2 py-1 text-red-500 hover:bg-red-100 rounded"
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {/* 统计信息 */}
      <div className="mt-4 text-sm text-gray-600">
        <span>总计: {todoStore.todos.length} | </span>
        <span>进行中: {todoStore.activeCount} | </span>
        <span>已完成: {todoStore.completedCount}</span>
      </div>
    </div>
  );
});

export default TodoList; 