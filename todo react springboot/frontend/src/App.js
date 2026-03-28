import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './styles/App.css';

/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking auth status
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/login" />;
}

/**
 * Public Route Component
 *
 * Wraps routes that should only be accessible when NOT logged in.
 * Redirects to dashboard if user is already authenticated.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking auth status
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Redirect to dashboard if already authenticated
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

/**
 * Main App Component
 *
 * Sets up routing and context providers.
 * All routes are defined here.
 */
function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes - only accessible when logged out */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected routes - require authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
