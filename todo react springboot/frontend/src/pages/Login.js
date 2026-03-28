import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/**
 * Login Page Component
 *
 * Provides user login functionality with username/email and password.
 * Redirects to dashboard on successful login.
 */
function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clear errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormError('');
  }, [formData]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handle form input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.username.trim()) {
      setFormError('Username or email is required');
      return;
    }
    if (!formData.password) {
      setFormError('Password is required');
      return;
    }

    setSubmitting(true);

    const result = await login(formData.username, formData.password);

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to manage your tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Error display */}
          {(formError || error) && (
            <div className="error-message">
              {formError || error}
            </div>
          )}

          {/* Username/Email field */}
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
              disabled={submitting}
              autoComplete="username"
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={submitting}
              autoComplete="current-password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="auth-button"
            disabled={submitting || loading}
          >
            {submitting || loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
