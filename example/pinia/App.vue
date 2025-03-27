<template>
  <div class="app" :class="{ 'dark-theme': isDarkTheme }">
    <div class="container">
      <header>
        <h1>Todo 应用</h1>
        <div class="user-section">
          <input
            v-model="userName"
            @change="updateUserName"
            placeholder="你的名字"
            class="name-input"
          />
          <button @click="toggleTheme" class="theme-toggle">
            {{ isDarkTheme ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <div class="input-section">
        <input
          v-model="newTodo"
          @keyup.enter="addNewTodo"
          placeholder="需要做什么？"
          class="todo-input"
        />
        <button @click="addNewTodo" class="add-button">添加</button>
      </div>

      <div class="filters">
        <button
          @click="setFilter('all')"
          :class="{ active: todoStore.filter === 'all' }"
        >
          全部 ({{ todoStore.totalCount }})
        </button>
        <button
          @click="setFilter('active')"
          :class="{ active: todoStore.filter === 'active' }"
        >
          待完成 ({{ todoStore.activeCount }})
        </button>
        <button
          @click="setFilter('completed')"
          :class="{ active: todoStore.filter === 'completed' }"
        >
          已完成 ({{ todoStore.completedCount }})
        </button>
        <button
          @click="clearCompleted"
          class="clear-completed"
          v-if="todoStore.completedCount > 0"
        >
          清除已完成
        </button>
      </div>

      <ul class="todo-list">
        <li
          v-for="todo in todoStore.filteredTodos"
          :key="todo.id"
          class="todo-item"
        >
          <label :class="{ completed: todo.completed }">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="toggleTodo(todo.id)"
            />
            {{ todo.text }}
          </label>
          <button @click="removeTodo(todo.id)" class="delete-button">✕</button>
        </li>
      </ul>

      <div class="info">
        <p>
          这是使用 Pinia 和 BroadcastChannel API 的多选项卡同步 Todo
          应用。尝试在多个选项卡中打开此应用，以查看状态同步的实际效果！
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue';
import { useTodoStore } from './store/slices/todo';
import { useUserStore } from './store/slices/user';
import { setupStoreSync } from './store/index';

const todoStore = useTodoStore();
const userStore = useUserStore();

const newTodo = ref('');
const userName = computed({
  get: () => userStore.currentUser.name,
  set: value => userStore.setName(value),
});

const isDarkTheme = computed(() => userStore.currentUser.theme === 'dark');

// Setup BroadcastChannel adapter
let adapter: any = null;

onMounted(() => {
  adapter = setupStoreSync();
});

onBeforeUnmount(() => {
  if (adapter) {
    adapter.destroy();
  }
});

function addNewTodo() {
  if (newTodo.value.trim()) {
    todoStore.addTodo(newTodo.value.trim());
    newTodo.value = '';
  }
}

function toggleTodo(id: number) {
  todoStore.toggleTodo(id);
}

function removeTodo(id: number) {
  todoStore.removeTodo(id);
}

function setFilter(filter: 'all' | 'active' | 'completed') {
  todoStore.setFilter(filter);
}

function clearCompleted() {
  todoStore.clearCompleted();
}

function toggleTheme() {
  const newTheme = userStore.currentUser.theme === 'light' ? 'dark' : 'light';
  userStore.setTheme(newTheme);
}

function updateUserName() {
  if (userName.value.trim()) {
    userStore.setName(userName.value);
  }
}
</script>

<style>
:root {
  --bg-color: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
  --highlight-color: #4caf50;
  --input-bg: white;
  --item-bg: white;
}

.dark-theme {
  --bg-color: #222;
  --text-color: #eee;
  --border-color: #444;
  --highlight-color: #66bb6a;
  --input-bg: #333;
  --item-bg: #333;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  color: var(--highlight-color);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--text-color);
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.input-section {
  display: flex;
  margin-bottom: 20px;
}

.todo-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px 0 0 4px;
  background-color: var(--input-bg);
  color: var(--text-color);
}

.add-button {
  padding: 10px 15px;
  background-color: var(--highlight-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button {
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-color);
}

.filters button.active {
  background-color: var(--highlight-color);
  color: white;
  border-color: var(--highlight-color);
}

.clear-completed {
  margin-left: auto;
  background-color: transparent;
  color: #f44336 !important;
  border-color: #f44336 !important;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: var(--item-bg);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.todo-item label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-grow: 1;
}

.todo-item label.completed {
  text-decoration: line-through;
  color: #888;
}

.delete-button {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1;
}

.info {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #888;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}
</style>
