import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import './TaskEditModal.css';

/**
 * TaskEditModal Component
 *
 * Modal dialog for editing an existing task.
 * Allows editing all task fields: title, description, priority, due date.
 */
function TaskEditModal({ task, onClose, onSuccess, onError }) {
  const { updateTask } = useTasks();

  // Form state - initialized with task data
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Validate form data
   *
   * @returns {Object} - { valid: boolean, errors: Object }
   */
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    // Due date validation - cannot be in the past
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    return { valid: Object.keys(errors).length === 0, errors };
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { valid, errors } = validateForm();
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    // Prepare data for API
    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      dueDate: formData.dueDate || null,
    };

    const result = await updateTask(task.id, taskData);

    setSubmitting(false);

    if (result.success) {
      onSuccess('Task updated successfully!');
      onClose();
    } else {
      onError(result.error);
    }
  };

  /**
   * Get today's date in YYYY-MM-DD format for min attribute
   */
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={fieldErrors.title ? 'error' : ''}
              disabled={submitting}
              maxLength={200}
              autoFocus
            />
            {fieldErrors.title && (
              <span className="field-error">{fieldErrors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              disabled={submitting}
              placeholder="Add a description (optional)"
            />
          </div>

          <div className="form-row-2">
            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={submitting}
                className="priority-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Due date */}
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={getTodayDate()}
                disabled={submitting}
                className={fieldErrors.dueDate ? 'error' : ''}
              />
              {fieldErrors.dueDate && (
                <span className="field-error">{fieldErrors.dueDate}</span>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskEditModal;
