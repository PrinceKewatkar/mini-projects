import React from 'react';
import './Toast.css';

/**
 * Toast Component
 *
 * Displays brief notification messages.
 * Auto-dismisses after 3 seconds.
 */
function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : '✕'}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  );
}

export default Toast;
