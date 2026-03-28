import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import TaskEditModal from '../components/TaskEditModal';
import Toast from '../components/Toast';
import './Dashboard.css';

/**
 * Dashboard Page Component
 *
 * Main page for authenticated users to manage their tasks.
 * Displays task list, filters, and create task form.
 */
function Dashboard() {
  const { user, logout } = useAuth();
  const {
    loading,
    error,
    filter,
    setFilter,
    fetchTasks,
    getTaskCounts,
    clearError,
    getFilteredTasks,
  } = useTasks();

  // Modal state for editing tasks
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Handle successful task operations
   */
  const handleTaskSuccess = (message) => {
    showToast(message);
  };

  /**
   * Handle task operation errors
   */
  const handleTaskError = (message) => {
    showToast(message, 'error');
  };

  /**
   * Open edit modal for a task
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  /**
   * Close edit modal
   */
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  // Get task counts for badges
  const counts = getTaskCounts();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Tasks</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Create task section */}
        <section className="create-task-section">
          <TaskForm
            onSuccess={(msg) => handleTaskSuccess(msg)}
            onError={(msg) => handleTaskError(msg)}
          />
        </section>

        {/* Filter and task list section */}
        <section className="tasks-section">
          {/* Filter tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
              <span className="count-badge">{counts.total}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
              <span className="count-badge">{counts.active}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
              <span className="count-badge">{counts.completed}</span>
            </button>
          </div>

          {/* Overdue warning */}
          {counts.overdue > 0 && filter !== 'completed' && (
            <div className="overdue-warning">
              You have {counts.overdue} overdue task{counts.overdue > 1 ? 's' : ''}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}

          {/* Task list */}
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            onSuccess={handleTaskSuccess}
            onError={handleTaskError}
            onEdit={handleEditTask}
          />
        </section>
      </main>

      {/* Edit task modal */}
      {showEditModal && editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={handleCloseEditModal}
          onSuccess={handleTaskSuccess}
          onError={handleTaskError}
        />
      )}

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default Dashboard;
