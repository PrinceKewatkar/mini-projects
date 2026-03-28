import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

/**
 * Auth Context
 *
 * Manages authentication state across the application.
 * Provides user info, login/register/logout functions.
 */

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_USER: 'LOAD_USER',
  LOADING_FALSE: 'LOADING_FALSE',
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOADING_FALSE:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 *
 * Wraps the app and provides auth state and functions.
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Effect: Check for existing token on app load
   *
   * Runs once on mount to restore session from localStorage.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          // Validate token by fetching current user
          const response = await authAPI.getCurrentUser();
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: {
              user: response.data,
              token,
            },
          });
        } catch (error) {
          // Token is invalid - clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.LOADING_FALSE });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOADING_FALSE });
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   *
   * @param {string} username - Username or email
   * @param {string} password - User's password
   */
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.login({ username, password });
      const { token, userId, username: userName, email } = response.data;

      const user = { id: userId, username: userName, email };

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Invalid username/email or password';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });

      return { success: false, error: message };
    }
  };

  /**
   * Register function
   *
   * @param {Object} data - { username, email, password, confirmPassword }
   */
  const register = async (data) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.register(data);
      const { token, userId, username: userName, email } = response.data;

      const user = { id: userId, username: userName, email };

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      let message = 'Registration failed. Please try again.';

      // Handle field-specific validation errors
      if (error.response?.data?.fieldErrors) {
        const fieldErrors = error.response.data.fieldErrors;
        const firstError = Object.values(fieldErrors)[0];
        message = firstError || message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });

      return { success: false, error: message };
    }
  };

  /**
   * Logout function
   *
   * Clears stored auth data and resets state.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  /**
   * Clear error function
   *
   * Useful for clearing errors after showing them to the user.
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Access auth context from any component.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
