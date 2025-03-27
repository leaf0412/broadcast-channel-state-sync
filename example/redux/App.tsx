import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { addTodo, toggleTodo, deleteTodo, setFilter } from './store/slices/todo';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { todos, filter } = useSelector((state: RootState) => state.todos);
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      dispatch(addTodo(newTodo.trim()));
      setNewTodo('');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="container">
      <h1>Redux Todo App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加新的待办事项"
        />
        <button type="submit">添加</button>
      </form>
      <div className="filters">
        <button onClick={() => dispatch(setFilter('all'))}>全部</button>
        <button onClick={() => dispatch(setFilter('active'))}>未完成</button>
        <button onClick={() => dispatch(setFilter('completed'))}>已完成</button>
      </div>
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App; 