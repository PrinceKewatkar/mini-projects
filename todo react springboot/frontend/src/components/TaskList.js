import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

/**
 * TaskList Component
 *
 * Displays a list of tasks with loading and empty states.
 * Renders TaskItem for each task.
 */
function TaskList({ tasks, loading, onSuccess, onError, onEdit }) {
  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="task-list-loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  // Empty state
  if (!loading && tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-icon">📝</div>
        <h3>No tasks yet</h3>
        <p>Create your first task using the form above!</p>
      </div>
    );
  }

  // Task list
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onSuccess={onSuccess}
          onError={onError}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default TaskList;
