package com.todo.service;

import com.todo.dto.TaskRequest;
import com.todo.dto.TaskResponse;
import com.todo.exception.BadRequestException;
import com.todo.exception.ResourceNotFoundException;
import com.todo.model.Task;
import com.todo.model.User;
import com.todo.repository.TaskRepository;
import com.todo.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Task Service
 *
 * Handles all task-related business logic:
 * - CRUD operations
 * - Completion toggling
 * - Filtering and sorting
 *
 * Ensures users can only access their own tasks.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get the currently authenticated user
     *
     * @return The authenticated User entity
     * @throws BadRequestException if not authenticated
     */
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    /**
     * Get all tasks for the current user
     *
     * @return List of all tasks sorted by creation date (newest first)
     */
    public List<TaskResponse> getAllTasks() {
        User user = getCurrentUser();
        return taskRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks filtered by completion status
     *
     * @param completed true for completed tasks, false for active tasks
     * @return List of matching tasks
     */
    public List<TaskResponse> getTasksByCompletion(Boolean completed) {
        User user = getCurrentUser();
        return taskRepository.findByUserAndCompletedOrderByCreatedAtDesc(user, completed)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific task by ID
     *
     * @param id The task ID
     * @return The task details
     * @throws ResourceNotFoundException if task not found or belongs to another user
     */
    public TaskResponse getTaskById(Long id) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return TaskResponse.fromEntity(task);
    }

    /**
     * Create a new task
     *
     * @param request Task creation data
     * @return The created task
     * @throws BadRequestException if due date is in the past
     */
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        // Validate due date if provided
        if (request.getDueDate() != null && request.getDueDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Due date cannot be in the past");
        }

        User user = getCurrentUser();

        Task task = new Task(
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getDueDate(),
                user
        );

        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(savedTask);
    }

    /**
     * Update an existing task
     *
     * @param id The task ID to update
     * @param request Updated task data
     * @return The updated task
     * @throws ResourceNotFoundException if task not found
     * @throws BadRequestException if due date is in the past
     */
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        User user = getCurrentUser();

        // Find the task or throw exception
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate due date if provided
        if (request.getDueDate() != null && request.getDueDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Due date cannot be in the past");
        }

        // Update fields
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        Task updatedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(updatedTask);
    }

    /**
     * Delete a task
     *
     * @param id The task ID to delete
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional
    public void deleteTask(Long id) {
        User user = getCurrentUser();

        // Check if task exists and belongs to user
        int deleted = taskRepository.deleteByIdAndUser(id, user);
        if (deleted == 0) {
            throw new ResourceNotFoundException("Task", "id", id);
        }
    }

    /**
     * Toggle task completion status
     *
     * @param id The task ID to toggle
     * @return The updated task with toggled status
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional
    public TaskResponse toggleTaskCompletion(Long id) {
        User user = getCurrentUser();

        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Toggle the completion status
        task.setCompleted(!task.getCompleted());

        Task updatedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(updatedTask);
    }

    /**
     * Get count of tasks by completion status
     * Useful for displaying task counts in UI
     *
     * @param completed Completion status to count
     * @return Number of tasks matching the criteria
     */
    public long getTaskCount(Boolean completed) {
        User user = getCurrentUser();
        return taskRepository.countByUserAndCompleted(user, completed);
    }

    /**
     * Get overdue tasks for the current user
     *
     * @return List of overdue tasks
     */
    public List<TaskResponse> getOverdueTasks() {
        User user = getCurrentUser();
        return taskRepository.findOverdueTasks(user)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
