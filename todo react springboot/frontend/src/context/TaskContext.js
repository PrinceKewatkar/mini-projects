import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskAPI } from '../services/api';

/**
 * Task Context
 *
 * Manages task state and operations across the application.
 * Provides CRUD operations and filtering.
 */

// Filter types
export const FILTER_TYPES = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

// Sort types
export const SORT_TYPES = {
  CREATED_DESC: 'created_desc',
  CREATED_ASC: 'created_asc',
  PRIORITY: 'priority',
  DUE_DATE: 'due_date',
};

// Initial state
const initialState = {
  tasks: [],
  loading: false,
  error: null,
  filter: FILTER_TYPES.ALL,
  sortBy: SORT_TYPES.CREATED_DESC,
};

// Reducer action types
const TASK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_COMPLETE: 'TOGGLE_COMPLETE',
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT',
};

// Reducer function
function taskReducer(state, action) {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case TASK_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case TASK_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case TASK_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload, loading: false, error: null };

    case TASK_ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        loading: false,
        error: null,
      };

    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false,
        error: null,
      };

    case TASK_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        loading: false,
        error: null,
      };

    case TASK_ACTIONS.TOGGLE_COMPLETE:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
        loading: false,
        error: null,
      };

    case TASK_ACTIONS.SET_FILTER:
      return { ...state, filter: action.payload };

    case TASK_ACTIONS.SET_SORT:
      return { ...state, sortBy: action.payload };

    default:
      return state;
  }
}

// Create context
const TaskContext = createContext(null);

/**
 * Task Provider Component
 *
 * Wraps the app and provides task state and operations.
 */
export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  /**
   * Fetch all tasks from the API
   */
  const fetchTasks = useCallback(async () => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await taskAPI.getTasks();
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: response.data });
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to fetch tasks';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: message });
    }
  }, []);

  /**
   * Create a new task
   *
   * @param {Object} taskData - { title, description, priority, dueDate }
   */
  const createTask = useCallback(async (taskData) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await taskAPI.createTask(taskData);
      dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: response.data });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to create task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  /**
   * Update an existing task
   *
   * @param {number} id - Task ID
   * @param {Object} taskData - Updated task data
   */
  const updateTask = useCallback(async (id, taskData) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await taskAPI.updateTask(id, taskData);
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: response.data });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  /**
   * Delete a task
   *
   * @param {number} id - Task ID
   */
  const deleteTask = useCallback(async (id) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });

    try {
      await taskAPI.deleteTask(id);
      dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: id });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to delete task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  /**
   * Toggle task completion status
   *
   * @param {number} id - Task ID
   */
  const toggleComplete = useCallback(async (id) => {
    try {
      const response = await taskAPI.toggleComplete(id);
      dispatch({ type: TASK_ACTIONS.TOGGLE_COMPLETE, payload: { id } });
      return { success: true, task: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  /**
   * Set the current filter
   *
   * @param {string} filter - FILTER_TYPES value
   */
  const setFilter = useCallback((filter) => {
    dispatch({ type: TASK_ACTIONS.SET_FILTER, payload: filter });
  }, []);

  /**
   * Set the current sort option
   *
   * @param {string} sortBy - SORT_TYPES value
   */
  const setSort = useCallback((sortBy) => {
    dispatch({ type: TASK_ACTIONS.SET_SORT, payload: sortBy });
  }, []);

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    dispatch({ type: TASK_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Get filtered and sorted tasks
   *
   * Applies the current filter and sort to the task list.
   */
  const getFilteredTasks = useCallback(() => {
    let filtered = [...state.tasks];

    // Apply filter
    switch (state.filter) {
      case FILTER_TYPES.ACTIVE:
        filtered = filtered.filter((task) => !task.completed);
        break;
      case FILTER_TYPES.COMPLETED:
        filtered = filtered.filter((task) => task.completed);
        break;
      default:
        // All tasks - no filtering
        break;
    }

    // Apply sort
    switch (state.sortBy) {
      case SORT_TYPES.CREATED_ASC:
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case SORT_TYPES.PRIORITY:
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        filtered.sort((a, b) => {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        break;
      case SORT_TYPES.DUE_DATE:
        filtered.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      default:
        // Created desc - default, already sorted by API
        break;
    }

    return filtered;
  }, [state.tasks, state.filter, state.sortBy]);

  /**
   * Get task counts
   */
  const getTaskCounts = useCallback(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const overdue = state.tasks.filter(
      (t) => t.overdue && !t.completed
    ).length;

    return { total, completed, active, overdue };
  }, [state.tasks]);

  const value = {
    ...state,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    setFilter,
    setSort,
    clearError,
    getFilteredTasks,
    getTaskCounts,
    FILTER_TYPES,
    SORT_TYPES,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

/**
 * useTasks Hook
 *
 * Access task context from any component.
 * Must be used within a TaskProvider.
 */
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
