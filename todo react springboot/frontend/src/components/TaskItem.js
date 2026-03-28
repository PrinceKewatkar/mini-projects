import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import './TaskItem.css';

/**
 * TaskItem Component
 *
 * Displays a single task with:
 * - Checkbox for completion toggle
 * - Title with strikethrough for completed
 * - Priority badge
 * - Due date
 * - Edit and Delete buttons
 */
function TaskItem({ task, onSuccess, onError, onEdit }) {
  const { toggleComplete, deleteTask } = useTasks();

  // Local state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle completion toggle
   */
  const handleToggleComplete = async () => {
    const result = await toggleComplete(task.id);
    if (result.success) {
      onSuccess(
        result.task.completed
          ? 'Task completed!'
          : 'Task marked as active'
      );
    } else {
      onError(result.error);
    }
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTask(task.id);
    setIsDeleting(false);

    if (result.success) {
      onSuccess('Task deleted');
    } else {
      onError(result.error);
    }
    setShowDeleteConfirm(false);
  };

  /**
   * Format due date for display
   */
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Priority class for styling
  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${task.overdue ? 'overdue' : ''}`}>
      {/* Checkbox for completion */}
      <div className="task-checkbox-wrapper">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="task-checkbox"
          aria-label={task.completed ? 'Mark as active' : 'Mark as complete'}
        />
      </div>

      {/* Task content */}
      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {/* Description if present */}
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {/* Task meta info */}
        <div className="task-meta">
          {/* Due date */}
          {task.dueDate && (
            <span className={`due-date ${task.overdue ? 'overdue' : ''}`}>
              {task.overdue && '⚠️ '}
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="task-actions">
        {!task.completed && (
          <button
            className="task-action-button edit"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            ✏️
          </button>
        )}

        {/* Delete button with confirmation */}
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <button
              className="task-action-button confirm-delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '...' : '✓'}
            </button>
            <button
              className="task-action-button cancel-delete"
              onClick={() => setShowDeleteConfirm(false)}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="task-action-button delete"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete task"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
