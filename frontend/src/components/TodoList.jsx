import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function TodoList({ token, onLogout }) {
  const authHeader = { Authorization: `Bearer ${token}` };
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [removingIds, setRemovingIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const inputRef = useRef(null);
  const editTitleRef = useRef(null);

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    if (editingId !== null && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks/', { headers: authHeader });
      setTasks(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      await axios.post('/api/tasks/', { title: title.trim(), description: description.trim(), completed: false }, { headers: authHeader });
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (task) => {
    try {
      await axios.patch(`/api/tasks/${task.id}/`, { completed: !task.completed }, { headers: authHeader });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async (task) => {
    if (!editTitle.trim() || !editDescription.trim()) return;
    try {
      await axios.put(`/api/tasks/${task.id}/`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        completed: task.completed,
      }, { headers: authHeader });
      cancelEdit();
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditKeyDown = (e, task) => {
    if (e.key === 'Enter') saveEdit(task);
    if (e.key === 'Escape') cancelEdit();
  };

  const deleteTask = async (id) => {
    setRemovingIds(prev => new Set([...prev, id]));
    setTimeout(async () => {
      try {
        await axios.delete(`/api/tasks/${id}/`, { headers: authHeader });
        await fetchTasks();
      } catch (err) {
        console.error(err);
      } finally {
        setRemovingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }, 320);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'done') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const remaining = tasks.filter(t => !t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="loading-text">—</span>
      </div>
    );
  }

  return (
    <div className="todo-wrapper">
      <div className="todo-container">

        {/* Header */}
        <header className="todo-header">
          <div className="header-meta">
            <span className="today-date">{today}</span>
            <div className="header-right">
              <span className="task-count">
                {completedCount}<em>/{tasks.length}</em>
              </span>
              <button className="logout-btn" onClick={onLogout} aria-label="Logout">
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <path d="M5 2H2v10h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <h1 className="todo-title">TASKS.</h1>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {/* Add Form */}
        <form className="add-form" onSubmit={createTask}>
          <div className="add-inputs">
            <input
              ref={inputRef}
              className="add-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              autoComplete="off"
              spellCheck="false"
            />
            <input
              className="add-input add-input--description"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <button
            className="add-btn"
            type="submit"
            disabled={!title.trim() || !description.trim()}
            aria-label="Add task"
          >
            <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
              <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {/* Filters */}
        <div className="filter-row">
          {[['all', 'All'], ['active', 'Active'], ['done', 'Done']].map(([val, label]) => (
            <button
              key={val}
              className={`filter-btn${filter === val ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(val)}
            >
              {label}
            </button>
          ))}
          <span className="filter-spacer" />
          <span className="remaining-count">{remaining} remaining</span>
        </div>

        <div className="list-divider" />

        {/* Task List */}
        <ul className="task-list" role="list">
          {filteredTasks.length === 0 ? (
            <li className="empty-state">
              {filter === 'done'   ? 'Nothing completed yet.' :
               filter === 'active' ? 'All tasks complete.'    :
                                     'Start by adding a task above.'}
            </li>
          ) : (
            filteredTasks.map(task => (
              <li
                key={task.id}
                className={[
                  'task-item',
                  task.completed           ? 'task-item--done'     : '',
                  editingId === task.id    ? 'task-item--editing'  : '',
                  removingIds.has(task.id) ? 'task-item--removing' : '',
                ].filter(Boolean).join(' ')}
              >
                {editingId === task.id ? (
                  /* ── Edit mode ── */
                  <>
                    <div className="task-edit-fields">
                      <input
                        ref={editTitleRef}
                        className="task-edit-input"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => handleEditKeyDown(e, task)}
                        placeholder="Task title"
                      />
                      <input
                        className="task-edit-input task-edit-input--description"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        onKeyDown={e => handleEditKeyDown(e, task)}
                        placeholder="Description"
                      />
                    </div>
                    <div className="task-edit-actions">
                      <button
                        className="task-edit-save"
                        onClick={() => saveEdit(task)}
                        disabled={!editTitle.trim() || !editDescription.trim()}
                        aria-label="Save"
                      >
                        <svg viewBox="0 0 10 8" fill="none" width="10" height="8">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="task-edit-cancel"
                        onClick={cancelEdit}
                        aria-label="Cancel"
                      >
                        <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── View mode ── */
                  <>
                    <button
                      className={`task-check${task.completed ? ' task-check--checked' : ''}`}
                      onClick={() => toggleTask(task)}
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && (
                        <svg viewBox="0 0 10 8" fill="none" width="10" height="8">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    <div className="task-content">
                      <span className="task-label">{task.title}</span>
                      {task.description && (
                        <span className="task-description">{task.description}</span>
                      )}
                    </div>

                    <div className="task-actions">
                      <button
                        className="task-edit"
                        onClick={() => startEdit(task)}
                        aria-label="Edit task"
                      >
                        <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                          <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="task-delete"
                        onClick={() => deleteTask(task.id)}
                        aria-label="Delete task"
                      >
                        <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

      </div>
    </div>
  );
}

export default TodoList;
