const FILTER_ALL = "all";
const FILTER_ACTIVE = "active";
const FILTER_COMPLETED = "completed";
const API_BASE = "/api/todos";

let todos = [];
let currentFilter = FILTER_ALL;

const addForm = document.getElementById("add-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");
const totalCountEl = document.getElementById("total-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const statusBanner = document.getElementById("status-banner");

function showStatus(message, isError = false) {
  if (!statusBanner) {
    return;
  }
  statusBanner.textContent = message;
  statusBanner.hidden = false;
  statusBanner.classList.toggle("is-error", isError);
}

function clearStatus() {
  if (!statusBanner) {
    return;
  }
  statusBanner.hidden = true;
  statusBanner.textContent = "";
  statusBanner.classList.remove("is-error");
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadTodos() {
  todos = await apiRequest(API_BASE);
}

function getActiveCount() {
  return todos.filter((todo) => !todo.isCompleted).length;
}

function getCompletedCount() {
  return todos.filter((todo) => todo.isCompleted).length;
}

function getFilteredTodos() {
  if (currentFilter === FILTER_ACTIVE) {
    return todos.filter((todo) => !todo.isCompleted);
  }
  if (currentFilter === FILTER_COMPLETED) {
    return todos.filter((todo) => todo.isCompleted);
  }
  return todos;
}

function updateFooter() {
  const activeCount = getActiveCount();
  const label = activeCount === 1 ? "item" : "items";
  itemsLeftEl.textContent = `${activeCount} ${label} left`;
  totalCountEl.textContent = `${todos.length} total`;
  clearCompletedBtn.disabled = getCompletedCount() === 0;
}

function createEmptyState() {
  const empty = document.createElement("li");
  empty.className = "empty-state";
  const messages = {
    [FILTER_ALL]: ["No todos yet.", "✨"],
    [FILTER_ACTIVE]: ["All caught up!", "🎉"],
    [FILTER_COMPLETED]: ["Nothing completed yet.", "📋"],
  };
  const [text, icon] = messages[currentFilter];
  empty.innerHTML = `${text}<span>${icon}</span>`;
  return empty;
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = "todo-item";
  item.dataset.id = todo.id;
  if (todo.isCompleted) {
    item.classList.add("is-completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.isCompleted;
  checkbox.setAttribute("aria-label", `Mark "${todo.text}" as complete`);

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-delete";
  deleteBtn.textContent = "Delete";

  item.append(checkbox, text, deleteBtn);
  return item;
}

function renderTodos() {
  todoList.replaceChildren();
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    todoList.append(createEmptyState());
  } else {
    filtered.forEach((todo) => {
      todoList.append(createTodoElement(todo));
    });
  }

  updateFooter();
}

async function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  try {
    clearStatus();
    const created = await apiRequest(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
    todos.unshift(created);
    renderTodos();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function toggleTodo(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) {
    return;
  }

  try {
    clearStatus();
    const updated = await apiRequest(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !todo.isCompleted }),
    });
    todo.isCompleted = updated.isCompleted;
    renderTodos();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function deleteTodo(id) {
  try {
    clearStatus();
    await apiRequest(`${API_BASE}/${id}`, { method: "DELETE" });
    todos = todos.filter((item) => item.id !== id);
    renderTodos();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function clearCompleted() {
  try {
    clearStatus();
    await apiRequest(`${API_BASE}/completed`, { method: "DELETE" });
    todos = todos.filter((item) => !item.isCompleted);
    renderTodos();
  } catch (error) {
    showStatus(error.message, true);
  }
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filter === filter);
  });
  renderTodos();
}

function findTodoId(target) {
  const item = target.closest(".todo-item");
  return item ? item.dataset.id : null;
}

function bindEvents() {
  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = "";
    todoInput.focus();
  });

  todoList.addEventListener("change", (event) => {
    if (!event.target.classList.contains("todo-checkbox")) {
      return;
    }
    const id = findTodoId(event.target);
    if (id) {
      toggleTodo(id);
    }
  });

  todoList.addEventListener("click", (event) => {
    if (!event.target.classList.contains("btn-delete")) {
      return;
    }
    const id = findTodoId(event.target);
    if (id) {
      deleteTodo(id);
    }
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);
}

async function init() {
  bindEvents();
  showStatus("Loading todos…");

  try {
    await loadTodos();
    clearStatus();
    renderTodos();
    todoInput.focus();
  } catch {
    showStatus("Could not load todos. Is the API running?", true);
  }
}

init();
