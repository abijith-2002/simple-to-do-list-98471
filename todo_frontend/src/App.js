import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean + Figma themed Todo App
 * Integrates visual tokens and styles from assets/common.css & todo-2102-6.css,
 * while preserving functionality and responsiveness.
 */

// Types
/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {number} createdAt
 */

// Utilities
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// PUBLIC_INTERFACE
function App() {
  /** Persistent state for todos */
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem('todos:v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  /** Input state */
  const [input, setInput] = useState('');
  /** edit state */
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  /** filter state: all | active | completed */
  const [filter, setFilter] = useState('all');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('todos:v1', JSON.stringify(todos));
  }, [todos]);

  // Derived list by filter
  const visibleTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // PUBLIC_INTERFACE
  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const next = { id: uid(), text, completed: false, createdAt: Date.now() };
    setTodos(prev => [next, ...prev]);
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo();
  };

  // PUBLIC_INTERFACE
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // PUBLIC_INTERFACE
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  // PUBLIC_INTERFACE
  const startEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  // PUBLIC_INTERFACE
  const confirmEdit = () => {
    const newText = editingText.trim();
    if (!newText) return;
    setTodos(prev => prev.map(t => (t.id === editingId ? { ...t, text: newText } : t)));
    setEditingId(null);
    setEditingText('');
  };

  // PUBLIC_INTERFACE
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const activeCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);
  const completedCount = todos.length - activeCount;

  return (
    <div className="App ocean-root app-wrap">
      {/* Header styled to resemble Figma header group */}
      <header className="ocean-header header-group" role="banner" aria-label="Application Header">
        <div className="header-bg" />
        <div className="title-wrap header-text">
          <div className="logo style-3">🧭</div>
          <div className="titles">
            <h1 className="app-title header-title typo-4">Tasks</h1>
            <p className="app-subtitle header-subtitle typo-5">
              {completedCount} of {todos.length || 0} completed
            </p>
          </div>
        </div>
      </header>

      <main className="ocean-main canvas-responsive">
        <section className="card style-5">
          <TodoInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
          />

          {/* Small floating action button near input (reference to Figma add-fab) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              className="add-fab"
              onClick={addTodo}
              aria-label="Add task (quick)"
              disabled={!input.trim()}
              title="Quick add"
            >
              <span className="plus-icon" />
            </button>
          </div>

          <TodoList
            items={visibleTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onStartEdit={startEdit}
            editingId={editingId}
            editingText={editingText}
            setEditingText={setEditingText}
            onConfirmEdit={confirmEdit}
            onCancelEdit={cancelEdit}
          />

          <FooterFilters
            filter={filter}
            setFilter={setFilter}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
          />
        </section>
      </main>
    </div>
  );
}

function TodoInput({ value, onChange, onSubmit }) {
  return (
    <form className="todo-input" onSubmit={onSubmit} aria-label="Add Todo">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a new task..."
        aria-label="Todo text"
      />
      <button
        type="submit"
        className="btn-primary"
        aria-label="Add task"
        disabled={!value.trim()}
        title="Add task"
      >
        Add
      </button>
    </form>
  );
}

function TodoList({
  items,
  onToggle,
  onDelete,
  onStartEdit,
  editingId,
  editingText,
  setEditingText,
  onConfirmEdit,
  onCancelEdit
}) {
  if (items.length === 0) {
    return (
      <div className="empty">
        <div className="empty-badge">No tasks</div>
        <p>Add tasks to get started.</p>
      </div>
    );
  }
  return (
    <ul className="todo-list" role="list" aria-label="Todo items">
      {items.map(item => (
        <li key={item.id} className={`todo-item style-12 ${item.completed ? 'done' : ''}`}>
          <div className="left">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggle(item.id)}
                aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
              />
              <span className="checkmark" />
            </label>
            {editingId === item.id ? (
              <input
                className="edit-input"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onConfirmEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                autoFocus
                aria-label="Edit todo text"
              />
            ) : (
              <span className="text typo-9" onDoubleClick={() => onStartEdit(item.id, item.text)}>
                {item.text}
              </span>
            )}
          </div>
          <div className="actions">
            {editingId === item.id ? (
              <>
                <button className="btn-ghost" onClick={onCancelEdit} aria-label="Cancel edit">Cancel</button>
                <button className="btn-accent style-16" onClick={onConfirmEdit} aria-label="Save edit" disabled={!editingText.trim()}>Save</button>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => onStartEdit(item.id, item.text)} aria-label="Edit task">Edit</button>
                <button className="btn-danger" onClick={() => onDelete(item.id)} aria-label="Delete task">Delete</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function FooterFilters({ filter, setFilter, activeCount, completedCount, onClearCompleted }) {
  return (
    <footer className="filters" aria-label="Filters and actions">
      <div className="counts">
        <span><strong>{activeCount}</strong> Active</span>
        <span><strong>{completedCount}</strong> Completed</span>
      </div>
      <div className="filter-buttons" role="group" aria-label="Filter todos">
        <button
          className={`chip ${filter === 'all' ? 'selected' : ''}`}
          onClick={() => setFilter('all')}
          aria-pressed={filter === 'all'}
        >All</button>
        <button
          className={`chip ${filter === 'active' ? 'selected' : ''}`}
          onClick={() => setFilter('active')}
          aria-pressed={filter === 'active'}
        >Active</button>
        <button
          className={`chip ${filter === 'completed' ? 'selected' : ''}`}
          onClick={() => setFilter('completed')}
          aria-pressed={filter === 'completed'}
        >Completed</button>
      </div>
      <div className="actions">
        <button className="btn-secondary" onClick={onClearCompleted} disabled={completedCount === 0}>
          Clear Completed
        </button>
      </div>
    </footer>
  );
}

export default App;
