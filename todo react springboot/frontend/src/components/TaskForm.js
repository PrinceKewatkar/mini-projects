import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import './TaskForm.css';

/**
 * TaskForm Component
 *
 * Form for creating a new task.
 * Fields: title, description (optional), priority, due date (optional).
 */
function TaskForm({ onSuccess, onError }) {
  const { createTask } = useTasks();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    const result = await createTask(taskData);

    setSubmitting(false);

    if (result.success) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      setShowAdvanced(false);
      onSuccess('Task created successfully!');
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
    <div className="task-form-container">
      <form onSubmit={handleSubmit} className="task-form">
        {/* Title input */}
        <div className="form-row">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            className={`task-input ${fieldErrors.title ? 'error' : ''}`}
            disabled={submitting}
            maxLength={200}
          />
          <button
            type="submit"
            className="add-button"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        {/* Title error */}
        {fieldErrors.title && (
          <span className="field-error">{fieldErrors.title}</span>
        )}

        {/* Advanced options toggle */}
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼ Less options' : '▶ More options'}
        </button>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="advanced-options">
            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a description (optional)"
                rows={3}
                disabled={submitting}
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
          </div>
        )}
      </form>
    </div>
  );
}

export default TaskForm;
