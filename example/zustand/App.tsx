import React, { useState, useCallback } from 'react';
import { useStoreWithActions } from './store';
import './App.css';

const App: React.FC = () => {
  const {
    todos,
    filter,
    searchQuery,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    toggleAllTodos,
    clearCompleted,
    setFilter,
    setSearchQuery,
    getFilteredTodos,
    getTodoStats,
  } = useStoreWithActions();

  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const stats = getTodoStats();
  const filteredTodos = getFilteredTodos();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newTodo.trim()) {
        addTodo(newTodo.trim());
        setNewTodo('');
      }
    },
    [newTodo, addTodo]
  );

  const handleEdit = useCallback((todo: { id: string; text: string }) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  }, []);

  const handleUpdate = useCallback(
    (id: string) => {
      if (editText.trim()) {
        updateTodo(id, editText.trim());
        setEditingId(null);
        setEditText('');
      }
    },
    [editText, updateTodo]
  );

  return (
    <div className='container'>
      <h1>Zustand Todo App</h1>

      <div className='search-bar'>
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='搜索待办事项...'
          className='search-input'
        />
      </div>

      <form onSubmit={handleSubmit} className='todo-form'>
        <input
          type='text'
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder='添加新的待办事项'
          className='todo-input'
        />
        <button type='submit' className='add-button'>
          添加
        </button>
      </form>

      <div className='filters'>
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          全部 ({stats.total})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
        >
          未完成 ({stats.active})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'active' : ''}
        >
          已完成 ({stats.completed})
        </button>
      </div>

      <div className='todo-actions'>
        <button
          onClick={() => toggleAllTodos(stats.active > 0)}
          className='toggle-all'
        >
          {stats.active > 0 ? '全部完成' : '全部取消'}
        </button>
        {stats.completed > 0 && (
          <button onClick={clearCompleted} className='clear-completed'>
            清除已完成
          </button>
        )}
      </div>

      <ul className='todo-list'>
        {filteredTodos.map(todo => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
          >
            <input
              type='checkbox'
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className='todo-checkbox'
            />
            {editingId === todo.id ? (
              <input
                type='text'
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onBlur={() => handleUpdate(todo.id)}
                onKeyPress={e => e.key === 'Enter' && handleUpdate(todo.id)}
                className='edit-input'
                autoFocus
              />
            ) : (
              <span
                onDoubleClick={() => handleEdit(todo)}
                className='todo-text'
              >
                {todo.text}
              </span>
            )}
            <button
              onClick={() => deleteTodo(todo.id)}
              className='delete-button'
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <div className='todo-stats'>
          <span>总计: {stats.total}</span>
          <span>已完成: {stats.completed}</span>
          <span>未完成: {stats.active}</span>
        </div>
      )}
    </div>
  );
};

export default App;
